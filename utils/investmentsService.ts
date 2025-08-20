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

export async function getInstitutions(token: string) {
  const res = await fetch(`${API_URL}/api/plaid/institutions`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Failed to fetch institutions");
  return await res.json();
}


export function groupInvestmentsBySymbol(investments: Investment[]): Investment[] {
  const grouped = new Map<string, Investment>();

  for (const inv of investments) {
    const key = inv.symbol;

    if (!grouped.has(key)) {
      grouped.set(key, { ...inv, avgPrice: inv.purchasePrice });
    } else {
      const existing = grouped.get(key)!;
      const totalQty = existing.quantity + inv.quantity;
      const avgPrice =
        (existing.purchasePrice * existing.quantity + inv.purchasePrice * inv.quantity) / totalQty;

      grouped.set(key, {
        ...existing,
        quantity: totalQty,
        purchasePrice: avgPrice,
        avgPrice: avgPrice
      });
    }
  }

  return Array.from(grouped.values());
}