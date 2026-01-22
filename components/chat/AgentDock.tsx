"use client";

import * as React from "react";
import { ChevronDown, ChevronUp, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AgentChat } from "@/components/chat/AgentChat";
import { useAgentDockStore } from "@/components/chat/agent-dock-store";

export function AgentDock() {
  const { isExpanded, isHidden, expand, collapse, hide, show } =
    useAgentDockStore();
  const dockRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!isExpanded || isHidden) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        collapse();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isExpanded, isHidden, collapse]);

  React.useEffect(() => {
    if (!isExpanded || isHidden) return;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target || !dockRef.current) return;
      if (dockRef.current.contains(target)) return;
      collapse();
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isExpanded, isHidden, collapse]);

  const handleToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (isExpanded) {
      collapse();
    } else {
      expand();
    }
  };

  const handleHide = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    hide();
  };

  const handleExpand = () => {
    if (!isExpanded) expand();
  };

  return (
    <>
      <div
        className={cn(
          "fixed bottom-4 left-1/2 z-40 -translate-x-1/2 sm:bottom-6",
          isHidden && "pointer-events-none opacity-0 translate-y-4"
        )}
        aria-hidden={isHidden}
      >
        <div
          ref={dockRef}
          onClick={handleExpand}
          className={cn(
            "flex w-[calc(100vw-24px)] max-w-[720px] flex-col overflow-hidden rounded-3xl border",
            "bg-white/20 text-neutral-900 shadow-xl backdrop-blur-xl",
            "border-white/20 transition-all duration-200 ease-out",
            "sm:w-[680px] sm:max-w-none lg:w-[720px] xl:w-[760px]",
            isExpanded
              ? "h-[70vh] max-h-[70vh] translate-y-0 opacity-100"
              : "h-14 translate-y-1 opacity-95 sm:h-16",
            !isExpanded && "cursor-pointer"
          )}
          role="region"
          aria-label="AI Agent dock"
        >
          <header className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/60 text-emerald-700 shadow-sm">
                <Sparkles className="h-4 w-4" />
              </span>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold">Agent</h2>
                <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                  Live
                </span>
              </div>
              <span className="hidden sm:inline text-xs text-neutral-600">
                Ask for scans, explanations, and drafts.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggle}
                aria-label={isExpanded ? "Collapse agent dock" : "Expand agent dock"}
                aria-expanded={isExpanded}
                className="rounded-full border border-white/30 bg-white/60 p-1 text-neutral-700 shadow-sm hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </button>
              <button
                type="button"
                onClick={handleHide}
                aria-label="Hide agent dock"
                className="rounded-full border border-white/30 bg-white/60 p-1 text-neutral-700 shadow-sm hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div
            className={cn(
              "flex min-h-0 flex-1 flex-col transition-all duration-200 ease-out",
              isExpanded
                ? "opacity-100 translate-y-0"
                : "pointer-events-none opacity-0 -translate-y-2"
            )}
          >
            <AgentChat
              open={isExpanded && !isHidden}
              variant="dock"
              isInteractive={isExpanded && !isHidden}
            />
          </div>
        </div>
      </div>

      {isHidden ? (
        <button
          type="button"
          onClick={show}
          aria-label="Open agent dock"
          className={cn(
            "fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full",
            "bg-neutral-900 px-4 py-2 text-sm font-semibold text-white shadow-lg",
            "hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          )}
        >
          <Sparkles className="h-4 w-4" />
          Agent
        </button>
      ) : null}
    </>
  );
}
