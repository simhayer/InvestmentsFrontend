"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatSessionId } from "@/hooks/useChatSessionId";
import { useChatStream } from "@/hooks/useChatStream";
import { ChatMessage } from "@/components/chat/ChatMessage";

type ChatPanelProps = {
  open: boolean;
  onClose: () => void;
};

export function ChatPanel({ open, onClose }: ChatPanelProps) {
  const [input, setInput] = React.useState("");
  const [isMobile, setIsMobile] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLTextAreaElement | null>(null);
  const listRef = React.useRef<HTMLDivElement | null>(null);

  const { sessionId, resetSessionId, setSessionId } = useChatSessionId();
  const { messages, isStreaming, error, sendMessage, stop, clearMessages } =
    useChatStream({ sessionId, setSessionId });

  React.useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const node = listRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, open, isStreaming]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  React.useEffect(() => {
    if (!open || !isMobile) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open, isMobile]);

  const handleSend = React.useCallback(async () => {
    if (!input.trim() || isStreaming) return;
    await sendMessage(input);
    setInput("");
  }, [input, sendMessage, isStreaming]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!open) return;
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose();
      return;
    }

    if (!isMobile || event.key !== "Tab") return;
    const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
      'button,[href],input,textarea,select,[tabindex]:not([tabindex="-1"])'
    );
    if (!focusable || focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const handleClear = () => {
    stop();
    clearMessages();
    resetSessionId();
  };

  const draftAssistantId = React.useMemo(() => {
    if (!isStreaming) return null;
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].role === "assistant") return messages[i].id;
    }
    return null;
  }, [messages, isStreaming]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50",
        open ? "pointer-events-auto" : "pointer-events-none"
      )}
    >
      <div
        className={cn(
          "absolute inset-0 bg-black/40 transition-opacity sm:hidden",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        id="chat-panel"
        role="dialog"
        aria-modal={isMobile ? true : undefined}
        aria-hidden={!open}
        onKeyDown={handleKeyDown}
        className={cn(
          "absolute flex flex-col bg-white shadow-2xl border border-neutral-200",
          "transition-all",
          isMobile
            ? "inset-0 rounded-none"
            : "bottom-24 right-6 w-[380px] h-[70vh] rounded-3xl",
          open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
      >
        <header className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
          <div>
            <h2 className="text-sm font-bold text-neutral-900">Chat</h2>
            <p className="text-[11px] text-neutral-400">
              Ask about your portfolio or market moves.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="text-xs font-medium text-neutral-500 hover:text-neutral-900"
            >
              Clear chat
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1 text-neutral-400 hover:text-neutral-900"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div
          ref={listRef}
          className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
        >
          {messages.length === 0 ? (
            <div className="text-sm text-neutral-400">
              Start a conversation to get tailored insights.
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isDraft={draftAssistantId === message.id}
              />
            ))
          )}
        </div>

        {error ? (
          <div className="px-4 pb-2">
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {error}
            </div>
          </div>
        ) : null}
        <div role="status" aria-live="polite" className="sr-only">
          {error ? `Chat error: ${error}` : ""}
        </div>

        <form
          className="border-t border-neutral-100 p-3"
          onSubmit={(event) => {
            event.preventDefault();
            handleSend();
          }}
        >
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleSend();
                }
              }}
              rows={2}
              placeholder="Ask about your holdings..."
              className="flex-1 resize-none rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            />
            <div className="flex flex-col gap-2">
              {isStreaming ? (
                <button
                  type="button"
                  onClick={stop}
                  className="rounded-2xl border border-neutral-200 px-3 py-2 text-xs font-semibold text-neutral-700 hover:border-neutral-300"
                >
                  Stop generating
                </button>
              ) : (
                <button
                  type="submit"
                  className="rounded-2xl bg-neutral-900 px-3 py-2 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
                  disabled={!input.trim()}
                >
                  Send
                </button>
              )}
            </div>
          </div>
          <div className="mt-2 text-[10px] text-neutral-400">
            Enter to send, Shift+Enter for a new line.
          </div>
        </form>
      </div>
    </div>
  );
}
