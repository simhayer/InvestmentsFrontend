"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

type TabsCtx = { value: string; setValue: (v: string) => void };
const Ctx = createContext<TabsCtx | null>(null);

export function Tabs({
  defaultValue,
  children,
}: {
  defaultValue: string;
  children: React.ReactNode;
}) {
  const [value, setValue] = useState(defaultValue);
  return <Ctx.Provider value={{ value, setValue }}>{children}</Ctx.Provider>;
}
export function TabList({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex flex-wrap gap-2 rounded-2xl bg-neutral-100 p-1 ring-1 ring-neutral-200">
      {children}
    </div>
  );
}
export function TabTrigger({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  const ctx = useContext(Ctx)!;
  const active = ctx.value === value;
  return (
    <button
      onClick={() => ctx.setValue(value)}
      className={cn(
        "rounded-xl px-3.5 py-2 text-sm font-semibold transition shadow-[0_8px_20px_-14px_rgba(15,23,42,0.45)]",
        active
          ? "bg-white text-neutral-900 ring-1 ring-neutral-200"
          : "text-neutral-600 hover:text-neutral-900"
      )}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}
export function TabPanels({ children }: { children: React.ReactNode }) {
  return <div className="pt-2">{children}</div>;
}
export function TabPanel({
  value,
  children,
  mount = "unmount", // "unmount" | "mount-once"
}: {
  value: string;
  children: React.ReactNode;
  mount?: "unmount" | "mount-once";
}) {
  const ctx = useContext(Ctx)!;
  const active = ctx.value === value;
  const [everActive, setEverActive] = useState(false);
  useEffect(() => {
    if (active) setEverActive(true);
  }, [active]);

  if (mount === "unmount") return active ? <div>{children}</div> : null;
  // mount-once: render once, then toggle visibility
  if (!everActive && !active) return null;
  return (
    <div hidden={!active} aria-hidden={!active}>
      {children}
    </div>
  );
}
