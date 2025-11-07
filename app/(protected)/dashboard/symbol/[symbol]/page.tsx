// app/(public)/investment/[symbol]/page.tsx
import InvestmentOverview from "@/components/investment/index";

type Params = { symbol: string };

export default async function InvestmentPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { symbol } = await params;
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <InvestmentOverview symbol={decodeURIComponent(symbol)} />
    </div>
  );
}
