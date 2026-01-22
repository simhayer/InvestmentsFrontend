"use client";

import type { ChatMessage as ChatMessageType } from "@/types/chat";
import { cn } from "@/lib/utils";
import { renderMarkdown } from "@/lib/markdown";

type ChatMessageProps = {
  message: ChatMessageType;
  isDraft?: boolean;
};

export function ChatMessage({ message, isDraft }: ChatMessageProps) {
  const isUser = message.role === "user";
  const responseMs =
    typeof message.responseMs === "number" && Number.isFinite(message.responseMs)
      ? Math.round(message.responseMs)
      : null;

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "flex max-w-[82%] flex-col",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "w-full rounded-2xl px-3 py-2 text-sm shadow-sm",
            isUser
              ? "bg-neutral-900/90 text-white"
              : "bg-white/90 text-neutral-900 border border-white/60"
          )}
        >
          {message.text ? (
            isUser ? (
              <span className="whitespace-pre-wrap">{message.text}</span>
            ) : (
              <div
                className="chat-markdown"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(message.text) }}
              />
            )
          ) : isDraft ? (
            <span className="text-neutral-400 italic">Working...</span>
          ) : null}
        </div>
        {!isUser && responseMs !== null ? (
          <div className="mt-1 text-[10px] text-neutral-400">
            Response time: {responseMs} ms
          </div>
        ) : null}
      </div>
    </div>
  );
}
