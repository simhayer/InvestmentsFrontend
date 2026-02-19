// components/chat/ChatPanel.tsx
"use client";

import * as React from "react";
import {
  Sparkles,
  ArrowUp,
  Square,
  Trash2,
  ChevronDown,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useChat } from "@/components/chat/ChatContext";
import { ChatMessage } from "@/components/chat/ChatMessage";
import type { ChatMessage as ChatMessageType } from "@/types/chat";

const quickPrompts = ["How is my portfolio doing today", "Suggest improvements for my portfolio", "Is apple a good buy right now?"];

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
  const [isFocused, setIsFocused] = React.useState(false);

  const inputRef = React.useRef<HTMLTextAreaElement | null>(null);
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const hasHistory = messages.length > 0;
  const normalizedStatus = (status || "").trim().toLowerCase();
  const isSearching =
    isStreaming && status && (statusType === "search" || normalizedStatus.startsWith("search"));
  const lastUserIndex = React.useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].role === "user") return i;
    }
    return -1;
  }, [messages]);

  // Draft assistant message while streaming (so "Thinking…" shows)
  const draftMessage: ChatMessageType | null = React.useMemo(() => {
    if (!isStreaming) return null;
    return {
      id: "draft",
      role: "assistant",
      text: "",
      createdAt: Date.now(),
    };
  }, [isStreaming]);

  // Auto-scroll (include draft row)
  React.useEffect(() => {
    if (!isOpen) return;
    const node = listRef.current;
    if (!node) return;

    if (messages.length > 0 || isStreaming) {
      node.scrollTop = node.scrollHeight;
    }
  }, [messages, isOpen, isStreaming]);

  // Click outside to minimize
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
        if (!isStreaming) setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isStreaming, setIsOpen]);

  const handleFocus = () => {
    setIsFocused(true);
    if (hasHistory) setIsOpen(true);
  };

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;
    setIsOpen(true);
    const current = input;
    setInput("");
    await sendMessage(current);
    setIsFocused(true);
  };

  const handleClear = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    stop();
    clearMessages();
    setIsOpen(false);
    setInput("");
  };

  const adjustHeight = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    target.style.height = "auto";
    target.style.height = `${Math.min(target.scrollHeight, 150)}px`;
    setInput(target.value);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "fixed left-1/2 z-50 flex -translate-x-1/2 flex-col justify-end transition-all duration-500",
        "w-[94%] max-w-[700px] bottom-6"
      )}
    >
      {/* HISTORY PANEL */}
      <div
        className={cn(
          "flex flex-col overflow-hidden bg-white/95 shadow-2xl backdrop-blur-xl transition-all duration-500",
          "border-x border-t border-white/50 ring-1 ring-black/5",
          isOpen
            ? "mb-[-1px] h-[60vh] rounded-t-3xl opacity-100"
            : "mb-4 h-0 rounded-3xl opacity-0"
        )}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-neutral-100 px-5 py-3">
          <div className="flex items-center gap-2 text-emerald-600">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              {isStreaming
                ? thinkingText
                  ? "AI Analyzing..."
                  : "AI Thinking..."
                : "AI Analyst"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleClear}
              className="rounded-lg p-2 text-neutral-400 hover:text-red-500"
              aria-label="Clear chat"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-2 text-neutral-400 hover:text-neutral-900"
              aria-label="Minimize chat"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div ref={listRef} className="flex-1 space-y-6 overflow-y-auto p-6 scrollbar-thin">
          {isStreaming && status && !isSearching && statusType === "status" && (
            <div className="flex items-center gap-2 rounded-full bg-emerald-50/80 px-3 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-100/70">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              <span className="truncate">{thinkingText || status}</span>
            </div>
          )}

          {messages.map((msg, index) => {
            const isStreamingMessage =
              isStreaming && msg.role === "assistant" && index === messages.length - 1;
            const isLastUserMessage =
              isStreaming &&
              isSearching &&
              msg.role === "user" &&
              index === lastUserIndex;

            return (
              <ChatMessage
                key={msg.id}
                message={msg}
                isStreaming={isStreamingMessage}
                subStatus={isLastUserMessage ? status : null}
              />
            );
          })}

          {/* Simple Thinking... row while streaming */}
          {draftMessage && <ChatMessage key={draftMessage.id} message={draftMessage} isDraft />}

          {error && <div className="px-4 text-xs text-red-500">Error: {error}</div>}
        </div>
      </div>

      {/* SUGGESTIONS (Show when focused + closed) */}
      <div
        className={cn(
          "absolute bottom-full left-0 mb-0 w-full transition-all duration-300",
          isFocused && !isOpen
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        )}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="flex flex-wrap justify-center gap-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => {
                  setInput(prompt);
                  inputRef.current?.focus();
                }}
                className="rounded-full border border-white/40 bg-white/80 px-4 py-2 text-xs font-medium text-neutral-600 shadow-sm backdrop-blur-md hover:bg-white hover:text-emerald-700 hover:shadow-md"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* INPUT BAR */}
      <div
        className={cn(
          "relative z-20 flex flex-col gap-2 bg-white shadow-[0_8px_40px_-12px_rgba(0,0,0,0.3)] transition-all duration-300",
          isOpen
            ? "rounded-b-3xl rounded-t-none border-t border-neutral-100"
            : "rounded-3xl border border-white/50 ring-1 ring-black/5"
        )}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-end p-1"
        >
          <div
            className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300",
              input.length > 0 || isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
            )}
          >
            {hasHistory ? (
              <History className="h-5 w-5 text-neutral-400" />
            ) : (
              <Sparkles className="h-5 w-5 animate-pulse text-emerald-500" />
            )}
          </div>

          <textarea
            ref={inputRef}
            value={input}
            onFocus={handleFocus}
            onChange={adjustHeight}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={1}
            placeholder={hasHistory ? "Continue analysis..." : "Ask AI to analyze..."}
            className={cn(
              "max-h-[150px] w-full resize-none bg-transparent py-3 text-base text-neutral-900 placeholder:text-neutral-400 focus:outline-none",
              input.length > 0 || isOpen ? "px-4" : "pl-12 pr-12"
            )}
            style={{ minHeight: "48px" }}
          />

          <div className="flex shrink-0 items-center pb-2 pr-2">
            {isStreaming ? (
              <button
                type="button"
                onClick={stop}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200"
                aria-label="Stop"
              >
                <Square className="h-3 w-3 fill-current" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full transition-all",
                  input.trim()
                    ? "bg-neutral-900 text-white shadow-md hover:bg-neutral-800"
                    : "bg-neutral-100 text-neutral-300"
                )}
                aria-label="Send"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
