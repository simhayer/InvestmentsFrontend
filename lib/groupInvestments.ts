// // utils/groupInvestments.ts
import { Investment } from "@/types/investment";

export function groupInvestmentsBySymbol(investments: Investment[]): Investment[] {
  const grouped = new Map<string, Investment>();

  for (const inv of investments) {
    const key = inv.symbol;

    if (!grouped.has(key)) {
      grouped.set(key, { ...inv });
    } else {
      const existing = grouped.get(key)!;
      const totalQty = existing.quantity + inv.quantity;
      const avgPrice =
        (existing.purchasePrice * existing.quantity + inv.purchasePrice * inv.quantity) / totalQty;

      grouped.set(key, {
        ...existing,
        quantity: totalQty,
        purchasePrice: avgPrice,
      });
    }
  }

  return Array.from(grouped.values());
}
