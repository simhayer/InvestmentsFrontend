// app/(protected)/layout.tsx
import { AuthProvider } from "@/lib/auth-provider";
import { ProtectedGate } from "./protected-shell";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ProtectedGate>{children}</ProtectedGate>
    </AuthProvider>
  );
}
