import { env } from "../lib/env";
import { logger } from "../lib/logger";

/**
 * Encaminha o lead do site para o CRM do Skip (PocketBase).
 *
 * O site grava o lead no seu próprio banco; este serviço replica no Skip, que é
 * onde o Marconi trabalha. A chamada é "best effort": se o Skip estiver fora ou
 * recusar, o lead continua salvo no site e o erro só vai para o log — nunca
 * derruba o formulário do cliente.
 *
 * A coleção `leads` do Skip aceita criação pública quando
 * `source = 'site'` e `status = 'novo'` (regra de criação da coleção), então
 * não é preciso token.
 */

const PRIORIDADE = {
  alto: "Alta",
  medio: "Média",
  baixo: "Baixa",
} as const;

export interface LeadParaSkip {
  name: string;
  phone: string;
  company?: string | null;
  jobTitle?: string | null;
  state?: string | null;
  city?: string | null;
  distributor?: string | null;
  averageBill?: number | null;
  estimatedMonthlySavings?: number | null;
  segment?: string | null;
  unitCount?: number | null;
  source: string;
  cpfCnpj?: string | null;
}

/** Prioridade a partir da conta: acima de R$ 5 mil é Alta, acima de R$ 1 mil Média. */
function prioridadePorConta(valor: number | null | undefined): string {
  const v = Number(valor ?? 0);
  if (v >= 5000) return PRIORIDADE.alto;
  if (v >= 1000) return PRIORIDADE.medio;
  return PRIORIDADE.baixo;
}

/** Resumo legível do que o cliente simulou no site, para a ficha do CRM. */
function resumoSimulacao(lead: LeadParaSkip): string {
  const partes: string[] = [];
  if (lead.averageBill) partes.push(`conta ${lead.averageBill}`);
  if (lead.estimatedMonthlySavings) partes.push(`economia ${lead.estimatedMonthlySavings}`);
  if (lead.segment) partes.push(`segmento ${lead.segment}`);
  if (lead.unitCount) partes.push(`${lead.unitCount} unidades`);
  if (lead.distributor) partes.push(lead.distributor);
  partes.push(`origem ${lead.source}`);
  return `site | ${partes.join(" | ")}`.slice(0, 2000);
}

export async function enviarLeadParaSkip(lead: LeadParaSkip): Promise<boolean> {
  if (!env.skipCrmUrl) {
    logger.info("skip crm: SKIP_CRM_URL não configurada, lead não replicado");
    return false;
  }

  const url = `${env.skipCrmUrl.replace(/\/+$/, "")}/api/collections/leads/records`;
  const payload = {
    company_name: (lead.company || lead.name || "Lead do site").slice(0, 200),
    network: "",
    contact_name: (lead.jobTitle ? `${lead.name} — ${lead.jobTitle}` : lead.name).slice(0, 160),
    phone: (lead.phone || "").slice(0, 40),
    cnpj: (lead.cpfCnpj || "").slice(0, 24),
    city: (lead.city || "").slice(0, 120),
    state: (lead.state || "").slice(0, 2).toUpperCase(),
    priority: prioridadePorConta(lead.averageBill),
    status: "novo",
    // Valores exigidos pela regra de criação pública da coleção no Skip.
    source: "site",
    site_simulation: resumoSimulacao(lead),
  };

  try {
    const resposta = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });
    if (!resposta.ok) {
      logger.warn("skip crm: recusou o lead", {
        status: resposta.status,
        corpo: (await resposta.text()).slice(0, 200),
      });
      return false;
    }
    logger.info("skip crm: lead replicado", { telefone: lead.phone });
    return true;
  } catch (erro) {
    logger.warn("skip crm: falha ao replicar lead", {
      erro: erro instanceof Error ? erro.message : String(erro),
    });
    return false;
  }
}
