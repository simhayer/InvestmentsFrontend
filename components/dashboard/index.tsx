// app/(protected)/dashboard/page.tsx
"use client";

import * as React from "react";
import PortfolioOverview from "@/components/dashboard/portfolio-overview";
import { AnalysisSummaryCard } from "@/components/dashboard/ai-summary-card";

export default function Dashboard() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <PortfolioOverview currency="USD" />
        </div>
        <AnalysisSummaryCard />
      </div>
    </div>
  );
}
