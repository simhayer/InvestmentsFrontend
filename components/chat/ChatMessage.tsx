"use client";

import type { ChatMessage as ChatMessageType } from "@/types/chat";
import { cn } from "@/lib/utils";
import { formatChatMarkdown } from "@/lib/chatFormat";
import { renderMarkdown } from "@/lib/markdown";

type ChatMessageProps = {
  message: ChatMessageType;
  isDraft?: boolean;
};

export function ChatMessage({ message, isDraft }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "flex max-w-[86%] flex-col gap-1",
          isUser ? "items-end" : "items-start"
        )}
      >
        <span
          className={cn(
            "text-[10px] font-semibold uppercase tracking-widest",
            isUser ? "text-neutral-400" : "text-emerald-600/80"
          )}
        >
          {isUser ? "You" : "AI"}
        </span>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
            isUser
              ? "bg-neutral-900/90 text-white"
              : "border border-white/40 bg-white/55 text-neutral-900 backdrop-blur"
          )}
        >
          {message.text ? (
            isUser ? (
              <span className="whitespace-pre-wrap">{message.text}</span>
            ) : (
              <div
                className="chat-markdown"
                dangerouslySetInnerHTML={{
                  __html: renderMarkdown(formatChatMarkdown(message.text)),
                }}
              />
            )
          ) : isDraft ? (
            <span className="text-neutral-500 italic animate-pulse">
              Thinking...
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
