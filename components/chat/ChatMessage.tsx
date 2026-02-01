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
};

export const ChatMessage = React.memo(function ChatMessage({
  message,
  isDraft,
}: ChatMessageProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = React.useState(false);

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
            <div className="max-w-[85%] rounded-2xl bg-neutral-900 px-4 py-2.5 text-[14.5px] leading-[1.6] text-white shadow-[0_2px_10px_-6px_rgba(0,0,0,0.25)]">
              <span className="whitespace-pre-wrap">{message.text}</span>
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
                <div className="relative border-l border-neutral-200/60 pl-5">
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
                      "[&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-neutral-200/60 [&_blockquote]:pl-4 [&_blockquote]:text-neutral-600"
                    )}
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(formatChatMarkdown(message.text)),
                    }}
                  />

                  {/* Copy button (top-right on hover, subtle) */}
                  <button
                    onClick={handleCopy}
                    className={cn(
                      "absolute right-0 top-0 rounded-md border border-neutral-200/60 bg-white/70 px-2 py-1 text-[11px] text-neutral-500",
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
