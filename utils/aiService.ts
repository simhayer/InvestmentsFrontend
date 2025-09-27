// utils/aiService.ts
import { Investment } from "@/types/investment";

export async function getAiInsight(investment: Investment): Promise<string> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/ai/analyze-holding`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
        credentials: "include",
      }
    );

    const data = await res.json();
    return data.insight || "No insight returned.";
  } catch (error) {
    console.error("AI insight fetch error:", error);
    return "Something went wrong while fetching AI insight.";
  }
}

export async function getAiInsightSymbol(symbol: string): Promise<string> {
  console.log("Fetching AI insight for symbol:", symbol);
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/ai/analyze-symbol`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ symbol }),
        credentials: "include",
      }
    );
    const data = await res.json();
    console.log("AI insight response data:", data);
    return data || "No insight returned.";
  } catch (error) {
    console.error("AI insight fetch error:", error);
    return "Something went wrong while fetching AI insight.";
  }
}
