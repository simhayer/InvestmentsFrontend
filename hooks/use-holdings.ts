import { toast } from "@/components/ui/use-toast";
import type { Holding } from "@/types/holding";
import { keysToCamel } from "@/utils/format";
import { getHoldings } from "@/utils/investmentsService";
import { logger } from "@/lib/logger";
import { useCallback, useEffect, useRef, useState } from "react";

type PriceStatus = "live" | "stale" | "unavailable" | "unrequested";

/** Total cost in user's display currency (from settings); converted on the backend. */
export function useHolding() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCost, setTotalCost] = useState<number | null>(null);
  const [displayCurrency, setDisplayCurrency] = useState<string>("USD");

  const inFlightRef = useRef(false);

  const loadHoldings = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setLoading(true);
    try {
      const resp = await getHoldings();

      const camel = keysToCamel(resp) as {
        items: Holding[];
        marketValue?: number;
        currency?: string;
        asOf?: number;
        priceStatus?: PriceStatus;
      };

      const items = camel.items ?? [];
      setHoldings(items);
      setTotalCost(
        camel.marketValue != null ? Number(camel.marketValue) : null
      );
      setDisplayCurrency(
        (camel.currency as string)?.trim()?.toUpperCase() || "USD"
      );
      logger.info("holdings_loaded_success", { count: items.length });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load holdings or institutions.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  }, []);

  useEffect(() => {
    loadHoldings();
  }, [loadHoldings]);

  return {
    holdings,
    loading,
    reloadHoldings: loadHoldings,
    totalCost,
    displayCurrency,
  };
}
