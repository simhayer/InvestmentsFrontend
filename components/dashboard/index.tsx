"use client";
import { useMemo, useState } from "react";
import { DashboardHeader } from "./header";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PortfolioOverview } from "@/components/dashboard/portfolio-overview";
import { InvestmentList } from "@/components/investments-view/investment-list";
import { AddInvestmentCard } from "./add-investment-card";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import type { User } from "@/types/user";
import { Sidebar } from "./sidebar";
import { PortfolioAnalysisCard } from "../potfolio_analysis";

const ALL_INSTITUTIONS = "__all__" as const;

export function Dashboard({
  user,
  onLogout,
}: {
  user: User;
  onLogout: () => void;
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    grouped,
    institutions, // [{institution_id, institution_name}, ...]
    selectedInstitution,
    setSelectedInstitution,
    loading,
    refreshing,
    refreshPrices,
    addInvestment,
    deleteInvestment,
    reloadDashboardData,
  } = useDashboardData(onLogout);

  // Build a map of counts per institution for better filter labels
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const inv of grouped)
      m.set(
        inv.institution || inv.institution || "Unknown",
        (m.get(inv.institution || inv.institution || "Unknown") || 0) + 1
      );
    return m;
  }, [grouped]);

  const filtered = useMemo(() => {
    if (!selectedInstitution) return grouped;
    // Be consistent: compare by institution_name
    return grouped.filter(
      (inv) => (inv.institution || inv.institution) === selectedInstitution
    );
  }, [grouped, selectedInstitution]);

  return (
    <div className="min-h-screen bg-gray-50 lg:grid lg:grid-cols-[16rem_1fr]">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader
          user={user}
          onRefresh={refreshPrices}
          onLogout={onLogout}
          onAddClick={() => setShowAddForm(true)}
          refreshing={refreshing}
          onPlaidLinkSuccess={reloadDashboardData}
          setSidebarOpen={setSidebarOpen}
        />

        <main
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
          aria-busy={refreshing}
          aria-live="polite"
        >
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
                refreshing ? "opacity-60 pointer-events-none" : ""
              }`}
            >
              {/* <PortfolioAnalysisCard /> */}
              <PortfolioOverview investments={grouped} />
              {showAddForm && (
                <AddInvestmentCard
                  onAdd={addInvestment}
                  onCancel={() => setShowAddForm(false)}
                />
              )}

              {institutions.length > 0 && (
                <div className="mb-4 max-w-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filter by Institution
                  </label>
                  <Select
                    // map null -> sentinel for the Select's controlled value
                    value={selectedInstitution ?? ALL_INSTITUTIONS}
                    onValueChange={(v) =>
                      setSelectedInstitution(v === ALL_INSTITUTIONS ? null : v)
                    }
                    disabled={refreshing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All institutions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_INSTITUTIONS}>
                        All institutions ({grouped.length})
                      </SelectItem>
                      {institutions.map((inst) => {
                        const name =
                          inst.institution_name || inst.institution_id;
                        return (
                          <SelectItem key={inst.institution_id} value={name}>
                            {name} ({counts.get(name) || 0})
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <InvestmentList
                investments={filtered}
                onDelete={deleteInvestment}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
