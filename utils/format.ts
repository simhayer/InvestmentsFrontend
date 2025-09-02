// utils/format.ts
export const formatCurrency = (n: number, currency = "USD") =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(n);

export const formatPct = (p: number) => `${(isFinite(p) ? p : 0).toFixed(2)}%`;

export const fmtCurrency = (v?: number | null, ccy = "USD") =>
  v == null
    ? "—"
    : new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: ccy,
        maximumFractionDigits: 2,
      }).format(v);
export const fmtCompact = (v?: number | null) =>
  v == null
    ? "—"
    : new Intl.NumberFormat(undefined, {
        notation: "compact",
        maximumFractionDigits: 2,
      }).format(v);
export const fmtPct = (v?: number | null) =>
  v == null ? "—" : `${v.toFixed(2)}%`;
export const fmtNum = (v?: number | null) =>
  v == null ? "—" : new Intl.NumberFormat().format(v);
