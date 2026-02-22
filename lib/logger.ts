/**
 * Shared logger for server and client. Logs to console with a consistent format.
 * On the client, error (and optionally warn) logs are also sent to the backend
 * so they appear in Railway backend logs. When a user is signed in, user_id is
 * included so logs can be backtracked by user.
 */

import { supabase } from "@/utils/supabaseClient";

const LOG_PREFIX = "[WallStreetAI]";

function formatMessage(level: string, message: string, meta?: Record<string, unknown>): string {
  const ts = new Date().toISOString();
  const base = `${LOG_PREFIX} ${ts} | ${level} | ${message}`;
  if (meta && Object.keys(meta).length > 0) {
    return `${base} | ${JSON.stringify(meta)}`;
  }
  return base;
}

function getApiUrl(): string | null {
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return null;
}

async function sendToBackend(level: string, message: string, meta?: Record<string, unknown>): Promise<void> {
  const apiUrl = getApiUrl();
  if (!apiUrl) return;
  try {
    let user_id: string | null = null;
    if (typeof window !== "undefined") {
      const { data } = await supabase.auth.getSession();
      user_id = data?.session?.user?.id ?? null;
    }
    const payload = { ...(meta ?? {}), ...(user_id ? { user_id } : {}) };
    await fetch(`${apiUrl}/api/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level, message, meta: payload }),
    });
  } catch {
    // Fire-and-forget; avoid recursive logging or blocking
  }
}

export const logger = {
  info(message: string, meta?: Record<string, unknown>): void {
    const formatted = formatMessage("INFO", message, meta);
    console.log(formatted);
  },

  warn(message: string, meta?: Record<string, unknown>): void {
    const formatted = formatMessage("WARN", message, meta);
    console.warn(formatted);
    if (typeof window !== "undefined") {
      sendToBackend("warn", message, meta);
    }
  },

  error(message: string, meta?: Record<string, unknown>): void {
    const formatted = formatMessage("ERROR", message, meta);
    console.error(formatted);
    if (typeof window !== "undefined") {
      sendToBackend("error", message, meta);
    }
  },
};
