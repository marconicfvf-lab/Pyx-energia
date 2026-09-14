import { and, asc, count, eq, gte } from "drizzle-orm";
import {
  activitiesTable,
  campaignsTable,
  contactsTable,
  conversationsTable,
  db,
  leadsTable,
  optOutsTable,
  type Campaign,
  type Contact,
} from "@workspace/db";
import { getOrCreateConversation, recordMessage } from "./conversations";
import { normalizePhone } from "./phone";
import { sendWhatsApp } from "./whatsapp";
import { logger } from "../lib/logger";

const TIME_ZONE = "America/Recife";

export interface ContactRow {
  name: string;
  phone: string;
  city?: string;
  business?: string;
}

export interface ImportResult {
  imported: number;
  duplicates: number;
  invalid: number;
  optedOut: number;
  errors: string[];
}

export interface DispatchOutcome {
  sent: number;
  skipped: number;
  remaining: number;
  reason: string | null;
}

const HEADER_ALIASES: Record<string, keyof ContactRow> = {
  nome: "name",
  name: "name",
  telefone: "phone",
  celular: "phone",
  whatsapp: "phone",
  phone: "phone",
  cidade: "city",
  city: "city",
  negocio: "business",
  "negócio": "business",
  empresa: "business",
  segmento: "business",
};

function splitCsvLine(line: string): string[] {
  const separator = line.includes(";") && !line.includes(",") ? ";" : ",";
  return line.split(separator).map((cell) => cell.trim().replace(/^"|"$/g, ""));
}

export function parseCsv(csv: string): { rows: ContactRow[]; errors: string[] } {
  const lines = csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const errors: string[] = [];
  if (lines.length === 0) return { rows: [], errors: ["Arquivo vazio"] };

  const header = splitCsvLine(lines[0]).map((cell) => cell.toLowerCase());
  const mapped = header.map((cell) => HEADER_ALIASES[cell]);
  const hasHeader = mapped.includes("phone") || mapped.includes("name");
  const rows: ContactRow[] = [];

  for (const line of hasHeader ? lines.slice(1) : lines) {
    const cells = splitCsvLine(line);
    const row: ContactRow = { name: "", phone: "" };
    if (hasHeader) {
      mapped.forEach((field, index) => {
        if (field && cells[index]) row[field] = cells[index];
      });
    } else {
      // Without a header the convention is nome,telefone[,cidade,negocio].
      row.name = cells[0] ?? "";
      row.phone = cells[1] ?? "";
      if (cells[2]) row.city = cells[2];
      if (cells[3]) row.business = cells[3];
    }
    if (!row.phone) {
      errors.push(`Linha sem telefone: ${line}`);
      continue;
    }
    if (!row.name) row.name = "Contato";
    rows.push(row);
  }
  return { rows, errors };
}

export async function importContacts(
  campaignId: number,
  rows: ContactRow[],
): Promise<ImportResult> {
  const result: ImportResult = { imported: 0, duplicates: 0, invalid: 0, optedOut: 0, errors: [] };
  const seen = new Set<string>();
  const optOuts = new Set(
    (await db.select({ phone: optOutsTable.phone }).from(optOutsTable)).map((row) => row.phone),
  );

  for (const row of rows) {
    const phone = normalizePhone(row.phone);
    if (!phone) {
      result.invalid += 1;
      result.errors.push(`Telefone inválido: ${row.phone}`);
      continue;
    }
    if (optOuts.has(phone)) {
      result.optedOut += 1;
      continue;
    }
    if (seen.has(phone)) {
      result.duplicates += 1;
      continue;
    }
    seen.add(phone);
    const inserted = await db
      .insert(contactsTable)
      .values({
        campaignId,
        name: row.name.trim(),
        phone,
        ...(row.city ? { city: row.city.trim() } : {}),
        ...(row.business ? { business: row.business.trim() } : {}),
      })
      .onConflictDoNothing()
      .returning({ id: contactsTable.id });
    if (inserted.length > 0) result.imported += 1;
    else result.duplicates += 1;
  }
  return result;
}

export function renderTemplate(template: string, contact: Contact): string {
  return template
    .replace(/\{\{\s*nome\s*\}\}/gi, contact.name.split(" ")[0] ?? contact.name)
    .replace(/\{\{\s*nome_completo\s*\}\}/gi, contact.name)
    .replace(/\{\{\s*cidade\s*\}\}/gi, contact.city ?? "sua cidade")
    .replace(/\{\{\s*negocio\s*\}\}/gi, contact.business ?? "seu negócio");
}

function currentHour(): number {
  return Number(
    new Intl.DateTimeFormat("pt-BR", {
      timeZone: TIME_ZONE,
      hour: "numeric",
      hour12: false,
    }).format(new Date()),
  );
}

function startOfToday(): Date {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

async function sentToday(campaignId: number): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(contactsTable)
    .where(and(eq(contactsTable.campaignId, campaignId), gte(contactsTable.sentAt, startOfToday())));
  return Number(row?.value ?? 0);
}

