"use client";

import { useState } from "react";
import { AddInvestmentCard } from "./add-investment-card";
import { InvestmentList } from "@/components/investments-view/investment-list";
import { PortfolioOverview } from "@/components/dashboard/portfolio-overview";
import { DashboardHeader } from "./header";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { User } from "@/types/user";

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const {
    grouped,
    loading,
    refreshing,
    refreshPrices,
    addInvestment,
    deleteInvestment,
  } = useDashboardData(onLogout);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        user={user}
        onRefresh={refreshPrices}
        onLogout={onLogout}
        onAddClick={() => setShowAddForm(true)}
        refreshing={refreshing}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-24 rounded-md" />
            <Skeleton className="h-10 w-1/4" />
            <Skeleton className="h-40 rounded-md" />
          </div>
        ) : (
          <div
            className={`space-y-8 ${
              refreshing ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <PortfolioOverview investments={grouped} />
            {showAddForm && (
              <AddInvestmentCard
                onAdd={addInvestment}
                onCancel={() => setShowAddForm(false)}
              />
            )}
            <InvestmentList investments={grouped} onDelete={deleteInvestment} />
          </div>
        )}
      </main>
    </div>
  );
}
