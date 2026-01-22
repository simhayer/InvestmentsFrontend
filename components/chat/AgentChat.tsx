"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useChatSessionId } from "@/hooks/useChatSessionId";
import { useChatStream } from "@/hooks/useChatStream";
import { ChatMessage } from "@/components/chat/ChatMessage";

type AgentChatProps = {
  open: boolean;
  variant?: "panel" | "dock";
  isInteractive?: boolean;
};

const QUICK_ACTIONS = [
  {
    label: "Run scan",
    prompt:
      "Scan my portfolio for concentration risk and summarize the top three issues.",
  },
  {
    label: "Explain holdings",
    prompt:
      "Explain my top holdings in plain English and highlight any red flags.",
  },
  {
    label: "Draft rebalance",
    prompt: "Draft a conservative rebalance plan for the next 30 days.",
  },
  {
    label: "Summarize risk",
    prompt:
      "Summarize the key market risks this week that impact my positions.",
  },
];

export function AgentChat({
  open,
  variant = "panel",
  isInteractive = true,
}: AgentChatProps) {
  const [input, setInput] = React.useState("");
  const inputRef = React.useRef<HTMLTextAreaElement | null>(null);
  const listRef = React.useRef<HTMLDivElement | null>(null);

  const { sessionId, resetSessionId, setSessionId } = useChatSessionId();
  const { messages, isStreaming, error, sendMessage, stop, clearMessages } =
    useChatStream({ sessionId, setSessionId });

  React.useEffect(() => {
    if (!open || !isInteractive) return;
    inputRef.current?.focus();
  }, [open, isInteractive]);

  React.useEffect(() => {
    if (!open) return;
    const node = listRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, open, isStreaming]);

  const handleSend = React.useCallback(async () => {
    if (!isInteractive || !input.trim() || isStreaming) return;
    await sendMessage(input);
    setInput("");
  }, [input, sendMessage, isStreaming, isInteractive]);

  const handleQuickAction = React.useCallback(
    async (prompt: string) => {
      if (!isInteractive || isStreaming) return;
      await sendMessage(prompt);
    },
    [isStreaming, sendMessage, isInteractive]
  );

  const handleClear = React.useCallback(() => {
    stop();
    clearMessages();
    resetSessionId();
  }, [stop, clearMessages, resetSessionId]);

  const draftAssistantId = React.useMemo(() => {
    if (!isStreaming) return null;
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].role === "assistant") return messages[i].id;
    }
    return null;
  }, [messages, isStreaming]);

  const surfaceClass =
    variant === "dock"
      ? "border-white/20 bg-white/30 backdrop-blur-xl"
      : "border-neutral-100 bg-neutral-50/80";
  const actionButtonClass =
    variant === "dock"
      ? "border-white/30 bg-white/70 text-neutral-800 hover:bg-white/80"
      : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50";
  const inputClass =
    variant === "dock"
      ? "border-white/30 bg-white/80 text-neutral-900 placeholder:text-neutral-500"
      : "border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-500";
  const footerClass =
    variant === "dock" ? "border-white/20 bg-white/20" : "border-neutral-100";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-4 pt-3">
        <div
          className={cn("rounded-2xl border p-3 shadow-sm", surfaceClass)}
          aria-label="Quick actions"
        >
          <div className="flex items-center justify-between gap-3">
            <p
              className={cn(
                "text-[10px] font-bold uppercase tracking-widest",
                variant === "dock" ? "text-neutral-600" : "text-neutral-400"
              )}
            >
              Quick actions
            </p>
            <button
              type="button"
              onClick={handleClear}
              disabled={!isInteractive}
              className={cn(
                "text-[11px] font-semibold",
                variant === "dock"
                  ? "text-neutral-700 hover:text-neutral-900"
                  : "text-neutral-500 hover:text-neutral-900",
                !isInteractive && "pointer-events-none opacity-50"
              )}
            >
              Reset
            </button>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => handleQuickAction(action.prompt)}
                disabled={!isInteractive || isStreaming}
                className={cn(
                  "flex items-center justify-between rounded-xl border px-3 py-2 text-left text-xs font-semibold shadow-sm transition",
                  actionButtonClass,
                  "disabled:opacity-60"
                )}
              >
                <span>{action.label}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                  Run
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        ref={listRef}
        className="flex-1 min-h-0 space-y-3 overflow-y-auto px-4 py-4"
      >
        {messages.length === 0 ? (
          <div className="text-sm text-neutral-400">
            Assign the agent a task to begin.
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
        {error ? `Agent error: ${error}` : ""}
      </div>

      <form
        className={cn("border-t p-3", footerClass)}
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
            placeholder="Tell your agent what to do..."
            disabled={!isInteractive}
            className={cn(
              "flex-1 resize-none rounded-2xl border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
              inputClass,
              !isInteractive && "opacity-70"
            )}
          />
          <div className="flex flex-col gap-2">
            {isStreaming ? (
              <button
                type="button"
                onClick={stop}
                disabled={!isInteractive}
                className={cn(
                  "rounded-2xl border px-3 py-2 text-xs font-semibold",
                  actionButtonClass,
                  !isInteractive && "pointer-events-none opacity-50"
                )}
              >
                Stop agent
              </button>
            ) : (
              <button
                type="submit"
                disabled={!isInteractive || !input.trim()}
                className={cn(
                  "rounded-2xl bg-neutral-900 px-3 py-2 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-50",
                  variant === "dock" && "bg-neutral-900/90 hover:bg-neutral-900"
                )}
              >
                Send
              </button>
            )}
          </div>
        </div>
        <div className="mt-2 text-[10px] text-neutral-400">
          Enter to run, Shift+Enter for a new line.
        </div>
      </form>
    </div>
  );
}
