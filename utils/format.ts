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
        maximumFractionDigits: 3,
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

const toCamel = (s: string) =>
  s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());

export function keysToCamel<T>(input: T): T {
  if (Array.isArray(input)) return input.map(keysToCamel) as unknown as T;
  if (input && typeof input === "object") {
    const entries = Object.entries(input as Record<string, unknown>).map(
      ([k, v]) => [toCamel(k), keysToCamel(v as unknown)]
    );
    return Object.fromEntries(entries) as T;
  }
  return input;
}

export const fmtNumber = (n: number) =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n);

export function fmtAsOf(asOf?: string) {
  if (!asOf) return undefined;
  try {
    const d = new Date(asOf);
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return asOf;
  }
}
