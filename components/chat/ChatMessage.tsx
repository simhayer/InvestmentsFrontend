// components/chat/ChatMessage.tsx
"use client";

import * as React from "react";
import type { ChatMessage as ChatMessageType } from "@/types/chat";
import { cn } from "@/lib/utils";
import { formatChatMarkdown } from "@/lib/chatFormat";
import { renderMarkdown } from "@/lib/markdown";
import { Copy, Check } from "lucide-react";

type ChatMessageProps = {
  message: ChatMessageType;
  isDraft?: boolean;
  isStreaming?: boolean;
  subStatus?: string | null;
};

export const ChatMessage = React.memo(function ChatMessage({
  message,
  isDraft,
  isStreaming,
  subStatus,
}: ChatMessageProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = React.useState(false);
  const markdownSource = formatChatMarkdown(message.text);
  const toolCalls = message.toolCalls || [];
  const webSearches = message.webSearches || [];
  const webLinks = message.webLinks || [];
  const metadataLines: string[] = [];
  if (toolCalls.length > 0) {
    metadataLines.push(`Tools: ${toolCalls.join(", ")}`);
  }
  if (webSearches.length > 0) {
    metadataLines.push(`Web searches: ${webSearches.join(" | ")}`);
  } else if (message.webSearchEnabled) {
    metadataLines.push("Web searches: enabled");
  }

  const handleCopy = () => {
    if (!message.text) return;
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className={cn(
        "group w-full px-2 sm:px-4",
        isUser ? "flex justify-end" : "flex justify-start"
      )}
    >
      <div className="relative w-full max-w-3xl">
        <div className={cn("relative", isUser ? "flex justify-end" : "flex justify-start")}>
          {/* USER (compact bubble) */}
          {isUser ? (
            <div className="flex max-w-[85%] flex-col items-end gap-1">
              <div className="rounded-2xl bg-neutral-900 px-4 py-2.5 text-[14.5px] leading-[1.6] text-white shadow-[0_2px_10px_-6px_rgba(0,0,0,0.25)]">
                <span className="whitespace-pre-wrap">{message.text}</span>
              </div>
              {subStatus ? (
                <div className="text-[11px] font-medium text-neutral-400">
                  {subStatus}
                </div>
              ) : null}
            </div>
          ) : (
            /* ASSISTANT (editorial / research notes) */
            <div className="relative w-full text-[14.5px] leading-[1.65] text-neutral-800">
              {isDraft ? (
                // Simple ChatGPT-like thinking
                <div className="flex items-center gap-2 text-neutral-500">
                  <TypingDots />
                  <span className="text-[13px]">Thinking…</span>
                </div>
              ) : message.text ? (
                <div
                  className={cn(
                    "relative",
                    isStreaming
                      ? "rounded-2xl border border-emerald-100/70 bg-gradient-to-br from-emerald-50/70 via-white to-white px-5 py-4 shadow-[0_10px_30px_-22px_rgba(16,185,129,0.6)]"
                      : "border-l border-neutral-200/60 pl-5"
                  )}
                >
                  <div
                    className={cn(
                      "leading-[1.65]",

                      // headings (slightly toned down, Notion-like)
                      "[&_h1]:mb-2 [&_h1]:mt-5 [&_h1]:text-[1.08rem] [&_h1]:font-semibold",
                      "[&_h2]:mb-2 [&_h2]:mt-5 [&_h2]:text-[1.03rem] [&_h2]:font-semibold",
                      "[&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-[0.98rem] [&_h3]:font-semibold",
                      "[&_h4]:mb-2 [&_h4]:mt-5 [&_h4]:text-[0.95rem] [&_h4]:font-semibold",

                      // paragraphs & lists (more white space)
                      "[&_p]:my-3.5",
                      "[&_ul]:my-3.5 [&_ul]:ml-6 [&_ul]:list-disc",
                      "[&_ol]:my-3.5 [&_ol]:ml-6 [&_ol]:list-decimal",
                      "[&_li]:my-1.5",

                      // pre/code (lighter borders, less “card”)
                      "[&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-neutral-200/60 [&_pre]:bg-neutral-50 [&_pre]:p-3.5 [&_pre]:text-[0.85rem]",
                      "[&_code]:rounded-md [&_code]:bg-neutral-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em]",
                      "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit",

                      // links & blockquotes
                      "[&_a]:text-emerald-700 [&_a]:underline [&_a]:underline-offset-2",
                      "[&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-neutral-200/60 [&_blockquote]:pl-4 [&_blockquote]:text-neutral-600",

                      // markdown tables
                      "[&_.md-table-wrap]:my-4 [&_.md-table-wrap]:w-full [&_.md-table-wrap]:overflow-x-auto [&_.md-table-wrap]:rounded-xl [&_.md-table-wrap]:border [&_.md-table-wrap]:border-neutral-200/70",
                      "[&_table]:w-full [&_table]:min-w-[540px] [&_table]:border-collapse [&_table]:text-left [&_table]:text-[0.9rem]",
                      "[&_thead]:bg-neutral-50/80",
                      "[&_th]:whitespace-nowrap [&_th]:border-b [&_th]:border-neutral-200/70 [&_th]:px-3 [&_th]:py-2 [&_th]:font-semibold",
                      "[&_td]:align-top [&_td]:border-b [&_td]:border-neutral-100 [&_td]:px-3 [&_td]:py-2"
                    )}
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(markdownSource),
                    }}
                  />
                  {metadataLines.length > 0 ? (
                    <div className="mt-3 space-y-1 text-[11px] text-neutral-500">
                      {metadataLines.map((line) => (
                        <div key={line}>{line}</div>
                      ))}
                    </div>
                  ) : null}
                  {webLinks.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                      {webLinks.map((item) => (
                        <a
                          key={item.url}
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-md border border-neutral-200/70 bg-neutral-50 px-2 py-1 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-800"
                        >
                          {item.title || item.url}
                        </a>
                      ))}
                    </div>
                  ) : null}

                  {/* Copy button (top-right on hover, subtle) */}
                  <button
                    onClick={handleCopy}
                    className={cn(
                      "absolute rounded-md border border-neutral-200/60 bg-white/70 px-2 py-1 text-[11px] text-neutral-500",
                      isStreaming ? "right-2 top-2" : "right-0 top-0",
                      "shadow-[0_3px_14px_-10px_rgba(0,0,0,0.18)] backdrop-blur",
                      "opacity-0 transition-opacity group-hover:opacity-100 hover:text-neutral-900"
                    )}
                    aria-label="Copy assistant message"
                  >
                    <span className="flex items-center gap-1.5">
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </span>
                  </button>
                </div>
              ) : null}

              {/* divider (very light) */}
              {!isDraft && <div className="mt-7 h-px w-full bg-neutral-200/40" />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

function TypingDots() {
  return (
    <div className="flex items-center gap-1">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:-0.25s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:-0.125s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400" />
    </div>
  );
}
