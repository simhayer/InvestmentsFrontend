"use client";

import { AnalysisContainer } from "./analysis/analysis-container";

export function Analytics() {
  return (
    <div className="min-h-screen w-full bg-[#f6f7f8] font-['Futura_PT_Book',_Futura,_sans-serif] [&_.font-semibold]:font-['Futura_PT_Demi',_Futura,_sans-serif] [&_.font-bold]:font-['Futura_PT_Demi',_Futura,_sans-serif]">
      <main className="mx-auto w-full max-w-[1260px] px-4 sm:px-6 lg:px-10 xl:px-14 py-8 sm:py-10 lg:py-12">
        <AnalysisContainer />
      </main>
    </div>
  );
}
