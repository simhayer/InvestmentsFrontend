import type { ChatRequest, ChatResponse } from "@/types/chat";
import { authedFetch } from "@/utils/authService";

const CHAT_STREAM_PATH = "/api/ai/chat/stream";
const CHAT_PATH = "/api/ai/chat";

export async function postChatStream(
  body: ChatRequest,
  signal?: AbortSignal
): Promise<Response> {
  return authedFetch(CHAT_STREAM_PATH, {
    method: "POST",
    headers: {
      Accept: "text/event-stream",
    },
    body: JSON.stringify(body),
    signal,
  });
}

export async function postChat(
  body: ChatRequest,
  signal?: AbortSignal
): Promise<ChatResponse> {
  const res = await authedFetch(CHAT_PATH, {
    method: "POST",
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    const message = await safeReadError(res);
    throw new Error(message || `Chat request failed (${res.status})`);
  }

  return (await res.json()) as ChatResponse;
}

export async function safeReadError(res: Response): Promise<string | null> {
  try {
    const text = await res.text();
    if (!text) return null;
    try {
      const parsed = JSON.parse(text) as { message?: string };
      return parsed.message || text;
    } catch {
      return text;
    }
  } catch {
    return null;
  }
}
