import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage, ChatContext } from "@/types/chat";
import { postChat, postChatStream, safeReadError } from "@/lib/chatApi";

type UseChatStreamArgs = {
  sessionId: string | null;
  setSessionId?: (sessionId: string) => void;
};

type StreamEvent = {
  type: string;
  data: string;
};

type StreamStatusType = "status" | "search";
type CitationLink = { url: string; title?: string };

function parseEventChunk(chunk: string): StreamEvent | null {
  const lines = chunk.split("\n");
  let event = "message";
  const dataLines: string[] = [];
  let sawEvent = false;

  for (const line of lines) {
    const cleanLine = line.endsWith("\r") ? line.slice(0, -1) : line;
    if (cleanLine.startsWith("event:")) {
      event = cleanLine.slice("event:".length).trim() || "message";
      sawEvent = true;
      continue;
    }
    if (cleanLine.startsWith("data:")) {
      let data = cleanLine.slice("data:".length);
      if (data.startsWith(" ")) data = data.slice(1);
      dataLines.push(data);
    }
  }

  if (!sawEvent && dataLines.length === 0) return null;
  return { type: event, data: dataLines.join("\n") };
}

function formatStatusText(raw: string): { text: string | null; type: StreamStatusType } {
  const trimmed = raw.trim();
  if (!trimmed) return { text: null, type: "status" };
  const normalized = trimmed.toLowerCase().replace(/[\s-]+/g, "_");
  const map: Record<string, string> = {
    classifying: "Classifying...",
    fetching_data: "Fetching data...",
    thinking: "Thinking...",
    searching: "Searching...",
  };
  if (map[normalized]) {
    return {
      text: map[normalized],
      type: normalized === "searching" ? "search" : "status",
    };
  }
  return {
    text: trimmed,
    type: normalized.startsWith("search") ? "search" : "status",
  };
}

function extractSearchQuery(raw: string): string | null {
  if (!raw) return null;
  const parsed = safeParseJson(raw);
  if (parsed && typeof parsed === "object") {
    if (typeof parsed.query === "string") return parsed.query.trim();
    if (typeof parsed.q === "string") return parsed.q.trim();
    if (typeof parsed.text === "string") return parsed.text.trim();
  }
  if (typeof parsed === "string") return parsed.trim();
  return raw.trim() || null;
}

function extractSearchText(raw: string): string | null {
  if (!raw) return null;
  const match = raw.match(/search(?:ing)?\s*(?:for)?\s*[:\-]?\s*(.+)/i);
  if (match && match[1]) return match[1].trim();
  return null;
}

function safeParseJson(raw: string): any | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function extractDeltaText(raw: string): string {
  if (!raw) return "";
  const parsed = safeParseJson(raw);
  if (!parsed) return raw;
  if (typeof parsed === "string") return parsed;
  if (typeof parsed.delta === "string") return parsed.delta;
  if (typeof parsed.text === "string") return parsed.text;
  if (typeof parsed.content === "string") return parsed.content;
  if (typeof parsed.message === "string") return parsed.message;
  if (typeof parsed.status === "string") return parsed.status;
  return raw;
}

function mergeStreamingText(existing: string, incoming: string): string {
  if (!incoming) return existing;
  if (!existing) return incoming;
  if (existing.endsWith(incoming)) return existing;

  // If model restarts from the beginning, avoid duplicating already shown text.
  const startProbe = existing.slice(0, Math.min(60, existing.length));
  if (incoming.length > 60 && startProbe && incoming.startsWith(startProbe)) {
    return existing;
  }

  // Overlap-aware append (suffix(existing) == prefix(incoming)).
  const max = Math.min(existing.length, incoming.length, 240);
  for (let k = max; k > 0; k -= 1) {
    if (existing.slice(-k) === incoming.slice(0, k)) {
      return existing + incoming.slice(k);
    }
  }
  return existing + incoming;
}

