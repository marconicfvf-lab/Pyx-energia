import { env } from "../lib/env";
import { logger } from "../lib/logger";

export interface SendResult {
  ok: boolean;
  providerMessageId?: string;
  error?: string;
}

export interface InboundMessage {
  phone: string;
  text: string;
  displayName?: string;
  providerMessageId?: string;
}

async function sendViaEvolution(phone: string, text: string): Promise<SendResult> {
  if (!env.evolutionBaseUrl || !env.evolutionApiKey || !env.evolutionInstance) {
    return { ok: false, error: "Evolution API não configurada" };
  }
  const url = `${env.evolutionBaseUrl.replace(/\/$/, "")}/message/sendText/${env.evolutionInstance}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", apikey: env.evolutionApiKey },
    body: JSON.stringify({ number: phone, text }),
  });
  if (!response.ok) {
    return { ok: false, error: `Evolution API ${response.status}: ${await response.text()}` };
  }
  const payload = (await response.json()) as { key?: { id?: string } };
  return { ok: true, providerMessageId: payload.key?.id };
}

async function sendViaCloud(phone: string, text: string): Promise<SendResult> {
  if (!env.cloudPhoneNumberId || !env.cloudAccessToken) {
    return { ok: false, error: "WhatsApp Cloud API não configurada" };
  }
  const url = `https://graph.facebook.com/v21.0/${env.cloudPhoneNumberId}/messages`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${env.cloudAccessToken}`,
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: phone,
      type: "text",
      text: { body: text },
    }),
  });
  if (!response.ok) {
    return { ok: false, error: `Cloud API ${response.status}: ${await response.text()}` };
  }
  const payload = (await response.json()) as { messages?: Array<{ id?: string }> };
  return { ok: true, providerMessageId: payload.messages?.[0]?.id };
}

/**
 * The provider is swappable because Evolution (unofficial) is cheap for warm
 * conversations while the Meta Cloud API is the safe path for cold outreach.
 */
export async function sendWhatsApp(phone: string, text: string): Promise<SendResult> {
  try {
    switch (env.whatsappProvider) {
      case "evolution":
        return await sendViaEvolution(phone, text);
      case "cloud":
        return await sendViaCloud(phone, text);
      default:
        logger.info({ phone, text }, "WhatsApp em modo log: mensagem não enviada");
        return { ok: true, providerMessageId: `log-${Date.now()}` };
    }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

function readString(source: Record<string, unknown>, key: string): string | undefined {
  const value = source[key];
  return typeof value === "string" ? value : undefined;
}

/** Normalizes the Evolution and Meta Cloud webhook payloads into one shape. */
export function parseInbound(payload: Record<string, unknown>): InboundMessage | null {
  const evolutionData = asRecord(payload["data"]);
  const evolutionKey = asRecord(evolutionData["key"]);
  const remoteJid = readString(evolutionKey, "remoteJid");
  if (remoteJid) {
    if (evolutionKey["fromMe"] === true) return null;
    if (remoteJid.includes("@g.us")) return null;
    const message = asRecord(evolutionData["message"]);
    const extended = asRecord(message["extendedTextMessage"]);
    const text = readString(message, "conversation") ?? readString(extended, "text");
    if (!text) return null;
    return {
      phone: remoteJid.split("@")[0],
      text,
      displayName: readString(evolutionData, "pushName"),
      providerMessageId: readString(evolutionKey, "id"),
    };
  }

  const entry = Array.isArray(payload["entry"]) ? payload["entry"] : [];
  for (const rawEntry of entry) {
    const changes = Array.isArray(asRecord(rawEntry)["changes"]) ? asRecord(rawEntry)["changes"] : [];
    for (const rawChange of changes as unknown[]) {
      const value = asRecord(asRecord(rawChange)["value"]);
      const messages = Array.isArray(value["messages"]) ? value["messages"] : [];
      const contacts = Array.isArray(value["contacts"]) ? value["contacts"] : [];
      const message = asRecord(messages[0]);
      const body = readString(asRecord(message["text"]), "body");
      const from = readString(message, "from");
      if (!body || !from) continue;
      const profile = asRecord(asRecord(contacts[0])["profile"]);
      return {
        phone: from,
        text: body,
        displayName: readString(profile, "name"),
        providerMessageId: readString(message, "id"),
      };
    }
  }
  return null;
}
