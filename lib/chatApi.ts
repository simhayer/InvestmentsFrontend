import type { ChatRequest, ChatResponse } from "@/types/chat";
import { authedFetch } from "@/utils/authService";

const CHAT_STREAM_PATH = "/api/ai/chat/stream";

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
  const res = await postChatStream(body, signal);
  if (!res.ok || !res.body) {
    const message = await safeReadError(res);
    throw new Error(message || `Chat request failed (${res.status})`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let answer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() || "";
    for (const part of parts) {
      const lines = part.split("\n");
      let event = "message";
      let data = "";
      for (const line of lines) {
        const clean = line.endsWith("\r") ? line.slice(0, -1) : line;
        if (clean.startsWith("event:")) event = clean.slice(6).trim();
        if (clean.startsWith("data:")) data += clean.slice(5).trim();
      }
      if (!data) continue;
      let parsed: any = null;
      try {
        parsed = JSON.parse(data);
      } catch {
        parsed = { text: data };
      }
      if (event === "token" && typeof parsed.text === "string") {
        answer += parsed.text;
      } else if (event === "done" && !answer && typeof parsed.text === "string") {
        answer = parsed.text;
      } else if (event === "error") {
        throw new Error(parsed.message || "Chat stream failed");
      }
    }
  }
  return { answer };
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
