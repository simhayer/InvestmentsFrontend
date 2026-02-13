// app/(protected)/layout.tsx
// NOTE: AuthProvider lives in app/layout.tsx (root) — do NOT duplicate it here.
import { ProtectedGate } from "./protected-shell";
import { ChatProvider } from "@/components/chat/ChatContext";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChatProvider>
      <ProtectedGate>
        {children}
      </ProtectedGate>
    </ChatProvider>
  );
}