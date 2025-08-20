import { useEffect, useState } from "react";
import {
  getHoldings,
  getInstitutions,
  addHolding,
  deleteHolding,
  groupInvestmentsBySymbol,
} from "@/utils/investmentsService";
import { fetchLivePricesForList } from "@/lib/finnhub";
import { Investment } from "@/types/investment";
import { useToast } from "@/hooks/use-toast";

const mapToCamelCase = (holding: any): Investment => ({
  id: holding.id,
  symbol: holding.symbol,
  name: holding.name,
  type: holding.type,
  quantity: holding.quantity,
  purchasePrice: holding.purchase_price,
  currentPrice: holding.current_price,
  //value: holding.value,
  currency: holding.currency,
  institution: holding.institution,
  //accountName: holding.account_name,
  //source: holding.source,
  //externalId: holding.external_id,
 // userId: holding.user_id,
  avgPrice: holding.avg_price,
  purchaseDate: holding.purchase_date,
});

export function useDashboardData(onLogout: () => void) {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [institutions, setInstitutions] = useState<{ institution_name: string; institution_id: string }[]>([]);
  const [selectedInstitution, setSelectedInstitution] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const loadHoldings = async () => {
    setLoading(true);
    try {
      const holdings = await getHoldings();
      const mappedHoldings = holdings.map(mapToCamelCase);
      const priced = await fetchLivePricesForList(mappedHoldings);
      setInvestments(priced);

      const connectedInstitutions = await getInstitutions();
      setInstitutions(connectedInstitutions);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load holdings or institutions.",
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
    const updated = await fetchLivePricesForList(investments);
    setInvestments(updated);
    setRefreshing(false);
  };

  const addInvestment = async (inv: Omit<Investment, "id">) => {
    await addHolding({
      symbol: inv.symbol,
      quantity: inv.quantity,
      avg_price: inv.purchasePrice,
      type: inv.type,
    });
    loadHoldings();
  };

  const deleteInvestment = async (id: string) => {
    await deleteHolding(id);
    setInvestments((prev) => prev.filter((inv) => inv.id !== id));
  };

  const filteredInvestments = selectedInstitution
    ? investments.filter((inv) => inv.institution === selectedInstitution)
    : investments;

  return {
    investments,
    grouped: groupInvestmentsBySymbol(filteredInvestments),
    institutions,
    selectedInstitution,
    setSelectedInstitution,
    loading,
    refreshing,
    refreshPrices,
    addInvestment,
    deleteInvestment,
    reloadDashboardData: loadHoldings
  };
}
