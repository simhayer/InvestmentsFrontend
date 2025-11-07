// utils/aiService.ts
import { Holding } from "@/types/holding";

export async function getAiInsight(holding: Holding): Promise<string> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/ai/analyze-holding`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symbol: holding.symbol,
          name: holding.name,
          quantity: holding.quantity,
          purchase_price: holding.avgPrice,
          current_price: holding.currentPrice,
          type: holding.type,
          institution: holding.institution || "Unknown",
          currency: holding.currency || "USD",
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
