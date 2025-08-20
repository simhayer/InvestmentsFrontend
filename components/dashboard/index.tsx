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
    institutions,
    selectedInstitution,
    setSelectedInstitution,
    loading,
    refreshing,
    refreshPrices,
    addInvestment,
    deleteInvestment,
    reloadDashboardData,
  } = useDashboardData(onLogout);

  const filteredGrouped = selectedInstitution
    ? grouped.filter((inv) => inv.institution === selectedInstitution)
    : grouped;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        user={user}
        onRefresh={refreshPrices}
        onLogout={onLogout}
        onAddClick={() => setShowAddForm(true)}
        refreshing={refreshing}
        onPlaidLinkSuccess={reloadDashboardData}
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
            {institutions.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Institution
                </label>
                <select
                  className="block w-full max-w-sm border border-gray-300 rounded-md p-2"
                  value={selectedInstitution || ""}
                  onChange={(e) =>
                    setSelectedInstitution(e.target.value || null)
                  }
                >
                  <option value="">All Institutions</option>
                  {institutions.map((inst) => (
                    <option
                      key={inst.institution_id}
                      value={inst.institution_name}
                    >
                      {inst.institution_name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <InvestmentList
              investments={filteredGrouped}
              onDelete={deleteInvestment}
            />
          </div>
        )}
      </main>
    </div>
  );
}
