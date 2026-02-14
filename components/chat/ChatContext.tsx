"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { ChatMessage } from "@/types/chat"; 
import { useChatStream } from "@/hooks/useChatStream"; // Your custom hook
import { useChatSessionId } from "@/hooks/useChatSessionId"; // Your session hook

type ChatContextType = {
  // UI State
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  
  // Logic State (Exposed from your custom hook)
  messages: ChatMessage[];
  isStreaming: boolean;
  status: string | null;
  statusType: "status" | "search" | null;
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

  // 1. Manage Session ID
  const { sessionId, setSessionId, resetSessionId } = useChatSessionId();

  // 2. Initialize YOUR Custom Hook
  const {
    messages,
    isStreaming,
    status,
    statusType,
    error,
    sendMessage: originalSendMessage,
    stop,
    clearMessages: originalClearMessages,
    setError,
  } = useChatStream({ sessionId, setSessionId });

  // 3. Wrapper to Inject Page Context (Optional but recommended)
  // This helps the AI know which page the user is looking at without user typing it.
  const sendMessage = React.useCallback(async (text: string) => {
    if (!text.trim()) return;
    
    // NOTE: If you want to silently send the URL to your backend, 
    // you can append it here or handle it in your API route.
    // const contextText = `[Context: ${pathname}] ${text}`; 
    
    await originalSendMessage(text);
  }, [originalSendMessage, pathname]);

  // 4. Wrapper to clear everything
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
        status,
        statusType,
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
