import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "chat_session_id";

function getStoredSessionId() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEY);
}

function setStoredSessionId(sessionId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, sessionId);
}

export function useChatSessionId() {
  const [sessionId, setSessionIdState] = useState<string | null>(null);

  useEffect(() => {
    const existing = getStoredSessionId();
    if (existing) {
      setSessionIdState(existing);
    }
  }, []);

  const setSessionId = useCallback((nextId: string) => {
    setStoredSessionId(nextId);
    setSessionIdState(nextId);
  }, []);

  const resetSessionId = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setSessionIdState(null);
    return null;
  }, []);

  return {
    sessionId,
    setSessionId,
    resetSessionId,
  };
}
