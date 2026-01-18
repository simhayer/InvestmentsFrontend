export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  createdAt: number;
};

export type ChatRequest = {
  message: string;
  session_id?: string;
};

export type ChatResponse = {
  session_id?: string;
  answer?: string;
};
