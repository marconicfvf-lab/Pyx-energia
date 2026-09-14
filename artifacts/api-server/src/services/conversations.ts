import { and, desc, eq } from "drizzle-orm";
import {
  activitiesTable,
  contactsTable,
  conversationsTable,
  db,
  followUpTasksTable,
  leadsTable,
  messagesTable,
  optOutsTable,
  type Conversation,
  type Lead,
  type Message,
} from "@workspace/db";
import { runAgent, type AgentTurn } from "./agent";
import { extractPhone } from "./phone";
import { estimateSavings } from "./pricing";
import { sendWhatsApp } from "./whatsapp";
import { logger } from "../lib/logger";

const OPT_OUT_PATTERN = /^\s*(sair|parar|pare|stop|descadastrar|nao quero|não quero)\b/i;
const HISTORY_LIMIT = 20;
const FOLLOW_UP_HOURS = 24;

/** Site visitors are tracked before they share a number, so the lead still lands in the CRM. */
const pendingPhone = (conversationId: number) => `site:${conversationId}`;
const isPendingPhone = (phone: string) => phone.startsWith("site:");

export interface InboundResult {
  conversation: Conversation;
  reply: string | null;
  handoff: boolean;
  leadId: number | null;
}

export async function getOrCreateConversation(
  channel: "whatsapp" | "site",
  contactKey: string,
  displayName?: string,
): Promise<Conversation> {
  const [existing] = await db
    .select()
    .from(conversationsTable)
    .where(
      and(eq(conversationsTable.channel, channel), eq(conversationsTable.contactKey, contactKey)),
    )
    .limit(1);
  if (existing) {
    if (displayName && !existing.displayName) {
      const [updated] = await db
        .update(conversationsTable)
        .set({ displayName })
        .where(eq(conversationsTable.id, existing.id))
        .returning();
      return updated ?? existing;
    }
    return existing;
  }
  const [created] = await db
    .insert(conversationsTable)
    .values({ channel, contactKey, ...(displayName ? { displayName } : {}) })
    .returning();
  if (!created) throw new Error("Não foi possível criar a conversa");
  return created;
}

export async function recordMessage(
  conversationId: number,
  direction: "entrada" | "saida",
  body: string,
  options: { fromAgent?: boolean; providerMessageId?: string } = {},
): Promise<Message> {
  const [message] = await db
    .insert(messagesTable)
    .values({
      conversationId,
      direction,
      body,
      fromAgent: options.fromAgent ?? false,
      ...(options.providerMessageId ? { providerMessageId: options.providerMessageId } : {}),
    })
    .returning();
  await db
    .update(conversationsTable)
    .set(
      direction === "entrada"
        ? { lastInboundAt: new Date() }
        : { lastOutboundAt: new Date() },
    )
    .where(eq(conversationsTable.id, conversationId));
  if (!message) throw new Error("Não foi possível registrar a mensagem");
  return message;
}

export async function isOptedOut(phone: string): Promise<boolean> {
  const [row] = await db
    .select({ id: optOutsTable.id })
    .from(optOutsTable)
    .where(eq(optOutsTable.phone, phone))
    .limit(1);
  return Boolean(row);
}

async function registerOptOut(phone: string): Promise<void> {
  await db.insert(optOutsTable).values({ phone, reason: "Solicitado pelo contato" }).onConflictDoNothing();
  await db
    .update(contactsTable)
    .set({ status: "optout" })
    .where(eq(contactsTable.phone, phone));
}

async function ensureLead(
  conversation: Conversation,
  fallbackName: string,
  phone: string,
  source: string,
): Promise<Lead | null> {
  if (conversation.leadId) {
    const [lead] = await db.select().from(leadsTable).where(eq(leadsTable.id, conversation.leadId));
    if (lead) return lead;
  }
  if (!phone) return null;
  const [existing] = await db.select().from(leadsTable).where(eq(leadsTable.phone, phone)).limit(1);
  const lead =
    existing ??
    (
      await db
        .insert(leadsTable)
        .values({ name: fallbackName, phone, source })
        .onConflictDoNothing()
        .returning()
    )[0];
  if (!lead) return null;
  await db
    .update(conversationsTable)
    .set({ leadId: lead.id })
    .where(eq(conversationsTable.id, conversation.id));
  return lead;
}

async function loadHistory(conversationId: number): Promise<AgentTurn[]> {
  const rows = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, conversationId))
    .orderBy(desc(messagesTable.createdAt))
    .limit(HISTORY_LIMIT);
  return rows
    .reverse()
    .map((row) => ({ role: row.direction === "entrada" ? "lead" : "agente", text: row.body }));
}

async function scheduleFollowUp(leadId: number, title: string, hours: number): Promise<void> {
  const [pending] = await db
    .select({ id: followUpTasksTable.id })
    .from(followUpTasksTable)
    .where(and(eq(followUpTasksTable.leadId, leadId), eq(followUpTasksTable.completed, false)))
    .limit(1);
  if (pending) return;
  const dueAt = new Date(Date.now() + hours * 60 * 60 * 1000);
  await db.insert(followUpTasksTable).values({ leadId, title, dueAt });
  await db.update(leadsTable).set({ nextFollowUpAt: dueAt }).where(eq(leadsTable.id, leadId));
}

async function advanceStage(lead: Lead, stage: Lead["stage"]): Promise<void> {
  const order = [
    "novo",
    "qualificacao",
    "fatura",
    "proposta",
    "documentos",
    "assinatura",
    "ativacao",
  ];
  const current = order.indexOf(lead.stage);
  const next = order.indexOf(stage);
  if (current < 0 || next <= current) return;
  await db.update(leadsTable).set({ stage }).where(eq(leadsTable.id, lead.id));
  await db.insert(activitiesTable).values({
    leadId: lead.id,
    type: "mudanca_etapa",
    content: `Etapa alterada de ${lead.stage} para ${stage} pelo robô.`,
  });
}

