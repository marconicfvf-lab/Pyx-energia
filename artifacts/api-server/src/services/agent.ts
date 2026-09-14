import { env } from "../lib/env";
import { logger } from "../lib/logger";
import { stripPhones } from "./phone";
import { estimateSavings, formatBRL, parseBillAmount } from "./pricing";

/** Bills below this are typos or the model echoing something else, not a bill. */
const MIN_PLAUSIBLE_BILL = 30;

/**
 * Only amounts written by the lead count; phone numbers are removed first so
 * "(81) 99972-5151" is never read as an amount.
 */
function resolveBill(message: string): number | undefined {
  const typed = parseBillAmount(stripPhones(message));
  return typed && typed >= MIN_PLAUSIBLE_BILL ? typed : undefined;
}

export interface AgentKnownLead {
  name?: string | null;
  hasPhone?: boolean;
  city?: string | null;
  customerType?: "CPF" | "CNPJ" | null;
  distributor?: string | null;
  averageBill?: number | null;
}

export interface AgentTurn {
  role: "lead" | "agente";
  text: string;
}

export interface AgentExtraction {
  name?: string;
  city?: string;
  customerType?: "CPF" | "CNPJ";
  distributor?: string;
  averageBill?: number;
}

export interface AgentResult {
  reply: string;
  extracted: AgentExtraction;
  handoff: boolean;
  qualified: boolean;
}

const HANDOFF_PATTERNS =
  /(falar com (um )?(humano|atendente|pessoa|consultor)|atendimento humano|quero falar com alguem|quero falar com alguém)/i;

function buildSystemPrompt(known: AgentKnownLead): string {
  const { discountPercent } = estimateSavings(1000);
  return [
    "Você é a Sofia, consultora virtual da PYX Energia.",
    "A PYX coloca o cliente em uma usina de energia limpa por assinatura: sem obra, sem placas, sem investimento inicial, e a economia aparece na própria conta de luz.",
    `O desconto padrão praticado hoje é de ${discountPercent}% sobre o valor da conta. Nunca prometa percentual maior nem valores fechados: apresente sempre como estimativa sujeita à análise da fatura.`,
    "Atende clientes em Pernambuco e Ceará (distribuidora Neoenergia).",
    "Objetivo: qualificar o lead coletando, em poucas perguntas e uma de cada vez, nome, cidade, se é CPF ou CNPJ e o valor médio da conta de luz.",
    known.hasPhone === false
      ? "Você ainda não tem o WhatsApp deste lead: depois de apresentar a economia estimada, peça o número de WhatsApp com DDD para enviar a proposta."
      : "Você já tem o WhatsApp do lead; não peça o número novamente.",
    "Quando souber o valor da conta, apresente a economia mensal e anual estimada e convide para enviar a última fatura para a proposta final.",
    "Responda em português do Brasil, com no máximo 3 frases curtas, tom cordial e objetivo, sem emojis em excesso (no máximo um).",
    "Se o lead pedir atendimento humano, demonstrar irritação ou fizer pergunta jurídica/contratual complexa, defina handoff=true e avise que um consultor assume a conversa.",
    `Dados já conhecidos: ${JSON.stringify(known)}.`,
    known.averageBill
      ? `Economia estimada para este lead: ${formatBRL(estimateSavings(known.averageBill).monthly)} por mês e ${formatBRL(estimateSavings(known.averageBill).annual)} por ano. Use exatamente esses valores.`
      : "Você ainda não sabe o valor da conta deste lead: pergunte e não apresente nenhuma estimativa de economia até receber o valor.",
    "Nunca invente dados do cliente. Só cite o valor da conta, a cidade ou a economia se esses dados estiverem na lista de dados conhecidos ou tiverem sido informados pelo lead nesta conversa; caso contrário, pergunte.",
  ].join("\n");
}

interface GeminiPayload {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
}