export function useChatStream({ sessionId, setSessionId }: UseChatStreamArgs) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<StreamStatusType | null>(null);
  const [thinkingText, setThinkingText] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const typingTimerRef = useRef<number | null>(null);
  const typingActiveRef = useRef(false);
  const pendingTextRef = useRef("");
  const prefersReducedMotionRef = useRef(false);
  const hadDeltaRef = useRef(false);
  const toolCallsRef = useRef<string[]>([]);
  const webSearchesRef = useRef<string[]>([]);
  const webSearchEnabledRef = useRef(false);
  const webLinksRef = useRef<CitationLink[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      prefersReducedMotionRef.current = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
    }
    return () => {
      abortRef.current?.abort();
      if (typingTimerRef.current) {
        window.clearTimeout(typingTimerRef.current);
      }
    };
  }, []);

  const cancelTyping = useCallback(() => {
    typingActiveRef.current = false;
    pendingTextRef.current = "";
    if (typingTimerRef.current) {
      window.clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    cancelTyping();
    setIsStreaming(false);
    setStatus(null);
    setStatusType(null);
    setThinkingText(null);
  }, [cancelTyping]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    setStatus(null);
    setStatusType(null);
    setThinkingText(null);
    pendingTextRef.current = "";
  }, []);

  const sendMessage = useCallback(
    async (text: string, context?: ChatContext) => {
      if (!text.trim() || isStreaming) return;

      const trimmed = text.trim();
      const now = Date.now();
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        text: trimmed,
        createdAt: now,
      };
      const assistantId = crypto.randomUUID();
      const assistantMessage: ChatMessage = {
        id: assistantId,
        role: "assistant",
        text: "",
        createdAt: now + 1,
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsStreaming(true);
      setError(null);
      setStatus(null);
      setStatusType(null);

      const controller = new AbortController();
      abortRef.current = controller;

      const resolvedSessionId = sessionId ?? crypto.randomUUID();
      if (!sessionId) {
        setSessionId?.(resolvedSessionId);
      }

      const history = messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .slice(-12)
        .map((m) => ({ role: m.role, content: m.text }));

      const request = {
        conversation_id: resolvedSessionId,
        messages: [...history, { role: "user" as const, content: trimmed }],
        ...(context ? { context } : {}),
      };

      const assistantTextRef = { current: "" };
      toolCallsRef.current = [];
      webSearchesRef.current = [];
      webSearchEnabledRef.current = false;
      webLinksRef.current = [];
      const updateAssistant = (nextText: string) => {
        assistantTextRef.current = nextText;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId ? { ...msg, text: nextText } : msg
          )
        );
      };
      const updateAssistantMeta = () => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? {
                  ...msg,
                  toolCalls: [...toolCallsRef.current],
                  webSearches: [...webSearchesRef.current],
                  webSearchEnabled: webSearchEnabledRef.current,
                  webLinks: [...webLinksRef.current],
                }
              : msg
          )
        );
      };
      const appendToolCall = (name: string) => {
        const trimmed = name.trim();
        if (!trimmed || toolCallsRef.current.includes(trimmed)) return;
        toolCallsRef.current = [...toolCallsRef.current, trimmed];
        updateAssistantMeta();
      };
      const appendWebSearch = (query: string | null) => {
        webSearchEnabledRef.current = true;
        const trimmed = (query || "").trim();
        if (trimmed && !webSearchesRef.current.includes(trimmed)) {
          webSearchesRef.current = [...webSearchesRef.current, trimmed];
        }
        updateAssistantMeta();
      };
      const appendWebLink = (link: CitationLink | null) => {
        if (!link || !link.url) return;
        const normalizedUrl = link.url.trim();
        if (!normalizedUrl) return;
        const exists = webLinksRef.current.some((item) => item.url === normalizedUrl);
        if (exists) return;
        webLinksRef.current = [
          ...webLinksRef.current,
          link.title ? { url: normalizedUrl, title: link.title } : { url: normalizedUrl },
        ];
        webSearchEnabledRef.current = true;
        updateAssistantMeta();
      };

      const flushImmediate = (nextText: string) => {
        updateAssistant(nextText);
        pendingTextRef.current = "";
      };

      const startTyping = () => {
        if (typingActiveRef.current) return;
        typingActiveRef.current = true;

        const step = () => {
          if (!typingActiveRef.current) return;
          if (abortRef.current?.signal.aborted) {
            typingActiveRef.current = false;
            pendingTextRef.current = "";
            return;
          }

          const pending = pendingTextRef.current;
          if (!pending) {
            typingActiveRef.current = false;
            return;
          }

          const stepSize = Math.min(
            pending.length,
            Math.max(1, Math.ceil(pending.length / 80))
          );
          const nextChunk = pending.slice(0, stepSize);
          pendingTextRef.current = pending.slice(stepSize);
          updateAssistant(assistantTextRef.current + nextChunk);

          typingTimerRef.current = window.setTimeout(step, 16);
        };

        step();
      };

      const enqueueTyping = (text: string) => {
        if (!text) return;
        if (prefersReducedMotionRef.current) {
          flushImmediate(assistantTextRef.current + text);
          return;
        }
        pendingTextRef.current += text;
        startTyping();
      };

      const typeOutText = async (fullText: string) => {
        if (prefersReducedMotionRef.current) {
          flushImmediate(fullText);
          return;
        }
        if (assistantTextRef.current && fullText.startsWith(assistantTextRef.current)) {
          enqueueTyping(fullText.slice(assistantTextRef.current.length));
          return;
        }
        updateAssistant("");
        pendingTextRef.current = "";
        enqueueTyping(fullText);
      };

      try {
        hadDeltaRef.current = false;
        const res = await postChatStream(request, controller.signal);
        if (!res.ok || !res.body) {
          const message = await safeReadError(res);
          throw new Error(message || `Stream request failed (${res.status})`);
        }

        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("text/event-stream")) {
          const fallback = await res.json().catch(() => null);
          const answer =
            fallback?.answer ||
            fallback?.text ||
            fallback?.message ||
            "No response";
          await typeOutText(answer);
          setIsStreaming(false);
          abortRef.current = null;
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let done = false;

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          if (readerDone) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() || "";

          for (const part of parts) {
            const event = parseEventChunk(part);
            if (!event) continue;

            const isMessageEvent =
              event.type === "message" || event.type === "delta" || event.type === "token";

            if (event.type === "meta") {
              const payload = safeParseJson(event.data) as
                | { request_id?: string; allow_web_search?: boolean }
                | null;
              if (payload?.request_id) {
                setSessionId?.(payload.request_id);
              }
              if (typeof payload?.allow_web_search === "boolean") {
                webSearchEnabledRef.current = payload.allow_web_search;
                updateAssistantMeta();
              }
            }

            if (event.type === "thinking") {
              const payload = safeParseJson(event.data) as
                | { text?: string }
                | null;
              setThinkingText(payload?.text || "Analyzing...");
              setStatus(payload?.text || "Analyzing...");
              setStatusType("status");
            } else if (event.type === "page_ack") {
              // Brief acknowledgment — show as transient status
              const payload = safeParseJson(event.data) as
                | { text?: string }
                | null;
              if (payload?.text) {
                setStatus(payload.text);
                setStatusType("status");
              }
            } else if (event.type === "plan") {
              const payload = safeParseJson(event.data) as
                | { text?: string }
                | null;
              if (payload?.text) {
                setStatus(payload.text);
                setStatusType("status");
              }
            } else if (event.type === "tool_call") {
              const payload = safeParseJson(event.data) as
                | { tool_name?: string }
                | null;
              const name = payload?.tool_name || "tool";
              appendToolCall(name);
              setStatus(`Fetching ${name} data...`);
              setStatusType("status");
              setThinkingText(null);
            } else if (event.type.startsWith("search")) {
              const query = extractSearchQuery(event.data);
              appendWebSearch(query);
              const text = query ? `Searching for ${query}....` : "Searching...";
              setStatus(text);
              setStatusType("search");
            } else if (event.type === "status") {
              const parsed = safeParseJson(event.data);
              const statusValue = extractDeltaText(event.data);
              const statusNormalized = statusValue.toLowerCase();
              let searchQuery: string | null = null;

              if (
                parsed &&
                typeof parsed === "object" &&
                typeof parsed.status === "string" &&
                parsed.status.toLowerCase().includes("search")
              ) {
                searchQuery = extractSearchQuery(event.data);
              } else if (statusNormalized.includes("search")) {
                searchQuery = extractSearchText(statusValue);
              }

              if (searchQuery) {
                appendWebSearch(searchQuery);
                setStatus(`Searching for ${searchQuery}....`);
                setStatusType("search");
              } else {
                const nextStatus = formatStatusText(statusValue);
                setStatus(nextStatus.text);
                setStatusType(nextStatus.text ? nextStatus.type : null);
              }
            } else if (event.type === "citation") {
              const payload = safeParseJson(event.data) as
                | { url?: string; uri?: string; link?: string; title?: string }
                | null;
              const rawUrl =
                payload?.url || payload?.uri || payload?.link || null;
              if (typeof rawUrl === "string" && rawUrl.trim()) {
                appendWebLink({
                  url: rawUrl.trim(),
                  title:
                    typeof payload?.title === "string" && payload.title.trim()
                      ? payload.title.trim()
                      : undefined,
                });
              }
            }

            if (isMessageEvent) {
              const deltaTextRaw = extractDeltaText(event.data);
              const currentCombined = assistantTextRef.current + pendingTextRef.current;
              const merged = mergeStreamingText(currentCombined, deltaTextRaw);
              const deltaText = merged.slice(currentCombined.length);
              if (deltaText.length > 0) {
                hadDeltaRef.current = true;
                enqueueTyping(deltaText);
              }
            }

            if (event.type === "error") {
              const errorPayload = safeParseJson(event.data) as
                | { error?: string; message?: string }
                | null;
              setError(errorPayload?.error || errorPayload?.message || "Stream error");
              setStatus(null);
              setStatusType(null);
              done = true;
              break;
            }

            if (event.type === "done") {
              const payload = safeParseJson(event.data) as
                | { citations?: Array<{ url?: string; title?: string }> }
                | null;
              if (Array.isArray(payload?.citations)) {
                for (const item of payload.citations) {
                  if (!item || typeof item.url !== "string") continue;
                  appendWebLink({
                    url: item.url.trim(),
                    title:
                      typeof item.title === "string" && item.title.trim()
                        ? item.title.trim()
                        : undefined,
                  });
                }
              }
              updateAssistantMeta();
              if (!hadDeltaRef.current) {
                const finalText = extractDeltaText(event.data);
                if (finalText) {
                  await typeOutText(finalText);
                }
              }
              setStatus(null);
              setStatusType(null);
              setThinkingText(null);
              done = true;
              break;
            }
          }
        }

        if (done) {
          try {
            await reader.cancel();
          } catch {
            // Ignore cancellation errors
          }
        }
      } catch (err) {
        if (controller.signal.aborted) return;

        try {
          const fallback = await postChat(request, controller.signal);
          await typeOutText(fallback.answer || "");
        } catch (fallbackErr) {
          const message =
            fallbackErr instanceof Error
              ? fallbackErr.message
              : "Chat request failed";
          setError(message);
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
        setStatus(null);
        setStatusType(null);
        setThinkingText(null);
      }
    },
    [sessionId, isStreaming, setSessionId, messages]
  );

  return {
    messages,
    isStreaming,
    error,
    status,
    statusType,
    thinkingText,
    sendMessage,
    stop,
    clearMessages,
    setError,
  };
}
