import { useEffect, useState } from "react";
import { getHoldings, addHolding, deleteHolding, groupInvestmentsBySymbol } from "@/utils/investmentsService";
import { fetchLivePricesForList } from "@/lib/finnhub";
import { getToken } from "@/utils/authService";
import { Investment } from "@/types/investment";
import { useToast } from "@/hooks/use-toast";

const mapToCamelCase = (holding: any) => ({
  id: holding.id,
  symbol: holding.symbol,
  name: holding.name,
  type: holding.type,
  quantity: holding.quantity,
  purchasePrice: holding.purchase_price,
  currentPrice: holding.current_price,
  value: holding.value,
  currency: holding.currency,
  institution: holding.institution,
  accountName: holding.account_name,
  source: holding.source,
  externalId: holding.external_id,
  userId: holding.user_id,
});

export function useDashboardData(onLogout: () => void) {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const loadHoldings = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) return onLogout();

      const holdings = await getHoldings(token);
      const mappedHoldings = holdings.map(mapToCamelCase);
      const priced = await fetchLivePricesForList(mappedHoldings, token);
      setInvestments(priced);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load holdings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHoldings();
  }, []);

  const refreshPrices = async () => {
    if (investments.length === 0) return;
    setRefreshing(true);
    const token = await getToken();
    if (!token) return onLogout();
    const updated = await fetchLivePricesForList(investments, token);
    setInvestments(updated);
    setRefreshing(false);
  };

  const addInvestment = async (inv: Omit<Investment, "id">) => {
    const token = await getToken();
    if (!token) return onLogout();
    await addHolding(token, {
      symbol: inv.symbol,
      quantity: inv.quantity,
      avg_price: inv.purchasePrice,
      type: inv.type,
    });
    loadHoldings();
  };

  const deleteInvestment = async (id: string) => {
    const token = await getToken();
    if (!token) return onLogout();
    await deleteHolding(token, id);
    setInvestments((prev) => prev.filter((inv) => inv.id !== id));
  };

  return {
    investments,
    grouped: groupInvestmentsBySymbol(investments),
    loading,
    refreshing,
    refreshPrices,
    addInvestment,
    deleteInvestment,
  };
}
