import { toast } from "@/components/ui/use-toast";
import type { Holding } from "@/types/holding";
import { keysToCamel } from "@/utils/format";
import { getHoldings } from "@/utils/investmentsService";
import { useEffect, useState } from "react";

type PriceStatus = "live" | "stale" | "unavailable" | "unrequested";

export function useHolding() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHoldings = async () => {
    setLoading(true);
    try {
      const resp = await getHoldings();

      // If your keysToCamel can handle nested objects, do it once:
      const camel = keysToCamel(resp) as {
        items: Holding[];
        asOf?: number;
        priceStatus?: PriceStatus;
      };

      setHoldings(camel.items);

      // If needed, you can also set other state variables like asOf or priceStatus
      // setAsOf(camel.asOf);
      // setPriceStatus(camel.priceStatus);
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

  return { holdings, loading, reloadHoldings: loadHoldings };
}
