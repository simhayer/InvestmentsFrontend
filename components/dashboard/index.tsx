// app/(protected)/dashboard/page.tsx
"use client";

import * as React from "react";
import PortfolioOverview from "@/components/dashboard/portfolio-overview";
import { AnalysisSummaryCard } from "@/components/dashboard/ai-summary-card";

export default function Dashboard() {
  return (
    <PortfolioOverview currency="USD" sidePanel={<AnalysisSummaryCard />} />
  );
}