async function callGemini(
  known: AgentKnownLead,
  history: AgentTurn[],
  message: string,
): Promise<AgentResult | null> {
  if (!env.geminiApiKey) return null;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.geminiModel}:generateContent`;
  const contents = [...history, { role: "lead" as const, text: message }].map((turn) => ({
    role: turn.role === "lead" ? "user" : "model",
    parts: [{ text: turn.text }],
  }));

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": env.geminiApiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: buildSystemPrompt(known) }] },
        contents,
        generationConfig: {
          temperature: 0.4,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              reply: { type: "string" },
              handoff: { type: "boolean" },
              qualified: { type: "boolean" },
            },
            required: ["reply", "handoff", "qualified"],
          },
        },
      }),
    });
    if (!response.ok) {
      logger.warn({ status: response.status }, "Gemini respondeu com erro");
      return null;
    }
    const payload = (await response.json()) as GeminiPayload;
    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;
    const parsed = JSON.parse(text) as Partial<AgentResult>;
    if (!parsed.reply) return null;
    // Lead fields never come from the model: it hallucinates bills and cities.
    return {
      reply: parsed.reply,
      handoff: Boolean(parsed.handoff),
      qualified: Boolean(parsed.qualified),
      extracted: {},
    };
  } catch (error) {
    logger.warn({ err: error }, "Falha ao consultar o Gemini");
    return null;
  }
}

/** Keeps free-form text out of lead fields (a city is a word, not a sentence). */
function sanitizeLabel(value?: string): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed || !/^[\p{L}][\p{L}\s'.-]{1,40}$/u.test(trimmed)) return undefined;
  return trimmed;
}

const NOT_A_NAME =
  /^(oi|ola|olá|bom dia|boa tarde|boa noite|sim|nao|não|ok|obrigado|obrigada|quero|quanto|economia|energia|teste)$/i;

/** Words that end a name in a sentence like "meu nome é Lucas e meu whatsapp é...". */
const NAME_STOP_WORDS =
  /^(e|ou|mas|que|meu|minha|moro|sou|tel|telefone|celular|whatsapp|zap|numero|número|conta|cidade)$/i;

function extractName(message: string): string | undefined {
  if (NOT_A_NAME.test(message.trim())) return undefined;
  const explicit = /(?:meu nome (?:é|e)|me chamo|sou (?:o|a)|aqui (?:é|e) (?:o|a))\s+([\p{L}][\p{L}\s']{1,40})/iu.exec(
    message,
  );
  const candidate = explicit?.[1] ?? (/^[\p{L}][\p{L}\s']{1,30}$/u.test(message.trim()) ? message : undefined);
  if (!candidate) return undefined;
  const words = candidate.trim().split(/\s+/);
  const end = words.findIndex((word) => NAME_STOP_WORDS.test(word));
  const cleaned = (end === -1 ? words : words.slice(0, end))
    .slice(0, 3)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
  return cleaned.length >= 2 ? cleaned : undefined;
}

function extractCity(message: string): string | undefined {
  const match =
    /(?:moro em|sou de|aqui (?:é|e) (?:de|em)|minha cidade (?:é|e)|cidade:|estou em)\s+([\p{L}][\p{L}\s']{2,30})/iu.exec(
      message,
    );
  const candidate = match?.[1]?.split(/[,.;]|\be\b/)[0];
  return sanitizeLabel(candidate);
}

/** Reads the lead fields straight from what the lead typed. */
function extractFields(known: AgentKnownLead, message: string): AgentExtraction {
  const extracted: AgentExtraction = {};
  if (!known.name) {
    const name = extractName(message);
    if (name) extracted.name = name;
  }
  if (!known.city) {
    const city = extractCity(message);
    if (city) extracted.city = city;
  }
  const bill = resolveBill(message);
  if (bill && !known.averageBill) extracted.averageBill = bill;
  if (/cnpj|empresa|comercio|comércio|loja|industria|indústria/i.test(message)) {
    extracted.customerType = "CNPJ";
  } else if (/cpf|residencia|residência|casa|apartamento/i.test(message)) {
    extracted.customerType = "CPF";
  }
  return extracted;
}

/**
 * Deterministic script used when Gemini is unavailable, so the funnel keeps
 * qualifying leads instead of going silent.
 */
function scriptedReply(known: AgentKnownLead, message: string): AgentResult {
  const extracted = extractFields(known, message);

  const name = known.name ?? extracted.name;
  const averageBill = known.averageBill ?? extracted.averageBill;

  if (HANDOFF_PATTERNS.test(message)) {
    return {
      reply: "Claro! Já estou chamando um consultor da PYX para falar com você por aqui.",
      extracted,
      handoff: true,
      qualified: false,
    };
  }
  if (!name) {
    return {
      reply:
        "Oi! Aqui é a Sofia, da PYX Energia. Posso te mostrar quanto dá para economizar na conta de luz sem obra nem investimento. Como é o seu nome?",
      extracted,
      handoff: false,
      qualified: false,
    };
  }
  if (!averageBill) {
    return {
      reply: `Perfeito, ${name}. Qual é o valor médio da sua conta de luz por mês?`,
      extracted,
      handoff: false,
      qualified: false,
    };
  }
  const savings = estimateSavings(averageBill);
  if (known.hasPhone === false) {
    return {
      reply: `Com uma conta de ${formatBRL(averageBill)}, a economia estimada é de ${formatBRL(savings.monthly)} por mês (${formatBRL(savings.annual)} por ano). Me passa seu WhatsApp com DDD que eu envio a proposta e os próximos passos.`,
      extracted,
      handoff: false,
      qualified: true,
    };
  }
  return {
    reply: `Com uma conta de ${formatBRL(averageBill)}, a economia estimada é de ${formatBRL(savings.monthly)} por mês (${formatBRL(savings.annual)} por ano), com ${savings.discountPercent}% de desconto. Me envia uma foto da última fatura que eu fecho a proposta exata.`,
    extracted,
    handoff: false,
    qualified: true,
  };
}

export async function runAgent(
  known: AgentKnownLead,
  history: AgentTurn[],
  message: string,
): Promise<AgentResult> {
  const fallback = scriptedReply(known, message);
  if (HANDOFF_PATTERNS.test(message)) return fallback;
  // The model sees what this turn revealed, so it never has to guess a value.
  const enriched: AgentKnownLead = { ...known, ...fallback.extracted };
  const generated = await callGemini(enriched, history, message);
  if (!generated) return fallback;
  return {
    ...generated,
    extracted: fallback.extracted,
  };
}
