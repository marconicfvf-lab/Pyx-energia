import { createInsertSchema } from "drizzle-zod";
import { pgTable, serial, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { leadsTable } from "./leads";
import { z } from "zod/v4";

export const followUpTasksTable = pgTable("follow_up_tasks", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id")
    .notNull()
    .references(() => leadsTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  assignedTo: text("assigned_to"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertFollowUpTaskSchema = createInsertSchema(followUpTasksTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertFollowUpTask = z.infer<typeof insertFollowUpTaskSchema>;
export type FollowUpTask = typeof followUpTasksTable.$inferSelect;