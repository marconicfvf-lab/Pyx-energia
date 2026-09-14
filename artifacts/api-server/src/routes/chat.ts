import { randomUUID } from "node:crypto";
import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { conversationsTable, db, leadsTable } from "@workspace/db";
import { SendChatMessageBody, SendChatMessageResponse } from "@workspace/api-zod";
import { handleInbound } from "../services/conversations";
import { normalizePhone } from "../services/phone";

const router: IRouter = Router();

router.post("/chat/messages", async (req, res): Promise<void> => {
  const parsed = SendChatMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const sessionId = parsed.data.sessionId ?? randomUUID();
  const phone = parsed.data.phone ? normalizePhone(parsed.data.phone) : null;

  const result = await handleInbound({
    channel: "site",
    contactKey: sessionId,
    text: parsed.data.message,
    ...(parsed.data.name ? { displayName: parsed.data.name } : {}),
    ...(phone ? { phone } : {}),
  });

  // A site visitor who typed a phone number becomes reachable on WhatsApp, so
  // the site conversation is promoted to a real lead right away.
  if (phone && !result.leadId) {
    const [lead] = await db
      .insert(leadsTable)
      .values({
        name: parsed.data.name?.trim() || "Contato do chat",
        phone,
        source: "chat-site",
      })
      .onConflictDoNothing()
      .returning();
    if (lead) {
      await db
        .update(conversationsTable)
        .set({ leadId: lead.id })
        .where(eq(conversationsTable.id, result.conversation.id));
    }
  }

  res.json(
    SendChatMessageResponse.parse({
      sessionId,
      conversationId: result.conversation.id,
      reply:
        result.reply ??
        "Já chamei um consultor da PYX para continuar com você por aqui. Um instante!",
      handoff: result.handoff,
      leadId: result.leadId,
    }),
  );
});

export default router;
