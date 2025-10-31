export const dynamic = "force-dynamic";
export const revalidate = 0;

import MarketOverview from "@/components/market/index";

export default function MarketPageProtected() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <MarketOverview />
    </div>
  );
}
