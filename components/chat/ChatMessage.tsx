"use client";

import * as React from "react";
import type { ChatMessage as ChatMessageType } from "@/types/chat";
import { cn } from "@/lib/utils";
import { formatChatMarkdown } from "@/lib/chatFormat";
import { renderMarkdown } from "@/lib/markdown";
import { Bot, Copy, Check } from "lucide-react";

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
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "group flex w-full gap-3",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {/* AI Icon */}
      {!isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50">
          <Bot className="h-4 w-4 text-emerald-600" />
        </div>
      )}

      <div
        className={cn(
          "relative flex max-w-[85%] flex-col",
          isUser ? "items-end" : "items-start"
        )}
      >
        {/* Message Bubble */}
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl px-5 py-3.5 text-sm shadow-sm transition-all",
            isUser
              ? "rounded-br-sm bg-neutral-900 text-white"
              : "rounded-bl-sm border border-neutral-200 bg-white text-neutral-800"
          )}
        >
          {message.text ? (
            isUser ? (
              <span className="whitespace-pre-wrap leading-relaxed">
                {message.text}
              </span>
            ) : (
              <div
                className={cn(
                  // 1. Base Text Settings
                  "leading-[1.55]",
                  
                  // 2. Headings
                  "[&_h1]:mb-2 [&_h1]:mt-3 [&_h1]:text-[1.1rem] [&_h1]:font-bold",
                  "[&_h2]:mb-2 [&_h2]:mt-3 [&_h2]:text-[1.05rem] [&_h2]:font-bold",
                  "[&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:text-[1rem] [&_h3]:font-bold",
                  "[&_h4]:mb-2 [&_h4]:mt-3 [&_h4]:text-[0.98rem] [&_h4]:font-bold",

                  // 3. Paragraphs & Lists
                  "[&_p]:my-2",
                  "[&_ul]:my-2 [&_ul]:ml-5 [&_ul]:list-disc",
                  "[&_ol]:my-2 [&_ol]:ml-5 [&_ol]:list-decimal",
                  "[&_li]:my-1",

                  // 4. Code Blocks (Pre)
                  "[&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-[#f5f5f5] [&_pre]:p-3 [&_pre]:text-[0.85rem]",
                  
                  // 5. Inline Code
                  "[&_code]:rounded-md [&_code]:bg-[#f3f4f6] [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em]",
                  
                  // 6. Fix for Code inside Pre (Reset inline styles)
                  "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit",

                  // 7. Links & Blockquotes
                  "[&_a]:text-emerald-700 [&_a]:underline [&_a]:underline-offset-2",
                  "[&_blockquote]:my-2 [&_blockquote]:border-l-[3px] [&_blockquote]:border-gray-200 [&_blockquote]:pl-3 [&_blockquote]:text-gray-600"
                )}
                dangerouslySetInnerHTML={{
                  __html: renderMarkdown(formatChatMarkdown(message.text)),
                }}
              />
            )
          ) : isDraft ? (
            <ThinkingIndicator />
          ) : null}
        </div>

        {/* Copy Button */}
        {!isUser && message.text && !isDraft && (
          <div className="absolute -bottom-6 left-0 pt-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-[10px] font-medium text-neutral-400 hover:text-neutral-700"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-500" />
                  <span className="text-emerald-500">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

function ThinkingIndicator() {
  return (
    <div className="flex h-5 items-center gap-1 px-1">
      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500/60 [animation-delay:-0.3s]" />
      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500/60 [animation-delay:-0.15s]" />
      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500/60" />
    </div>
  );
}