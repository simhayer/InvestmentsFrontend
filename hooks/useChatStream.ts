import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/types/chat";
import { postChat, postChatStream, safeReadError } from "@/lib/chatApi";

type UseChatStreamArgs = {
  sessionId: string | null;
  setSessionId?: (sessionId: string) => void;
};

type StreamEvent = {
  type: string;
  payload: unknown;
};

function coerceResponseMs(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function parseEventChunk(chunk: string): StreamEvent | null {
  const lines = chunk.split("\n");
  const eventLine = lines.find((line) => line.startsWith("event:"));
  const dataLines = lines.filter((line) => line.startsWith("data:"));

  if (dataLines.length === 0) return null;

  const event = eventLine ? eventLine.replace("event:", "").trim() : "delta";
  const raw = dataLines
    .map((line) => line.replace("data:", "").trim())
    .join("\n");

  let payload: any = null;
  try {
    payload = raw ? JSON.parse(raw) : null;
  } catch {
    payload = raw;
  }

  return { type: event, payload };
}

export function useChatStream({ sessionId, setSessionId }: UseChatStreamArgs) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const typingTimerRef = useRef<number | null>(null);
  const typingActiveRef = useRef(false);
  const pendingTextRef = useRef("");
  const prefersReducedMotionRef = useRef(false);
  const hadDeltaRef = useRef(false);

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
  }, [cancelTyping]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    pendingTextRef.current = "";
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
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

      const controller = new AbortController();
      abortRef.current = controller;

      const request = {
        message: trimmed,
        ...(sessionId ? { session_id: sessionId } : {}),
      };

      const assistantTextRef = { current: "" };
      const updateAssistant = (nextText: string) => {
        assistantTextRef.current = nextText;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId ? { ...msg, text: nextText } : msg
          )
        );
      };
      const updateAssistantMeta = (meta: Partial<ChatMessage>) => {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === assistantId ? { ...msg, ...meta } : msg))
        );
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
          if (fallback?.session_id) {
            setSessionId?.(fallback.session_id);
          }
          const fallbackMs = coerceResponseMs(fallback?.response_ms);
          if (fallbackMs !== null) {
            updateAssistantMeta({ responseMs: fallbackMs });
          }
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

            const payload = event.payload as any;
            const text =
              typeof payload === "string"
                ? payload
                : payload?.text || payload?.answer || payload?.message;

            if (event.type === "meta") {
              if (payload?.session_id) {
                setSessionId?.(payload.session_id);
              }
              const responseMs = coerceResponseMs(payload?.response_ms);
              if (responseMs !== null) {
                updateAssistantMeta({ responseMs });
              }
            }

            if (
              event.type === "delta" ||
              event.type === "message" ||
              event.type === "data" ||
              event.type === "chunk"
            ) {
              if (text) {
                hadDeltaRef.current = true;
                enqueueTyping(text);
              }
            }

            if (event.type === "final") {
              const responseMs = coerceResponseMs(payload?.response_ms);
              if (responseMs !== null) {
                updateAssistantMeta({ responseMs });
              }
              if (text) {
                if (hadDeltaRef.current) {
                  const combined =
                    assistantTextRef.current + pendingTextRef.current;
                  if (text.startsWith(combined)) {
                    enqueueTyping(text.slice(combined.length));
                  } else {
                    await typeOutText(text);
                  }
                } else {
                  await typeOutText(text);
                }
              }
              done = true;
              break;
            }

            if (event.type === "error") {
              setError(payload?.message || "Stream error");
              done = true;
              break;
            }

            const responseMs = coerceResponseMs(payload?.response_ms);
            if (responseMs !== null) {
              updateAssistantMeta({ responseMs });
            }

            if (
              event.type !== "meta" &&
              event.type !== "delta" &&
              event.type !== "final" &&
              event.type !== "error" &&
              event.type !== "ping" &&
              text
            ) {
              updateAssistant(assistantTextRef.current + text);
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
          if (fallback.session_id) {
            setSessionId?.(fallback.session_id);
          }
          const fallbackMs = coerceResponseMs(fallback.response_ms);
          if (fallbackMs !== null) {
            updateAssistantMeta({ responseMs: fallbackMs });
          }
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
      }
    },
    [sessionId, isStreaming, setSessionId]
  );

  return {
    messages,
    isStreaming,
    error,
    sendMessage,
    stop,
    clearMessages,
    setError,
  };
}
