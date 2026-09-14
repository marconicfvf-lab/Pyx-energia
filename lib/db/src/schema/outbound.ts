import { createInsertSchema } from "drizzle-zod";
import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { leadsTable } from "./leads";
import { z } from "zod/v4";

export const campaignStatusValues = ["rascunho", "ativa", "pausada", "concluida"] as const;
export const contactStatusValues = [
  "novo",
  "enviado",
  "respondeu",
  "invalido",
  "optout",
  "falhou",
] as const;

export const campaignStatusEnum = pgEnum("campaign_status", campaignStatusValues);
export const contactStatusEnum = pgEnum("contact_status", contactStatusValues);

export const campaignsTable = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  /** Template with {{nome}}, {{cidade}} and {{negocio}} placeholders. */
  messageTemplate: text("message_template").notNull(),
  status: campaignStatusEnum("status").notNull().default("rascunho"),
  dailyLimit: integer("daily_limit").notNull().default(80),
  minIntervalSeconds: integer("min_interval_seconds").notNull().default(90),
  windowStartHour: integer("window_start_hour").notNull().default(9),
  windowEndHour: integer("window_end_hour").notNull().default(18),
  lastSentAt: timestamp("last_sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const contactsTable = pgTable(
  "contacts",
  {
    id: serial("id").primaryKey(),
    campaignId: integer("campaign_id").references(() => campaignsTable.id, {
      onDelete: "cascade",
    }),
    leadId: integer("lead_id").references(() => leadsTable.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    /** Always stored in E.164 (+55...). */
    phone: text("phone").notNull(),
    city: text("city"),
    business: text("business"),
    status: contactStatusEnum("status").notNull().default("novo"),
    failureReason: text("failure_reason"),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    repliedAt: timestamp("replied_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("contacts_campaign_phone").on(table.campaignId, table.phone)],
);

export const optOutsTable = pgTable(
  "opt_outs",
  {
    id: serial("id").primaryKey(),
    phone: text("phone").notNull(),
    reason: text("reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("opt_outs_phone").on(table.phone)],
);

export const insertCampaignSchema = createInsertSchema(campaignsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertContactSchema = createInsertSchema(contactsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaignsTable.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contactsTable.$inferSelect;
export type OptOut = typeof optOutsTable.$inferSelect;
