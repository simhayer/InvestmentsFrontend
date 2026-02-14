export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  createdAt: number;
};

export type ChatHistoryRole = "user" | "assistant" | "system";

export type ChatHistoryMessage = {
  role: ChatHistoryRole;
  content: string;
};

export type ChatRequest = {
  messages: ChatHistoryMessage[];
  conversation_id?: string;
  context?: {
    portfolio_summary?: string;
    risk_profile?: string;
    preferred_currency?: string;
  };
  allow_web_search?: boolean;
};

export type ChatResponse = {
  answer?: string;
};
