"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

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
  return <div className="flex gap-1 border-b border-slate-200">{children}</div>;
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
      className={`px-3 py-2 text-sm border-b-2 -mb-px ${
        active
          ? "border-slate-900 text-slate-900"
          : "border-transparent text-slate-600 hover:text-slate-900"
      }`}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}
export function TabPanels({ children }: { children: React.ReactNode }) {
  return <div className="pt-4">{children}</div>;
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
