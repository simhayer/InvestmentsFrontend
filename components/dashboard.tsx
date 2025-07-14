"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AddInvestmentForm } from "@/components/add-investment-form";
import { InvestmentList } from "@/components/investment-list";
import { PortfolioOverview } from "@/components/portfolio-overview";
import { LogOut, Plus, RefreshCw } from "lucide-react";
import {
  addHolding,
  deleteHolding,
  getHoldings,
  groupInvestmentsBySymbol,
} from "@/utils/investmentsService";
import { fetchLivePricesForList } from "@/lib/finnhub";
import type { Investment } from "@/types/investment";
import { getToken } from "@/utils/authService";
import { useToast } from "@/hooks/use-toast";
import { PlaidLinkButton } from "./plaid-link-button";
import { User } from "@/types/user";

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingHoldings, setLoadingHoldings] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingHoldings(true);
        const token = await getToken();
        if (!token) {
          onLogout();
          return;
        }

        const holdings = await getHoldings(token);
        const updated = await fetchLivePricesForList(holdings, token);
        setInvestments(updated);
      } catch (err) {
        console.error("Error loading holdings:", err);
        toast({
          title: "Error",
          description: "Failed to load holdings.",
          variant: "destructive",
        });
      } finally {
        setLoadingHoldings(false);
      }
    };

    fetchData();
  }, []);

  const fetchLivePrices = async (invList: Investment[] = investments) => {
    if (invList.length === 0) return;

    setRefreshing(true);
    const token = await getToken();
    if (!token) {
      onLogout();
      return;
    }

    const updated = await fetchLivePricesForList(invList, token);
    setInvestments(updated);
    setRefreshing(false);
  };

  const handleAddInvestment = async (investment: Omit<Investment, "id">) => {
    try {
      const token = await getToken();
      if (!token) {
        onLogout();
        return;
      }

      await addHolding(token, {
        symbol: investment.symbol,
        quantity: investment.quantity,
        avg_price: investment.purchasePrice,
        type: investment.type,
      });

      const updatedHoldings = await getHoldings(token);
      const priced = await fetchLivePricesForList(updatedHoldings, token);
      setInvestments(priced);
      setShowAddForm(false);
    } catch (err) {
      console.error("Failed to add investment:", err);
      toast({
        title: "Error",
        description: "Could not add investment.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteInvestment = async (id: string) => {
    const token = await getToken();
    if (!token) {
      onLogout();
      return;
    }

    try {
      await deleteHolding(token, id);
      setInvestments((prev) => prev.filter((inv) => inv.id !== id));

      toast({
        title: "Deleted",
        description: "Investment removed successfully.",
      });
    } catch (error) {
      console.error("Failed to delete investment:", error);
      toast({
        title: "Error",
        description: "Failed to delete investment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const groupedInvestments = groupInvestmentsBySymbol(investments);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Investment Tracker
              </h1>
              <p className="text-sm text-gray-500">Welcome back, {user.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <PlaidLinkButton
                userId={user.id}
                onSuccess={() => console.log("Plaid connected!")}
              />
              <Button
                onClick={() => fetchLivePrices()}
                disabled={refreshing}
                variant="outline"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-1 ${
                    refreshing ? "animate-spin" : "hidden"
                  }`}
                />
                {refreshing ? "Refreshing..." : "Refresh Prices"}
              </Button>
              <Button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Investment
              </Button>
              <Button
                variant="outline"
                onClick={onLogout}
                className="flex items-center gap-2 bg-transparent"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loadingHoldings ? (
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
            <PortfolioOverview investments={groupedInvestments} />

            {showAddForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Add New Investment</CardTitle>
                  <CardDescription>
                    Add a new stock, cryptocurrency, or other investment to your
                    portfolio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AddInvestmentForm
                    onAdd={handleAddInvestment}
                    onCancel={() => setShowAddForm(false)}
                  />
                </CardContent>
              </Card>
            )}

            <InvestmentList
              investments={groupedInvestments}
              onDelete={handleDeleteInvestment}
            />
          </div>
        )}
      </main>
    </div>
  );
}
