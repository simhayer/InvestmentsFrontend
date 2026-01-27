import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/types/chat";
import { postChat, postChatStream, safeReadError } from "@/lib/chatApi";

type UseChatStreamArgs = {
  sessionId: string | null;
  setSessionId?: (sessionId: string) => void;
};

type StreamEvent = {
  type: string;
  data: string;
};

function parseEventChunk(chunk: string): StreamEvent | null {
  const lines = chunk.split("\n");
  let event = "delta";
  const dataLines: string[] = [];

  for (const line of lines) {
    const cleanLine = line.endsWith("\r") ? line.slice(0, -1) : line;
    if (cleanLine.startsWith("event:")) {
      event = cleanLine.slice("event:".length).trim() || "delta";
      continue;
    }
    if (cleanLine.startsWith("data:")) {
      let data = cleanLine.slice("data:".length);
      if (data.startsWith(" ")) data = data.slice(1);
      dataLines.push(data);
    }
  }

  if (dataLines.length === 0) return null;
  return { type: event, data: dataLines.join("\n") };
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
  return raw;
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

            const isDelta = event.type === "delta";

            if (event.type === "plan") {
              const payload = safeParseJson(event.data) as
                | { session_id?: string }
                | null;
              if (payload?.session_id) {
                setSessionId?.(payload.session_id);
              }
            }

            if (isDelta) {
              const deltaText = extractDeltaText(event.data);
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
              done = true;
              break;
            }

            if (event.type === "final") {
              if (!hadDeltaRef.current) {
                const finalText = extractDeltaText(event.data);
                if (finalText) {
                  await typeOutText(finalText);
                }
              }
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
          if (fallback.session_id) {
            setSessionId?.(fallback.session_id);
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
