/**
 * Faixas de desconto para contas de baixa tensão. Mantém a mesma regra do
 * backend (artifacts/api-server/src/services/pricing.ts).
 *
 * REGRA DE BASE (definida pelo Marconi em 11/11/2026):
 * o desconto NÃO incide sobre a fatura cheia. Saem da base:
 *   - taxa mínima de disponibilidade (30/50/100 kWh por fase)
 *   - iluminação pública municipal
 *   - impostos (ICMS/PIS/COFINS destacados na fatura)
 * A BANDEIRA TARIFÁRIA PERMANECE na base — ela é energia, não tributo.
 */
export const DISCOUNT_TIERS = [
  { maxBill: 3000, discountPercent: 25 },
  { maxBill: 5000, discountPercent: 30 },
  { maxBill: 10000, discountPercent: 35 },
  { maxBill: Number.POSITIVE_INFINITY, discountPercent: 40 },
] as const;

export const MAX_DISCOUNT_PERCENT = 40;

export function discountPercentFor(averageBill: number): number {
  const tier = DISCOUNT_TIERS.find((item) => averageBill <= item.maxBill);
  return tier ? tier.discountPercent : MAX_DISCOUNT_PERCENT;
}

/**
 * Tarifa de referência quando não há fatura para ler.
 * Calibrada em R$ 1,0821/kWh — média real medida em 9 faturas Neoenergia (out/2026).
 */
export const ESTIMATED_TARIFF_PER_KWH = 1.0821;

/**
 * Parcela da fatura que NÃO é energia e portanto não recebe desconto.
 * Iluminação pública: 11% a 16% da fatura nas 9 faturas medidas (média 15,5%
 * nas contas pequenas; 5,4% na Unimed Madalena). Usamos 8% como estimativa
 * conservadora para contas médias e grandes, onde o peso do IP cai.
 */
export const NON_ENERGY_SHARE = 0.08;

export const MINIMUM_KWH_BY_CONNECTION = {
  monofasica: 30,
  bifasica: 50,
  trifasica: 100,
} as const;

export type ConnectionType = keyof typeof MINIMUM_KWH_BY_CONNECTION;

export const DEFAULT_CONNECTION: ConnectionType = "trifasica";

export function availabilityCost(connection: ConnectionType = DEFAULT_CONNECTION): number {
  return MINIMUM_KWH_BY_CONNECTION[connection] * ESTIMATED_TARIFF_PER_KWH;
}

/**
 * Energia compensada = fatura − taxa mínima − iluminação pública − impostos.
 * O IP e os impostos entram como estimativa percentual (NON_ENERGY_SHARE),
 * porque o simulador não tem a fatura em mãos.
 */
export function compensatedEnergyValue(
  averageBill: number,
  connection: ConnectionType = DEFAULT_CONNECTION,
): number {
  const naoEnergia = averageBill * NON_ENERGY_SHARE;
  return Math.max(0, averageBill - availabilityCost(connection) - naoEnergia);
}

export function estimateMonthlySavings(
  averageBill: number,
  connection: ConnectionType = DEFAULT_CONNECTION,
): number {
  return compensatedEnergyValue(averageBill, connection) * (discountPercentFor(averageBill) / 100);
}
