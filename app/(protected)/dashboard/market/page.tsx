export const dynamic = "force-dynamic";
export const revalidate = 0;

import MarketOverview from "@/components/market/index";

export default function MarketPageProtected() {
  return <MarketOverview />;
}
