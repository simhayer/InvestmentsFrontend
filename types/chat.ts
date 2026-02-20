export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  createdAt: number;
  toolCalls?: string[];
  webSearches?: string[];
  webSearchEnabled?: boolean;
  webLinks?: Array<{ url: string; title?: string }>;
};

export type ChatHistoryRole = "user" | "assistant" | "system";

export type ChatHistoryMessage = {
  role: ChatHistoryRole;
  content: string;
};

// ── Page Context (sent with every chat request) ──

export type PageType =
  | "dashboard"
  | "symbol"
  | "holdings"
  | "market"
  | "analytics"
  | "settings"
  | "unknown";

export type PageContext = {
  page_type: PageType;
  route: string;
  symbol?: string;
  summary?: string;
  data_snapshot?: Record<string, unknown>;
};

export type ChatContext = {
  portfolio_summary?: string;
  risk_profile?: string;
  preferred_currency?: string;
  page?: PageContext;
};

export type ChatRequest = {
  messages: ChatHistoryMessage[];
  conversation_id?: string;
  context?: ChatContext;
  allow_web_search?: boolean;
};

export type ChatResponse = {
  answer?: string;
};
