export interface SavingsEstimate {
  discountPercent: number;
  monthly: number;
  annual: number;
}

/** Faixas de desconto por valor médio da conta (baixa tensão). */
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

/** Single source of truth for the discount offered to a lead. */
export function estimateSavings(averageBill: number): SavingsEstimate {
  const discountPercent = discountPercentFor(averageBill);
  const monthly = Math.round(averageBill * (discountPercent / 100) * 100) / 100;
  return { discountPercent, monthly, annual: Math.round(monthly * 12 * 100) / 100 };
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Parses "R$ 1.200,50", "1200", "1,2 mil" style answers into a number. */
export function parseBillAmount(text: string): number | null {
  const match = text.replace(/\s/g, "").match(/(\d{1,3}(?:\.\d{3})+|\d+)(,\d{1,2})?/);
  if (!match) return null;
  const value = Number(`${match[1].replace(/\./g, "")}.${(match[2] ?? ",0").slice(1)}`);
  if (!Number.isFinite(value) || value <= 0) return null;
  const thousands = /mil/i.test(text) && value < 100 ? value * 1000 : value;
  return thousands;
}
