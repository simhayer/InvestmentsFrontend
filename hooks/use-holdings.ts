import { toast } from "@/components/ui/use-toast";
import type { Holding } from "@/types/holding";
import { keysToCamel } from "@/utils/format";
import { getHoldings } from "@/utils/investmentsService";
import { useCallback, useEffect, useRef, useState } from "react";

type PriceStatus = "live" | "stale" | "unavailable" | "unrequested";

export function useHolding() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);

  // Dedup — prevent overlapping / repeated fetches
  const inFlightRef = useRef(false);

  const loadHoldings = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setLoading(true);
    try {
      const resp = await getHoldings();

      const camel = keysToCamel(resp) as {
        items: Holding[];
        asOf?: number;
        priceStatus?: PriceStatus;
      };

      setHoldings(camel.items);
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

  return { holdings, loading, reloadHoldings: loadHoldings };
}
