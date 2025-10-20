// app/(public)/investment/[symbol]/page.tsx
import MarketOverview from "@/components/market/index";

export default async function MarketPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <MarketOverview />
    </div>
  );
}
