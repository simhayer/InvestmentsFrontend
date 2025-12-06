// app/(public)/investment/[symbol]/page.tsx
import InvestmentOverview from "@/components/investment/index";

type Params = { symbol: string };

export default async function InvestmentPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { symbol } = await params;
  return <InvestmentOverview symbol={decodeURIComponent(symbol)} />;
}
