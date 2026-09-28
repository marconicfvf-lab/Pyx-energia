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

export function estimateMonthlySavings(averageBill: number): number {
  return averageBill * (discountPercentFor(averageBill) / 100);
}
