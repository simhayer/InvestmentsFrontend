import { Investment } from "@/types/investment";
export const API_URL = process.env.NEXT_PUBLIC_API_URL

export const addHolding = async (token: string, data: any) => {
  const res = await fetch(`${API_URL}/holdings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    throw new Error("Failed to add holding")
  }

  return res.json()
}

export const getHoldings = async (token: string) => {
  console.log('getting holdings')
  const res = await fetch(`${API_URL}/holdings`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    throw new Error("Failed to fetch holdings")
  }

  return res.json()
}

export const deleteHolding = async (token: string, holdingId: string) => {
  const res = await fetch(`${API_URL}/holdings/${holdingId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    throw new Error("Failed to delete holding")
  }

  return res.json()
}

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
        (existing.avg_price * existing.quantity + inv.avg_price * inv.quantity) / totalQty;

      grouped.set(key, {
        ...existing,
        quantity: totalQty,
        purchasePrice: avgPrice,
        avg_price: avgPrice
      });
    }
  }

  return Array.from(grouped.values());
}