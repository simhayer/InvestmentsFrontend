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
          "max-w-[82%] rounded-2xl px-3 py-2 text-sm shadow-sm",
          isUser
            ? "bg-neutral-900 text-white"
            : "bg-white text-neutral-900 border border-neutral-200"
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
          <span className="text-neutral-400 italic">Thinking...</span>
        ) : null}
      </div>
    </div>
  );
}
