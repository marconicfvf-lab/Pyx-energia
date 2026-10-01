import { and, eq, like } from "drizzle-orm";
import {
  activitiesTable,
  db,
  followUpTasksTable,
  leadsTable,
  type Lead,
} from "@workspace/db";
import { env } from "../lib/env";
import { logger } from "../lib/logger";
import { estimateSavings, formatBRL } from "./pricing";
import { sendWhatsApp } from "./whatsapp";

export const HIGH_VALUE_BILL = 5000;

const SEGMENT_LABELS: Record<string, string> = {
  farmacia: "Farmácia",
  clinica: "Clínica",
  mercado: "Supermercado/mercadinho",
  outro: "Outro",
};

function buildAlertText(lead: Lead): string {
  const bill = lead.averageBill ?? 0;
  const identity = `${lead.name}${lead.jobTitle ? ` — ${lead.jobTitle}` : ""}${lead.company ? ` · ${lead.company}` : ""}`;
  const segment = lead.segment ? SEGMENT_LABELS[lead.segment] ?? lead.segment : "";
  const location = [lead.city, lead.state].filter(Boolean).join("/");
  const segmentAndLocation = [segment, location].filter(Boolean).join(" · ");
  const unitCount = lead.unitCount ? ` · ${lead.unitCount} unidades` : "";
  const appUrl = env.appUrl.replace(/\/+$/, "");

  return [
    "Lead de alto consumo na PYX",
    identity,
    ...(segmentAndLocation ? [segmentAndLocation] : []),
    `Conta: ${formatBRL(bill)}/mês${unitCount}`,
    `Economia estimada: ${formatBRL(estimateSavings(bill).monthly)}/mês`,
    `WhatsApp: ${lead.phone}`,
    `${appUrl}/painel`,
  ].join("\n");
}

export async function flagHighValueLead(lead: Lead): Promise<void> {
  if (lead.averageBill == null || lead.averageBill < HIGH_VALUE_BILL) return;

  try {
    const flaggedLead = await db.transaction(async (tx) => {
      const [currentLead] = await tx
        .select()
        .from(leadsTable)
        .where(eq(leadsTable.id, lead.id))
        .for("update");
      if (!currentLead || currentLead.averageBill == null || currentLead.averageBill < HIGH_VALUE_BILL) {
        return null;
      }

      const [existingTask] = await tx
        .select({ id: followUpTasksTable.id })
        .from(followUpTasksTable)
        .where(
          and(
            eq(followUpTasksTable.leadId, currentLead.id),
            like(followUpTasksTable.title, "Ligar agora%"),
          ),
        )
        .limit(1);
      if (existingTask) return null;

      const dueAt = new Date(Date.now() + 15 * 60 * 1000);
      const formattedBill = formatBRL(currentLead.averageBill);
      await tx.insert(followUpTasksTable).values({
        leadId: currentLead.id,
        title: `Ligar agora: conta de ${formattedBill}/mês`,
        dueAt,
      });
      await tx
        .update(leadsTable)
        .set({ nextFollowUpAt: dueAt })
        .where(eq(leadsTable.id, currentLead.id));
      await tx.insert(activitiesTable).values({
        leadId: currentLead.id,
        type: "nota",
        content: `Lead de alto consumo (${formattedBill}/mês) — prioridade de contato.`,
      });
      return currentLead;
    });

    if (!flaggedLead) return;

    const result = await sendWhatsApp(env.alertWhatsapp, buildAlertText(flaggedLead));
    if (!result.ok) {
      logger.error(
        { leadId: flaggedLead.id, error: result.error },
        "Falha ao enviar alerta de lead de alto consumo",
      );
    }
  } catch (error) {
    logger.error(
      { leadId: lead.id, error },
      "Falha ao sinalizar lead de alto consumo",
    );
  }
}
