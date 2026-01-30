// app/(protected)/layout.tsx
import { AuthProvider } from "@/lib/auth-provider";
import { ProtectedGate } from "./protected-shell";
import { ChatProvider } from "@/components/chat/ChatContext"; // Import your provider

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ChatProvider>
        <ProtectedGate>
          {children}
        </ProtectedGate>
      </ChatProvider>
    </AuthProvider>
  );
}