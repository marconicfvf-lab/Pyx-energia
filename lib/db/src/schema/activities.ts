import { createInsertSchema } from "drizzle-zod";
import { pgEnum, pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { leadsTable } from "./leads";
import { z } from "zod/v4";

export const activityTypeValues = ["nota", "ligacao", "whatsapp", "email", "mudanca_etapa"] as const;
export const activityTypeEnum = pgEnum("activity_type", activityTypeValues);

export const activitiesTable = pgTable("activities", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id")
    .notNull()
    .references(() => leadsTable.id, { onDelete: "cascade" }),
  type: activityTypeEnum("type").notNull().default("nota"),
  content: text("content").notNull(),
  authorId: text("author_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertActivitySchema = createInsertSchema(activitiesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activitiesTable.$inferSelect;