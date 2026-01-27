"use client";

import * as React from "react";
import { ChevronDown, ChevronUp, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatSessionId } from "@/hooks/useChatSessionId";
import { useChatStream } from "@/hooks/useChatStream";
import { ChatMessage } from "@/components/chat/ChatMessage";

type ChatPanelProps = {
  open: boolean;
  onOpen?: () => void;
  onClose: () => void;
  className?: string;
};

const quickPrompts = [
  "Summarize this page for me.",
  "Explain today's portfolio movement.",
  "What risks should I watch right now?",
];

export function ChatPanel({
  open,
  onOpen,
  onClose,
  className,
}: ChatPanelProps) {
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

  const requestOpen = React.useCallback(() => {
    if (!open) onOpen?.();
  }, [onOpen, open]);

  const handleSend = React.useCallback(async () => {
    if (!input.trim() || isStreaming) return;
    requestOpen();
    await sendMessage(input);
    setInput("");
  }, [input, sendMessage, isStreaming, requestOpen]);

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
    <>
      <div className="pointer-events-none fixed inset-0 z-40">
        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-300/20 blur-[120px]" />
        <div className="absolute left-[20%] top-[30%] h-44 w-44 rounded-full bg-sky-300/20 blur-[90px]" />
      </div>

      <div
        ref={panelRef}
        id="chat-panel"
        role={open ? "dialog" : "region"}
        aria-modal={open && isMobile ? true : undefined}
        aria-expanded={open}
        onKeyDown={handleKeyDown}
        className={cn(
          "fixed z-50 transition-all duration-300",
          open && isMobile
            ? "inset-0"
            : "left-1/2 bottom-10 -translate-x-1/2",
          className
        )}
      >
        <div
          className={cn(
            "relative",
            open && isMobile ? "h-full w-full" : "w-[min(94vw,780px)]"
          )}
        >
          <div
            className={cn(
              "absolute -inset-4 rounded-[32px] opacity-70 blur-2xl",
              "bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.25),_rgba(56,189,248,0.18),_transparent_65%)]",
              open && isMobile ? "hidden" : "block"
            )}
          />

          <div
            className={cn(
              "relative flex flex-col overflow-hidden rounded-[28px] border border-white/30 bg-white/30 shadow-[0_40px_120px_rgba(15,23,42,0.18)] backdrop-blur-2xl",
              "transition-all duration-300",
              open ? "min-h-[420px] h-[70vh]" : "h-auto",
              open && isMobile
                ? "h-[100dvh] rounded-none border-0 bg-white/90"
                : ""
            )}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.65),_rgba(255,255,255,0.3),_transparent_70%)]" />

            <div className="relative z-10 flex h-full flex-col">
              <header
                className={cn(
                  "flex items-center justify-between px-5 pt-5",
                  open ? "pb-4" : "pb-3"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-600/80">
                      AI Copilot
                    </p>
                    <h2 className="text-sm font-semibold text-neutral-900">
                      Ask anything about this screen.
                    </h2>
                    {open ? (
                      <p className="text-[11px] text-neutral-500">
                        Context-aware answers, explanations, and next steps.
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-neutral-500">
                  {open ? (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500 transition hover:text-neutral-900"
                    >
                      Clear
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={open ? onClose : requestOpen}
                    className="hidden items-center gap-1 rounded-full border border-white/40 bg-white/50 px-3 py-1 text-[11px] font-semibold text-neutral-700 shadow-sm transition hover:bg-white/80 sm:flex"
                    aria-label={open ? "Collapse AI panel" : "Expand AI panel"}
                  >
                    {open ? "Collapse" : "Expand"}
                    {open ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronUp className="h-3 w-3" />
                    )}
                  </button>
                  {open ? (
                    <button
                      type="button"
                      onClick={onClose}
                      className="ml-1 rounded-full p-1 text-neutral-400 transition hover:text-neutral-900 sm:hidden"
                      aria-label="Collapse AI panel"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              </header>

              {open ? (
                <div
                  ref={listRef}
                  className="flex-1 space-y-4 overflow-y-auto px-5 pb-4"
                >
                  {messages.length === 0 ? (
                    <div className="flex h-full flex-col justify-center rounded-2xl border border-white/60 bg-white/50 px-4 py-6 text-center text-sm text-neutral-500">
                      <p className="text-base font-semibold text-neutral-900">
                        Your AI assistant is ready.
                      </p>
                      <p className="mt-2 text-[12px] text-neutral-500">
                        Ask about performance, risks, or anything on the page.
                      </p>
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
              ) : null}

              {error ? (
                <div className="px-5 pb-2">
                  <div className="rounded-2xl border border-rose-200/80 bg-rose-50/80 px-3 py-2 text-xs text-rose-700">
                    {error}
                  </div>
                </div>
              ) : null}
              <div role="status" aria-live="polite" className="sr-only">
                {error ? `Chat error: ${error}` : ""}
              </div>

              <form
                className={cn("px-5 pb-5", open ? "pt-0" : "pt-1")}
                onSubmit={(event) => {
                  event.preventDefault();
                  handleSend();
                }}
              >
                <div className="flex items-end gap-3 rounded-2xl border border-white/40 bg-white/45 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-white shadow-md">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <textarea
                    ref={inputRef}
                    value={input}
                    onFocus={requestOpen}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        handleSend();
                      }
                    }}
                    rows={open ? 2 : 1}
                    placeholder="Ask the AI about this page..."
                    className="flex-1 resize-none bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 outline-none"
                  />
                  <div className="flex flex-col gap-2">
                    {isStreaming ? (
                      <button
                        type="button"
                        onClick={stop}
                      className="rounded-full border border-white/40 bg-white/50 px-3 py-2 text-[11px] font-semibold text-neutral-700 transition hover:bg-white/80"
                    >
                      Stop
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="rounded-full bg-neutral-900/90 px-4 py-2 text-[11px] font-semibold text-white shadow transition hover:bg-neutral-900 disabled:opacity-50"
                      disabled={!input.trim()}
                    >
                      Send
                    </button>
                  )}
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[10px] text-neutral-500">
                  <span>Enter to send, Shift+Enter for a new line.</span>
                  <span className="text-emerald-600/80">
                    Context-aware responses enabled.
                  </span>
                </div>

                {!open ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {quickPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => {
                          setInput(prompt);
                          requestOpen();
                          inputRef.current?.focus();
                        }}
                        className="rounded-full border border-white/40 bg-white/50 px-3 py-1 text-[11px] font-semibold text-neutral-700 shadow-sm transition hover:bg-white/80"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                ) : null}
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
