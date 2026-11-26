import { Router, type IRouter } from "express";
import { WhatsappWebhookResponse } from "@workspace/api-zod";
import { env } from "../lib/env";
import { logger } from "../lib/logger";
import { handleInbound, recordOutboundEcho } from "../services/conversations";
import { normalizePhone } from "../services/phone";
import { parseInbound } from "../services/whatsapp";

const router: IRouter = Router();

// Meta verifies the webhook with a GET before sending any message: it expects
// the hub.challenge back when hub.verify_token matches WHATSAPP_WEBHOOK_TOKEN.
router.get("/webhooks/whatsapp", (req, res): void => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (
    mode === "subscribe" &&
    env.webhookToken &&
    token === env.webhookToken &&
    typeof challenge === "string"
  ) {
    res.type("text/plain").send(challenge);
    return;
  }
  res.status(403).json({ error: "Verificação do webhook recusada" });
});

router.post("/webhooks/whatsapp", async (req, res): Promise<void> => {
  if (env.webhookToken && req.query["token"] !== env.webhookToken) {
    res.status(401).json({ error: "Token de webhook inválido" });
    return;
  }
  // On Vercel the function is frozen as soon as the response goes out, so the
  // message is processed first. Errors still answer 200, otherwise the
  // provider retries the same message and it is recorded twice.
  const acknowledge = () => {
    if (!res.headersSent) res.json(WhatsappWebhookResponse.parse({ received: true }));
  };

  const inbound = parseInbound((req.body ?? {}) as Record<string, unknown>);
  if (!inbound) {
    acknowledge();
    return;
  }
  const phone = normalizePhone(inbound.phone);
  if (!phone) {
    logger.warn({ phone: inbound.phone }, "Webhook com telefone inválido");
    acknowledge();
    return;
  }
  try {
    if (inbound.fromMe) {
      await recordOutboundEcho({
        phone,
        text: inbound.text,
        ...(inbound.providerMessageId ? { providerMessageId: inbound.providerMessageId } : {}),
      });
      acknowledge();
      return;
    }
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
  acknowledge();
});

export default router;
