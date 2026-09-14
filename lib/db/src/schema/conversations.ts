import { createInsertSchema } from "drizzle-zod";
import {
  boolean,
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

export const conversationChannelValues = ["whatsapp", "site"] as const;
export const conversationStatusValues = ["bot", "humano", "encerrada"] as const;
export const messageDirectionValues = ["entrada", "saida"] as const;

export const conversationChannelEnum = pgEnum(
  "conversation_channel",
  conversationChannelValues,
);
export const conversationStatusEnum = pgEnum(
  "conversation_status",
  conversationStatusValues,
);
export const messageDirectionEnum = pgEnum(
  "message_direction",
  messageDirectionValues,
);

export const conversationsTable = pgTable(
  "conversations",
  {
    id: serial("id").primaryKey(),
    leadId: integer("lead_id").references(() => leadsTable.id, {
      onDelete: "set null",
    }),
    channel: conversationChannelEnum("channel").notNull(),
    /** Phone in E.164 for WhatsApp, random session id for the site widget. */
    contactKey: text("contact_key").notNull(),
    displayName: text("display_name"),
    status: conversationStatusEnum("status").notNull().default("bot"),
    /** While false the agent stays silent and a human answers. */
    botEnabled: boolean("bot_enabled").notNull().default(true),
    lastInboundAt: timestamp("last_inbound_at", { withTimezone: true }),
    lastOutboundAt: timestamp("last_outbound_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex("conversations_channel_contact_key").on(table.channel, table.contactKey)],
);

export const messagesTable = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id")
    .notNull()
    .references(() => conversationsTable.id, { onDelete: "cascade" }),
  direction: messageDirectionEnum("direction").notNull(),
  body: text("body").notNull(),
  mediaUrl: text("media_url"),
  providerMessageId: text("provider_message_id"),
  fromAgent: boolean("from_agent").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertConversationSchema = createInsertSchema(conversationsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertMessageSchema = createInsertSchema(messagesTable).omit({
  id: true,
  createdAt: true,
});

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversationsTable.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messagesTable.$inferSelect;
