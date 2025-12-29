// components/ai-insights/TabRenderer.tsx
import { TabKey } from "@/components/analytics/analysis/tab-config";
import { SummaryTab } from "./tabs/SummaryTab";
import { PortfolioMetricsTab } from "./tabs/MetricsTab";
import { PositionsTab } from "./tabs/PositionsTab";
import { PredictionsTab } from "./tabs/PredictionsTab";
import { NewsSentimentTab } from "./tabs/NewsSentimentTab";
import { CatalystsTab } from "./tabs/CatalystsTab";
import { RisksTab } from "./tabs/RisksTab";
import { ActionsTab } from "./tabs/ActionsTab";
import { ScenariosTab } from "./tabs/ScenariosTab";
import { MarketOutlookTab } from "./tabs/MarketOutlookTab";
import { RebalancePathsTab } from "./tabs/RebalancePathsTab";
import { LatestDevelopmentsTab } from "./tabs/LatestDevelopmentsTab";

interface TabRendererProps {
  active: TabKey;
  data: any; // Ideally use your PortfolioAiData type here
}

export function TabRenderer({ active, data }: TabRendererProps) {
  const layers = data.ai_layers;

  switch (active) {
    case "summary":
      return <SummaryTab data={layers.summary} />;
    case "metrics":
      return <PortfolioMetricsTab data={layers.metrics} />;
    case "positions":
      return <PositionsTab data={layers} />;
    case "predictions":
      return <PredictionsTab data={layers.performance} />;
    case "news":
      return <NewsSentimentTab data={layers.news_sentiment} />;
    case "catalysts":
      return <CatalystsTab data={layers.news_sentiment.catalysts} />;
    case "risks":
      return <RisksTab data={layers.news_sentiment.risks_list} />;
    case "actions":
      return <ActionsTab data={layers.scenarios_rebalance.actions} />;
    case "scenarios":
      return <ScenariosTab data={layers.scenarios_rebalance.scenarios} />;
    case "outlook":
      return (
        <MarketOutlookTab data={layers.scenarios_rebalance.market_outlook} />
      );
    case "rebalance":
      return (
        <RebalancePathsTab data={layers.scenarios_rebalance.rebalance_paths} />
      );
    case "developments":
      return (
        <LatestDevelopmentsTab
          data={layers.news_sentiment.latest_developments}
        />
      );
    default:
      return null;
  }
}