async function pendingCount(campaignId: number): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(contactsTable)
    .where(and(eq(contactsTable.campaignId, campaignId), eq(contactsTable.status, "novo")));
  return Number(row?.value ?? 0);
}

/**
 * Sends a single message for the campaign. Cold outreach is paced one contact
 * at a time so the number keeps a human rhythm and stays inside the limits.
 */
export async function dispatchNext(campaign: Campaign): Promise<DispatchOutcome> {
  const remaining = await pendingCount(campaign.id);
  const base: DispatchOutcome = { sent: 0, skipped: 0, remaining, reason: null };

  if (campaign.status !== "ativa") return { ...base, reason: "Campanha não está ativa" };
  if (remaining === 0) {
    await db
      .update(campaignsTable)
      .set({ status: "concluida" })
      .where(eq(campaignsTable.id, campaign.id));
    return { ...base, reason: "Todos os contatos já foram trabalhados" };
  }

  const hour = currentHour();
  if (hour < campaign.windowStartHour || hour >= campaign.windowEndHour) {
    return { ...base, reason: "Fora da janela de horário comercial" };
  }
  if (await sentToday(campaign.id) >= campaign.dailyLimit) {
    return { ...base, reason: "Limite diário atingido" };
  }
  if (
    campaign.lastSentAt &&
    Date.now() - campaign.lastSentAt.getTime() < campaign.minIntervalSeconds * 1000
  ) {
    return { ...base, reason: "Aguardando o intervalo mínimo entre mensagens" };
  }

  const [contact] = await db
    .select()
    .from(contactsTable)
    .where(and(eq(contactsTable.campaignId, campaign.id), eq(contactsTable.status, "novo")))
    .orderBy(asc(contactsTable.id))
    .limit(1);
  if (!contact) return { ...base, reason: "Nenhum contato pendente" };

  const [optOut] = await db
    .select({ id: optOutsTable.id })
    .from(optOutsTable)
    .where(eq(optOutsTable.phone, contact.phone))
    .limit(1);
  if (optOut) {
    await db
      .update(contactsTable)
      .set({ status: "optout" })
      .where(eq(contactsTable.id, contact.id));
    return { ...base, skipped: 1, remaining: remaining - 1, reason: "Contato na lista de opt-out" };
  }

  const body = `${renderTemplate(campaign.messageTemplate, contact)}\n\nSe não quiser receber mensagens, responda SAIR.`;
  const sent = await sendWhatsApp(contact.phone, body);
  if (!sent.ok) {
    await db
      .update(contactsTable)
      .set({ status: "falhou", failureReason: sent.error ?? "Erro desconhecido" })
      .where(eq(contactsTable.id, contact.id));
    logger.error({ contactId: contact.id, error: sent.error }, "Falha no disparo da campanha");
    return { ...base, skipped: 1, remaining: remaining - 1, reason: sent.error ?? null };
  }

  const [lead] = await db
    .insert(leadsTable)
    .values({
      name: contact.name,
      phone: contact.phone,
      source: `campanha:${campaign.name}`,
      ...(contact.city ? { city: contact.city } : {}),
    })
    .onConflictDoNothing()
    .returning();
  const leadId =
    lead?.id ??
    (
      await db
        .select({ id: leadsTable.id })
        .from(leadsTable)
        .where(eq(leadsTable.phone, contact.phone))
        .limit(1)
    )[0]?.id;

  const conversation = await getOrCreateConversation("whatsapp", contact.phone, contact.name);
  if (leadId && !conversation.leadId) {
    await db
      .update(conversationsTable)
      .set({ leadId })
      .where(eq(conversationsTable.id, conversation.id));
  }
  await recordMessage(conversation.id, "saida", body, {
    fromAgent: true,
    ...(sent.providerMessageId ? { providerMessageId: sent.providerMessageId } : {}),
  });
  if (leadId) {
    await db.insert(activitiesTable).values({
      leadId,
      type: "whatsapp",
      content: `Campanha "${campaign.name}" enviada: ${body}`,
    });
  }
  await db
    .update(contactsTable)
    .set({ status: "enviado", sentAt: new Date(), ...(leadId ? { leadId } : {}) })
    .where(eq(contactsTable.id, contact.id));
  await db
    .update(campaignsTable)
    .set({ lastSentAt: new Date() })
    .where(eq(campaignsTable.id, campaign.id));

  return { sent: 1, skipped: 0, remaining: remaining - 1, reason: null };
}

/** One dispatch pass over every active campaign. */
export async function runCampaignPass(): Promise<void> {
  const campaigns = await db
    .select()
    .from(campaignsTable)
    .where(eq(campaignsTable.status, "ativa"));
  for (const campaign of campaigns) {
    try {
      await dispatchNext(campaign);
    } catch (error) {
      logger.error({ err: error, campaignId: campaign.id }, "Erro no disparo automático");
    }
  }
}

/** Keeps active campaigns flowing without any manual click. */
export function startCampaignScheduler(intervalMs = 30_000): NodeJS.Timeout {
  const timer = setInterval(() => {
    void runCampaignPass();
  }, intervalMs);
  timer.unref();
  return timer;
}
