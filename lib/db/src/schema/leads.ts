import { createInsertSchema } from "drizzle-zod";
import { pgEnum, pgTable, real, serial, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const leadStageValues = [
  "novo",
  "qualificacao",
  "fatura",
  "proposta",
  "documentos",
  "assinatura",
  "ativacao",
  "ganho",
  "perdido",
] as const;

export const customerTypeValues = ["CPF", "CNPJ"] as const;
export const stateValues = ["PE", "CE"] as const;

export const leadStageEnum = pgEnum("lead_stage", leadStageValues);
export const customerTypeEnum = pgEnum("customer_type", customerTypeValues);
export const stateEnum = pgEnum("brazil_state", stateValues);

export const leadsTable = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  customerType: customerTypeEnum("customer_type").notNull(),
  cpfCnpj: text("cpf_cnpj").notNull(),
  state: stateEnum("state").notNull(),
  city: text("city").notNull(),
  distributor: text("distributor").notNull(),
  averageBill: real("average_bill").notNull(),
  estimatedMonthlySavings: real("estimated_monthly_savings").notNull(),
  estimatedAnnualSavings: real("estimated_annual_savings").notNull(),
  source: text("source").notNull().default("calculator"),
  stage: leadStageEnum("stage").notNull().default("novo"),
  consentAt: timestamp("consent_at", { withTimezone: true }).notNull(),
  consentText: text("consent_text").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  nextFollowUpAt: timestamp("next_follow_up_at", { withTimezone: true }),
  notes: text("notes"),
});

export const insertLeadSchema = createInsertSchema(leadsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  consentAt: true,
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leadsTable.$inferSelect;