"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import type { ChatMessage, PageContext, ChatContext as ChatCtxPayload } from "@/types/chat";
import { useChatStream } from "@/hooks/useChatStream";
import { useChatSessionId } from "@/hooks/useChatSessionId";

// ── Page Context Registry ──────────────────────────────────────────────
// Exposed so usePageContext (in any page) can register its context.
export const PageContextCtx = React.createContext<
  ((ctx: PageContext) => void) | null
>(null);

// ── Chat Context ───────────────────────────────────────────────────────
type ChatContextType = {
  // UI State
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;

  // Logic State
  messages: ChatMessage[];
  isStreaming: boolean;
  status: string | null;
  statusType: "status" | "search" | null;
  thinkingText: string | null;
  error: string | null;
  setError: (error: string | null) => void;
  sendMessage: (text: string) => Promise<void>;
  stop: () => void;
  clearMessages: () => void;
};

const ChatContext = React.createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();

  // 1. Page context registered by the currently-visible page
  const [pageContext, setPageContext] = React.useState<PageContext | null>(null);

  const registerPageContext = React.useCallback((ctx: PageContext) => {
    setPageContext(ctx);
  }, []);

  // Clear stale page context when the route changes
  React.useEffect(() => {
    setPageContext(null);
  }, [pathname]);

  // 2. Manage Session ID
  const { sessionId, setSessionId, resetSessionId } = useChatSessionId();

  // 3. Initialize the chat stream hook
  const {
    messages,
    isStreaming,
    status,
    statusType,
    thinkingText,
    error,
    sendMessage: originalSendMessage,
    stop,
    clearMessages: originalClearMessages,
    setError,
  } = useChatStream({ sessionId, setSessionId });

  // 4. Wrapper to inject page context into every request
  const sendMessage = React.useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      const context: ChatCtxPayload = {
        page: pageContext ?? undefined,
      };

      await originalSendMessage(text, context);
    },
    [originalSendMessage, pageContext],
  );

  // 5. Wrapper to clear everything
  const clearAll = React.useCallback(() => {
    originalClearMessages();
    resetSessionId();
  }, [originalClearMessages, resetSessionId]);

  return (
    <PageContextCtx.Provider value={registerPageContext}>
      <ChatContext.Provider
        value={{
          isOpen,
          setIsOpen,
          messages,
          isStreaming,
          status,
          statusType,
          thinkingText,
          error,
          setError,
          sendMessage,
          stop,
          clearMessages: clearAll,
        }}
      >
        {children}
      </ChatContext.Provider>
    </PageContextCtx.Provider>
  );
}

export function useChat() {
  const context = React.useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within a ChatProvider");
  return context;
}
