// @/config/analysis-tabs.ts
export const TAB_LIST = [
  { key: "summary", label: "Summary" },
  { key: "metrics", label: "Metrics" },
  { key: "positions", label: "Positions" },
  { key: "predictions", label: "Predictions" },
  { key: "news", label: "News" },
  { key: "catalysts", label: "Catalysts" },
  { key: "risks", label: "Risks" },
  { key: "actions", label: "Actions" },
  { key: "scenarios", label: "Scenarios" },
  { key: "outlook", label: "Outlook" },
  { key: "rebalance", label: "Rebalance" },
  { key: "developments", label: "Latest" },
] as const;

export type TabKey = (typeof TAB_LIST)[number]["key"];
