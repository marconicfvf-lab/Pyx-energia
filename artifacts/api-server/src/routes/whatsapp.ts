import { Router, type IRouter } from "express";
import { WhatsappWebhookResponse } from "@workspace/api-zod";
import { env } from "../lib/env";
import { logger } from "../lib/logger";
import { handleInbound } from "../services/conversations";
import { normalizePhone } from "../services/phone";
import { parseInbound } from "../services/whatsapp";

const router: IRouter = Router();

router.post("/webhooks/whatsapp", async (req, res): Promise<void> => {
  if (env.webhookToken && req.query["token"] !== env.webhookToken) {
    res.status(401).json({ error: "Token de webhook inválido" });
    return;
  }
  // Providers retry aggressively on anything but a fast 200, so the message is
  // acknowledged first and processed after.
  res.json(WhatsappWebhookResponse.parse({ received: true }));

  const inbound = parseInbound((req.body ?? {}) as Record<string, unknown>);
  if (!inbound) return;
  const phone = normalizePhone(inbound.phone);
  if (!phone) {
    logger.warn({ phone: inbound.phone }, "Webhook com telefone inválido");
    return;
  }
  try {
    await handleInbound({
      channel: "whatsapp",
      contactKey: phone,
      phone,
      text: inbound.text,
      ...(inbound.displayName ? { displayName: inbound.displayName } : {}),
      ...(inbound.providerMessageId ? { providerMessageId: inbound.providerMessageId } : {}),
    });
  } catch (error) {
    logger.error({ err: error }, "Falha ao processar mensagem do WhatsApp");
  }
});

export default router;
