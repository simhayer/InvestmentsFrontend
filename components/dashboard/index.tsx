"use client";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PortfolioOverview } from "@/components/dashboard/portfolio-overview";
import { AddInvestmentCard } from "./add-investment-card";
import { AIInsights } from "../ai/AIInsights";
import { Holdings } from "@/components/holdings";
import { useAuth } from "@/lib/auth-provider";

export function Dashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [investments, setInvestments] = useState<any[]>([]);

  return (
    <main
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-background"
      aria-busy={refreshing}
      aria-live="polite"
    >
      <div
        className={`space-y-8 ${
          refreshing ? "opacity-60 pointer-events-none" : ""
        }`}
      >
        {/* <AIInsights /> */}
        <PortfolioOverview currency="USD" />
        {/* {showAddForm && (
            <AddInvestmentCard
              onAdd={addInvestment}
              onCancel={() => setShowAddForm(false)}
            />
          )} */}
      </div>
    </main>
  );
}
