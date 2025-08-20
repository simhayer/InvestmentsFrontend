// utils/aiService.ts
import { Investment } from "@/types/investment";
import { getToken } from "./authService";

export async function getAiInsight(investment: Investment): Promise<string> {
  try {
    const token = await getToken();
    if (!token) throw new Error("No auth token");

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/analyze-holding`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        symbol: investment.symbol,
        name: investment.name,
        quantity: investment.quantity,
        purchase_price: investment.avgPrice,
        current_price: investment.currentPrice,
        type: investment.type,
        institution: investment.institution || "Unknown",
        currency: investment.currency || "USD",
        }),
    });

    const data = await res.json();
    return data.insight || "No insight returned.";
  } catch (error) {
    console.error("AI insight fetch error:", error);
    return "Something went wrong while fetching AI insight.";
  }
}
