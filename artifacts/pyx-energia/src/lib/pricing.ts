/**
 * Faixas de desconto para contas de baixa tensão. Mantém a mesma regra do
 * backend (artifacts/api-server/src/services/pricing.ts).
 */
export const DISCOUNT_TIERS = [
  { maxBill: 3000, discountPercent: 20 },
  { maxBill: 10000, discountPercent: 32 },
  { maxBill: Number.POSITIVE_INFINITY, discountPercent: 40 },
] as const;

export const MAX_DISCOUNT_PERCENT = 40;

export function discountPercentFor(averageBill: number): number {
  const tier = DISCOUNT_TIERS.find((item) => averageBill <= item.maxBill);
  return tier ? tier.discountPercent : MAX_DISCOUNT_PERCENT;
}

/**
 * O desconto incide só sobre a energia compensada pelos créditos da usina. A
 * taxa mínima de disponibilidade (30/50/100 kWh) continua sendo cobrada pela
 * distribuidora e não recebe desconto.
 */
export const ESTIMATED_TARIFF_PER_KWH = 1;

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

export function compensatedEnergyValue(
  averageBill: number,
  connection: ConnectionType = DEFAULT_CONNECTION,
): number {
  return Math.max(0, averageBill - availabilityCost(connection));
}

export function estimateMonthlySavings(
  averageBill: number,
  connection: ConnectionType = DEFAULT_CONNECTION,
): number {
  return compensatedEnergyValue(averageBill, connection) * (discountPercentFor(averageBill) / 100);
}
