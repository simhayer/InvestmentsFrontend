"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AgentChat } from "@/components/chat/AgentChat";

type ChatPanelProps = {
  open: boolean;
  onClose: () => void;
};

export function ChatPanel({ open, onClose }: ChatPanelProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!open) return;
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose();
    }
  };

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
        id="chat-panel"
        role="dialog"
        aria-hidden={!open}
        onKeyDown={handleKeyDown}
        className={cn(
          "absolute flex flex-col bg-white shadow-2xl border border-neutral-200",
          "transition-all",
          "inset-0 rounded-none sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[70vh] sm:w-[380px] sm:rounded-3xl",
          open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
      >
        <header className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-neutral-900">Agent</h2>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-700">
              Live
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-neutral-400 hover:text-neutral-900"
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <AgentChat open={open} variant="panel" isInteractive={open} />
      </div>
    </div>
  );
}
