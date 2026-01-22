"use client";

import * as React from "react";

type DockSize = "expanded" | "collapsed";
type DockVisibility = "visible" | "hidden";

type AgentDockContextValue = {
  size: DockSize;
  visibility: DockVisibility;
  isExpanded: boolean;
  isCollapsed: boolean;
  isHidden: boolean;
  expand: () => void;
  collapse: () => void;
  hide: () => void;
  show: () => void;
};

const STORAGE_KEY = "agentDockState";

const AgentDockContext = React.createContext<AgentDockContextValue | null>(null);

export function AgentDockProvider({ children }: { children: React.ReactNode }) {
  const [size, setSize] = React.useState<DockSize>("collapsed");
  const [visibility, setVisibility] =
    React.useState<DockVisibility>("visible");

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia("(max-width: 640px)");
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const storedSize =
      stored === "expanded" || stored === "collapsed" ? stored : null;
    setSize(media.matches ? "collapsed" : storedSize || "collapsed");

    const handleChange = () => {
      if (media.matches) {
        setSize("collapsed");
      }
    };
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  const setSizePersisted = React.useCallback((next: DockSize) => {
    setSize(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  const expand = React.useCallback(() => {
    setSizePersisted("expanded");
  }, [setSizePersisted]);

  const collapse = React.useCallback(() => {
    setSizePersisted("collapsed");
  }, [setSizePersisted]);

  const hide = React.useCallback(() => {
    setVisibility("hidden");
  }, []);

  const show = React.useCallback(() => {
    setVisibility("visible");
  }, []);

  const value = React.useMemo<AgentDockContextValue>(
    () => ({
      size,
      visibility,
      isExpanded: size === "expanded",
      isCollapsed: size === "collapsed",
      isHidden: visibility === "hidden",
      expand,
      collapse,
      hide,
      show,
    }),
    [size, visibility, expand, collapse, hide, show]
  );

  return (
    <AgentDockContext.Provider value={value}>
      {children}
    </AgentDockContext.Provider>
  );
}

export function useAgentDockStore() {
  const context = React.useContext(AgentDockContext);
  if (!context) {
    throw new Error("useAgentDockStore must be used within AgentDockProvider");
  }
  return context;
}
