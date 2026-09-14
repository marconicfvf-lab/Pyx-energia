import { Router, type IRouter } from "express";
import { and, asc, desc, eq } from "drizzle-orm";
import { conversationsTable, db, messagesTable } from "@workspace/db";
import {
  GetConversationParams,
  GetConversationResponse,
  ListConversationsQueryParams,
  ListConversationsResponse,
  SendConversationMessageBody,
  SendConversationMessageParams,
  SendConversationMessageResponse,
  UpdateConversationBody,
  UpdateConversationParams,
  UpdateConversationResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";
import { recordMessage } from "../services/conversations";
import { sendWhatsApp } from "../services/whatsapp";

const router: IRouter = Router();

router.use(requireAuth);

router.get("/conversations", async (req, res): Promise<void> => {
  const query = ListConversationsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const filters = [];
  if (query.data.channel) filters.push(eq(conversationsTable.channel, query.data.channel));
  if (query.data.status) filters.push(eq(conversationsTable.status, query.data.status));
  const conversations = await db
    .select()
    .from(conversationsTable)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(conversationsTable.updatedAt));
  res.json(ListConversationsResponse.parse(conversations));
});

router.get("/conversations/:id", async (req, res): Promise<void> => {
  const params = GetConversationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "ID de conversa inválido" });
    return;
  }
  const [conversation] = await db
    .select()
    .from(conversationsTable)
    .where(eq(conversationsTable.id, params.data.id));
  if (!conversation) {
    res.status(404).json({ error: "Conversa não encontrada" });
    return;
  }
  const messages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, conversation.id))
    .orderBy(asc(messagesTable.createdAt));
  res.json(GetConversationResponse.parse({ ...conversation, messages }));
});

router.patch("/conversations/:id", async (req, res): Promise<void> => {
  const params = UpdateConversationParams.safeParse(req.params);
  const parsed = UpdateConversationBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: "Requisição inválida" });
    return;
  }
  const [conversation] = await db
    .update(conversationsTable)
    .set(parsed.data)
    .where(eq(conversationsTable.id, params.data.id))
    .returning();
  if (!conversation) {
    res.status(404).json({ error: "Conversa não encontrada" });
    return;
  }
  res.json(UpdateConversationResponse.parse(conversation));
});

router.post("/conversations/:id/messages", async (req, res): Promise<void> => {
  const params = SendConversationMessageParams.safeParse(req.params);
  const parsed = SendConversationMessageBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: "Requisição inválida" });
    return;
  }
  const [conversation] = await db
    .select()
    .from(conversationsTable)
    .where(eq(conversationsTable.id, params.data.id));
  if (!conversation) {
    res.status(404).json({ error: "Conversa não encontrada" });
    return;
  }
  let providerMessageId: string | undefined;
  if (conversation.channel === "whatsapp") {
    const sent = await sendWhatsApp(conversation.contactKey, parsed.data.body);
    if (!sent.ok) {
      res.status(502).json({ error: sent.error ?? "Falha ao enviar mensagem" });
      return;
    }
    providerMessageId = sent.providerMessageId;
  }
  const message = await recordMessage(conversation.id, "saida", parsed.data.body, {
    ...(providerMessageId ? { providerMessageId } : {}),
  });
  res.status(201).json(SendConversationMessageResponse.parse(message));
});

export default router;
