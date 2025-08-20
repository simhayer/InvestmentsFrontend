"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, TrendingUp, TrendingDown } from "lucide-react";
import type { Investment } from "@/types/investment";
import { getAiInsight } from "@/utils/aiService";

// ---- Structured type for AI analysis (matches your backend JSON) ----
type Analysis = {
  symbol: string;
  as_of_utc: string;
  pnl_abs: number | null;
  pnl_pct: number | null;
  market_context: Record<string, unknown>;
  rating: "hold" | "sell" | "watch" | "diversify";
  rationale: string;
  key_risks: string[];
  suggestions: string[];
  data_notes: string[];
  disclaimer: string;
};

// ---- Helpers ----
const getTypeColor = (type: Investment["type"]) => {
  switch (type) {
    case "stock":
      return "bg-blue-100 text-blue-800";
    case "cryptocurrency":
      return "bg-orange-100 text-orange-800";
    case "etf":
      return "bg-green-100 text-green-800";
    case "bond":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const safeNumber = (n: unknown, fallback = 0) =>
  typeof n === "number" && Number.isFinite(n) ? n : fallback;

const calculateGainLoss = (investment: Investment) => {
  const qty = safeNumber(investment.quantity);
  const current = safeNumber(investment.currentPrice);
  const avg = safeNumber(investment.avgPrice);
  const totalValue = qty * current;
  const totalCost = qty * avg;
  const gainLoss = totalValue - totalCost;
  const percentage = totalCost ? (gainLoss / totalCost) * 100 : 0;
  return { gainLoss, percentage, totalValue };
};

// ---- Component ----
interface InvestmentItemProps {
  investment: Investment;
  onDelete: (id: string) => void;
}

export function InvestmentItem({ investment, onDelete }: InvestmentItemProps) {
  const { gainLoss, percentage, totalValue } = calculateGainLoss(investment);
  const isPositive = gainLoss >= 0;

  const [aiInsight, setAiInsight] = useState<Analysis | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [insightError, setInsightError] = useState<string | null>(null);

  if (!investment) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-gray-400 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Investment Not Found
            </h3>
          </div>
        </CardContent>
      </Card>
    );
  }

  const fetchInsight = async () => {
    setLoadingInsight(true);
    setInsightError(null);
    setAiInsight(null);

    try {
      // May return a string (JSON) or an object depending on your aiService
      const raw = await getAiInsight(investment);
      let parsed: Analysis | null = null;

      if (raw && typeof raw === "object") {
        parsed = raw as Analysis;
      } else if (typeof raw === "string") {
        try {
          parsed = JSON.parse(raw) as Analysis;
        } catch {
          setInsightError("AI returned unexpected text.");
        }
      }

      if (parsed) {
        // Optional: basic sanity checks for required fields
        parsed.rating = ["hold", "sell", "watch", "diversify"].includes(
          String(parsed.rating).toLowerCase()
        )
          ? (parsed.rating as Analysis["rating"])
          : "watch";
        setAiInsight(parsed);
      } else if (!insightError) {
        setInsightError("No insight available.");
      }
    } catch (e) {
      setInsightError("Failed to fetch AI insight.");
    } finally {
      setLoadingInsight(false);
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div>
              <h3 className="font-medium text-gray-900">{investment.symbol}</h3>
              <p className="text-sm text-gray-500">{investment.name}</p>
            </div>
            <Badge className={getTypeColor(investment.type)}>
              {investment.type.toUpperCase()}
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Quantity</p>
              <p className="font-medium">{safeNumber(investment.quantity)}</p>
            </div>

            <div>
              <p className="text-gray-500">Purchase Price</p>
              <p className="font-medium">
                ${safeNumber(investment.avgPrice).toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Current Price</p>
              <p className="font-medium">
                ${safeNumber(investment.currentPrice).toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Total Value</p>
              <p className="font-medium">${totalValue.toFixed(2)}</p>
            </div>

            <div>
              <p className="text-gray-500">Institution</p>
              <p className="font-medium">{investment.institution || "N/A"}</p>
            </div>
          </div>

          {/* AI Insight */}
          {aiInsight && (
            <div className="mt-4 bg-gray-100 p-3 rounded text-sm text-gray-800 border">
              <div className="flex items-center justify-between">
                <strong>AI Feedback</strong>
                <span className="uppercase text-xs opacity-70">
                  {aiInsight.rating}
                </span>
              </div>

              <p className="mt-2">{aiInsight.rationale}</p>

              {!!aiInsight.key_risks?.length && (
                <div className="mt-3">
                  <strong>Key risks:</strong>
                  <ul className="list-disc ml-5">
                    {aiInsight.key_risks.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {!!aiInsight.suggestions?.length && (
                <div className="mt-3">
                  <strong>Suggestions:</strong>
                  <ul className="list-disc ml-5">
                    {aiInsight.suggestions.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-3 grid gap-2 md:grid-cols-2">
                <div>
                  <strong>P&amp;L:</strong>{" "}
                  {aiInsight.pnl_abs !== null
                    ? aiInsight.pnl_abs.toFixed(2)
                    : "N/A"}{" "}
                  (
                  {aiInsight.pnl_pct !== null
                    ? aiInsight.pnl_pct.toFixed(2)
                    : "N/A"}
                  %)
                </div>
                <div>
                  <strong>As of:</strong> {aiInsight.as_of_utc}
                </div>
              </div>

              {!!aiInsight.data_notes?.length && (
                <p className="mt-3 text-xs opacity-70">
                  {aiInsight.data_notes.join(" • ")}
                </p>
              )}
              <p className="mt-1 text-xs opacity-70">{aiInsight.disclaimer}</p>
            </div>
          )}

          {insightError && (
            <div className="mt-4 bg-red-50 text-red-700 border border-red-200 p-3 rounded text-sm">
              {insightError}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div
              className={`flex items-center gap-1 ${
                isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className="font-medium">
                {isPositive ? "+" : ""}${gainLoss.toFixed(2)}
              </span>
            </div>
            <div
              className={`text-sm ${
                isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {isPositive ? "+" : ""}
              {percentage.toFixed(2)}%
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(investment.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchInsight}
            disabled={loadingInsight}
          >
            {loadingInsight ? "Analyzing..." : "AI Insight"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
