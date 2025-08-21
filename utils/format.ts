// utils/format.ts
export const formatCurrency = (n: number, currency = "USD") =>
  new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 2 }).format(n);

export const formatPct = (p: number) =>
  `${(isFinite(p) ? p : 0).toFixed(2)}%`;
