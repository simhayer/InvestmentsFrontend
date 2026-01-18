"use client";

import * as React from "react";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatPanel } from "@/components/chat/ChatPanel";

type ChatLauncherProps = {
  className?: string;
};

export function ChatLauncher({ className }: ChatLauncherProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls="chat-panel"
        className={cn(
          "fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full",
          "bg-neutral-900 px-4 py-2 text-sm font-semibold text-white shadow-lg",
          "hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
          className
        )}
      >
        <MessageCircle className="h-4 w-4" />
        Chat
      </button>

      <ChatPanel
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
