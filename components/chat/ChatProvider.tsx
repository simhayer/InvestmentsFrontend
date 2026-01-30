"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { ChatMessage } from "@/types/chat"; // Ensure this matches your type definition
import { useChatStream } from "@/hooks/useChatStream"; // Your custom hook
import { useChatSessionId } from "@/hooks/useChatSessionId"; // Assuming you have this from previous code

type ChatContextType = {
  // UI State
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  
  // Logic State (Exposed from your hook)
  messages: ChatMessage[];
  isStreaming: boolean;
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

  // 1. Manage Session ID (Global)
  const { sessionId, setSessionId, resetSessionId } = useChatSessionId();

  // 2. Initialize YOUR Custom Hook
  const {
    messages,
    isStreaming,
    error,
    sendMessage: originalSendMessage,
    stop,
    clearMessages: originalClearMessages,
    setError,
  } = useChatStream({ sessionId, setSessionId });

  // 3. Wrapper to Inject Page Context
  // Since your hook's sendMessage takes a string, we prepend context here.
  const sendMessage = React.useCallback(async (text: string) => {
    if (!text.trim()) return;

    // Optional: Add hidden context so the AI knows where the user is
    // The user won't see this tag in their input, but the AI receives it.
    // If you prefer not to modify the text, just call originalSendMessage(text).
    // const contextEnhancedText = `[Current URL: ${pathname}] ${text}`; 
    
    await originalSendMessage(text);
  }, [originalSendMessage, pathname]);

  // 4. Wrapper to clear everything (session + messages)
  const clearAll = React.useCallback(() => {
    originalClearMessages();
    resetSessionId();
  }, [originalClearMessages, resetSessionId]);

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        setIsOpen,
        messages,
        isStreaming,
        error,
        setError,
        sendMessage,
        stop,
        clearMessages: clearAll,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = React.useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within a ChatProvider");
  return context;
}