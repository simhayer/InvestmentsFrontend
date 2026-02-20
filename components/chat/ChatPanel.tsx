"use client";

import * as React from "react";
import {
  Sparkles,
  ArrowUp,
  Square,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useChat } from "@/components/chat/ChatContext";
import { ChatMessage } from "@/components/chat/ChatMessage";
import type { ChatMessage as ChatMessageType } from "@/types/chat";

const quickPrompts = [
  "How is my portfolio doing today",
  "Suggest improvements for my portfolio",
  "Is apple a good buy right now?",
];

export function ChatPanel() {
  const {
    isOpen,
    setIsOpen,
    messages,
    sendMessage,
    isStreaming,
    status,
    statusType,
    thinkingText,
    stop,
    clearMessages,
    error,
  } = useChat();

  const [input, setInput] = React.useState("");
  const inputRef = React.useRef<HTMLTextAreaElement | null>(null);
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const userScrolledUpRef = React.useRef(false);

  const hasHistory = messages.length > 0;
  const normalizedStatus = (status || "").trim().toLowerCase();
  const isSearching =
    isStreaming &&
    status &&
    (statusType === "search" || normalizedStatus.startsWith("search"));

  const lastUserIndex = React.useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].role === "user") return i;
    }
    return -1;
  }, [messages]);

  const draftMessage: ChatMessageType | null = React.useMemo(() => {
    if (!isStreaming) return null;
    return { id: "draft", role: "assistant", text: "", createdAt: Date.now() };
  }, [isStreaming]);

  React.useEffect(() => {
    if (!isStreaming) userScrolledUpRef.current = false;
  }, [isStreaming]);

  React.useEffect(() => {
    if (!isOpen) return;
    const node = listRef.current;
    if (!node) return;
    if ((messages.length > 0 || isStreaming) && !userScrolledUpRef.current) {
      node.scrollTop = node.scrollHeight;
    }
  }, [messages, isOpen, isStreaming]);

  React.useEffect(() => {
    const node = listRef.current;
    if (!node) return;
    let lastTouchY = 0;
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY < 0) {
        userScrolledUpRef.current = true;
      } else if (e.deltaY > 0) {
        const dist = node.scrollHeight - node.scrollTop - node.clientHeight;
        if (dist <= 30) userScrolledUpRef.current = false;
      }
    };
    const onTouchStart = (e: TouchEvent) => {
      lastTouchY = e.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      const curY = e.touches[0]?.clientY ?? 0;
      const delta = curY - lastTouchY;
      if (delta > 5) {
        userScrolledUpRef.current = true;
      } else if (delta < -5) {
        const dist = node.scrollHeight - node.scrollTop - node.clientHeight;
        if (dist <= 30) userScrolledUpRef.current = false;
      }
      lastTouchY = curY;
    };
    node.addEventListener("wheel", onWheel, { passive: true });
    node.addEventListener("touchstart", onTouchStart, { passive: true });
    node.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      node.removeEventListener("wheel", onWheel);
      node.removeEventListener("touchstart", onTouchStart);
      node.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        if (!isStreaming) setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, isStreaming, setIsOpen]);

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
      if (e.key === "Escape" && isOpen && !isStreaming) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, isStreaming, setIsOpen]);

  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async (text?: string) => {
    const msg = text ?? input;
    if (!msg.trim() || isStreaming) return;
    if (!text) setInput("");
    userScrolledUpRef.current = false;
    await sendMessage(msg);
  };

  const handleClear = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    stop();
    clearMessages();
    setInput("");
  };

  const adjustHeight = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    target.style.height = "auto";
    target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
    setInput(target.value);
  };

  return (
    <>
      {/* ── Floating trigger ── */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-5 right-5 z-50 flex h-11 items-center gap-2 rounded-full px-4",
          "bg-neutral-900 text-white shadow-lg transition-all hover:bg-neutral-800",
          "sm:bottom-6 sm:right-6",
          isOpen && "pointer-events-none scale-90 opacity-0"
        )}
        aria-label="Open AI assistant"
      >
        <Sparkles className="h-4 w-4" />
        <span className="text-sm font-medium">Ask AI</span>
      </button>

      {/* ── Backdrop (mobile only) ── */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/30 transition-opacity md:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => !isStreaming && setIsOpen(false)}
      />

      {/* ── Panel ── */}
      <div
        ref={panelRef}
        className={cn(
          "fixed z-50 flex flex-col bg-white shadow-2xl transition-transform duration-300 ease-out",
          "inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl",
          isOpen ? "translate-y-0" : "translate-y-full",
          "md:inset-x-auto md:left-auto md:bottom-auto md:right-0 md:top-0 md:h-full md:w-[380px] md:max-h-full md:rounded-none md:border-l md:border-neutral-200/60",
          isOpen ? "md:translate-x-0 md:translate-y-0" : "md:translate-x-full md:translate-y-0",
        )}
      >
        {/* ── Header ── */}
        <div className="flex shrink-0 items-center justify-between border-b border-neutral-100 px-4 py-3">
          <div className="absolute left-1/2 top-2 h-1 w-8 -translate-x-1/2 rounded-full bg-neutral-200 md:hidden" />

          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-neutral-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              {isStreaming
                ? thinkingText
                  ? "Analyzing..."
                  : "Thinking..."
                : "AI Assistant"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {hasHistory && (
              <button
                onClick={handleClear}
                className="rounded-lg p-1.5 text-neutral-400 hover:text-red-500"
                aria-label="Clear chat"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 text-neutral-400 hover:text-neutral-900"
              aria-label="Close assistant"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Messages ── */}
        <div ref={listRef} className="flex-1 overflow-y-auto scrollbar-thin">
          {!hasHistory && !isStreaming ? (
            <div className="flex h-full flex-col items-center justify-center gap-5 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
                <Sparkles className="h-5 w-5 text-neutral-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-neutral-700">
                  Ask me anything
                </p>
                <p className="mt-1 text-xs text-neutral-400">
                  Portfolio analysis, stock research, market insights
                </p>
              </div>
              <div className="flex w-full flex-col gap-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    className="w-full rounded-xl border border-neutral-200/60 bg-neutral-50/50 px-3.5 py-2.5 text-left text-[13px] text-neutral-600 transition-colors hover:border-neutral-300 hover:bg-neutral-100/70"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-5 p-4">
              {isStreaming && status && !isSearching && statusType === "status" && (
                <div className="flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-medium text-neutral-600">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neutral-400" />
                  <span className="truncate">{thinkingText || status}</span>
                </div>
              )}

              {messages.map((msg, index) => {
                const isStreamingMessage =
                  isStreaming && msg.role === "assistant" && index === messages.length - 1;
                const isLastUserMessage =
                  isStreaming && isSearching && msg.role === "user" && index === lastUserIndex;

                return (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    isStreaming={isStreamingMessage}
                    subStatus={isLastUserMessage ? status : null}
                  />
                );
              })}

              {draftMessage && (
                <ChatMessage key={draftMessage.id} message={draftMessage} isDraft />
              )}

              {error && (
                <div className="px-3 text-xs text-red-500">Error: {error}</div>
              )}
            </div>
          )}
        </div>

        {/* ── Input ── */}
        <div className="shrink-0 border-t border-neutral-100 bg-white p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-end gap-2"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={adjustHeight}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
              placeholder="Ask something..."
              className="max-h-[120px] flex-1 resize-none rounded-xl border border-neutral-200 bg-neutral-50/50 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-300 focus:bg-white focus:outline-none"
              style={{ minHeight: "40px" }}
            />
            {isStreaming ? (
              <button
                type="button"
                onClick={stop}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                aria-label="Stop"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all",
                  input.trim()
                    ? "bg-neutral-900 text-white hover:bg-neutral-800"
                    : "bg-neutral-100 text-neutral-300"
                )}
                aria-label="Send"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            )}
          </form>
          <div className="mt-2 text-center">
            <span className="text-[10px] text-neutral-300">
              <kbd className="rounded border border-neutral-200 px-1 font-mono text-[9px]">
                {typeof navigator !== "undefined" && /Mac/.test(navigator.userAgent) ? "⌘" : "Ctrl"}
              </kbd>
              {" + "}
              <kbd className="rounded border border-neutral-200 px-1 font-mono text-[9px]">K</kbd>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
