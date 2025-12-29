"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

type TabsCtx = { value: string; setValue: (v: string) => void };
const Ctx = createContext<TabsCtx | null>(null);

/**
 * Main Tabs Wrapper
 * Now accepts className to fix the "IntrinsicAttributes" error
 */
export function Tabs({
  defaultValue,
  children,
  className,
  ...props
}: {
  defaultValue: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  const [value, setValue] = useState(defaultValue);
  return (
    <Ctx.Provider value={{ value, setValue }}>
      <div className={className} {...props}>
        {children}
      </div>
    </Ctx.Provider>
  );
}

export function TabList({
  children,
  className,
  ...props
}: { children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex flex-wrap gap-2 rounded-2xl bg-neutral-100 p-1 ring-1 ring-neutral-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function TabTrigger({
  value,
  children,
  className,
  ...props
}: {
  value: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const ctx = useContext(Ctx)!;
  const active = ctx.value === value;

  return (
    <button
      onClick={(e) => {
        ctx.setValue(value);
        props.onClick?.(e);
      }}
      className={cn(
        "rounded-xl px-3.5 py-2 text-sm font-semibold transition",
        active
          ? "bg-white text-neutral-900 ring-1 ring-neutral-200 shadow-sm"
          : "text-neutral-600 hover:text-neutral-900",
        className
      )}
      aria-pressed={active}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabPanels({
  children,
  className,
  ...props
}: { children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("pt-2", className)} {...props}>
      {children}
    </div>
  );
}

export function TabPanel({
  value,
  children,
  mount = "unmount",
  className,
  ...props
}: {
  value: string;
  children: React.ReactNode;
  mount?: "unmount" | "mount-once";
} & React.HTMLAttributes<HTMLDivElement>) {
  const ctx = useContext(Ctx)!;
  const active = ctx.value === value;
  const [everActive, setEverActive] = useState(false);

  useEffect(() => {
    if (active) setEverActive(true);
  }, [active]);

  if (mount === "unmount") {
    return active ? (
      <div className={className} {...props}>
        {children}
      </div>
    ) : null;
  }

  if (!everActive && !active) return null;

  return (
    <div
      hidden={!active}
      aria-hidden={!active}
      className={cn(active ? "block" : "hidden", className)}
      {...props}
    >
      {children}
    </div>
  );
}