export async function handleInbound(input: {
  channel: "whatsapp" | "site";
  contactKey: string;
  text: string;
  displayName?: string;
  phone?: string;
  providerMessageId?: string;
}): Promise<InboundResult> {
  const conversation = await getOrCreateConversation(
    input.channel,
    input.contactKey,
    input.displayName,
  );
  await recordMessage(conversation.id, "entrada", input.text, {
    ...(input.providerMessageId ? { providerMessageId: input.providerMessageId } : {}),
  });

  const phone =
    input.phone ??
    (input.channel === "whatsapp" ? input.contactKey : (extractPhone(input.text) ?? ""));

  if (phone) {
    await db
      .update(contactsTable)
      .set({ status: "respondeu", repliedAt: new Date() })
      .where(and(eq(contactsTable.phone, phone), eq(contactsTable.status, "enviado")));
  }

  if (phone && OPT_OUT_PATTERN.test(input.text)) {
    await registerOptOut(phone);
    const reply = "Tudo bem, não vamos mais te enviar mensagens. Obrigado!";
    await db
      .update(conversationsTable)
      .set({ botEnabled: false, status: "encerrada" })
      .where(eq(conversationsTable.id, conversation.id));
    await recordMessage(conversation.id, "saida", reply, { fromAgent: true });
    if (input.channel === "whatsapp") await sendWhatsApp(phone, reply);
    return { conversation, reply, handoff: false, leadId: conversation.leadId };
  }

  const lead = await ensureLead(
    conversation,
    input.displayName?.trim() || "Contato sem nome",
    phone || pendingPhone(conversation.id),
    input.channel === "whatsapp" ? "whatsapp" : "chat-site",
  );

  if (lead && phone && isPendingPhone(lead.phone)) {
    const [conflict] = await db
      .select({ id: leadsTable.id })
      .from(leadsTable)
      .where(eq(leadsTable.phone, phone))
      .limit(1);
    if (!conflict) {
      await db.update(leadsTable).set({ phone }).where(eq(leadsTable.id, lead.id));
      lead.phone = phone;
    }
  }

  if (!conversation.botEnabled || conversation.status === "humano") {
    return { conversation, reply: null, handoff: true, leadId: lead?.id ?? null };
  }

  const history = await loadHistory(conversation.id);
  history.pop();
  const result = await runAgent(
    {
      name: lead?.name === "Contato sem nome" ? null : (lead?.name ?? null),
      hasPhone: lead ? !isPendingPhone(lead.phone) : Boolean(phone),
      city: lead?.city ?? null,
      customerType: lead?.customerType ?? null,
      distributor: lead?.distributor ?? null,
      averageBill: lead?.averageBill ?? null,
    },
    history,
    input.text,
  );

  if (lead) {
    const updates: Partial<typeof leadsTable.$inferInsert> = {};
    if (result.extracted.name && lead.name === "Contato sem nome") {
      updates.name = result.extracted.name;
    }
    if (result.extracted.city && !lead.city) updates.city = result.extracted.city;
    if (result.extracted.customerType && !lead.customerType) {
      updates.customerType = result.extracted.customerType;
    }
    if (result.extracted.distributor && !lead.distributor) {
      updates.distributor = result.extracted.distributor;
    }
    if (result.extracted.averageBill && !lead.averageBill) {
      const savings = estimateSavings(result.extracted.averageBill);
      updates.averageBill = result.extracted.averageBill;
      updates.estimatedMonthlySavings = savings.monthly;
      updates.estimatedAnnualSavings = savings.annual;
    }
    if (Object.keys(updates).length > 0) {
      await db.update(leadsTable).set(updates).where(eq(leadsTable.id, lead.id));
    }
    await db.insert(activitiesTable).values({
      leadId: lead.id,
      type: "whatsapp",
      content: `${input.channel === "site" ? "Chat do site" : "WhatsApp"} — lead: ${input.text}`,
    });
    const ready =
      Boolean(lead.averageBill ?? result.extracted.averageBill) &&
      Boolean(lead.city ?? result.extracted.city);
    await advanceStage(lead, result.qualified && ready ? "proposta" : "qualificacao");
    await scheduleFollowUp(
      lead.id,
      result.handoff ? "Assumir conversa do robô" : "Retomar conversa do robô",
      result.handoff ? 1 : FOLLOW_UP_HOURS,
    );
  }

  if (result.handoff) {
    await db
      .update(conversationsTable)
      .set({ botEnabled: false, status: "humano" })
      .where(eq(conversationsTable.id, conversation.id));
  }

  let providerMessageId: string | undefined;
  if (input.channel === "whatsapp" && phone) {
    const sent = await sendWhatsApp(phone, result.reply);
    if (!sent.ok) logger.error({ phone, error: sent.error }, "Falha ao enviar resposta no WhatsApp");
    providerMessageId = sent.providerMessageId;
  }
  await recordMessage(conversation.id, "saida", result.reply, {
    fromAgent: true,
    ...(providerMessageId ? { providerMessageId } : {}),
  });

  const [refreshed] = await db
    .select()
    .from(conversationsTable)
    .where(eq(conversationsTable.id, conversation.id));

  return {
    conversation: refreshed ?? conversation,
    reply: result.reply,
    handoff: result.handoff,
    leadId: lead?.id ?? null,
  };
}
