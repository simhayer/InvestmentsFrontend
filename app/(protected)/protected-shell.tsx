// app/(protected)/protected-shell.tsx  (SERVER)
import { AuthProvider } from "@/lib/auth-provider";
import { ProtectedClientShell } from "./protected-client-shell";
import type { User } from "@/types/user";

export default function ProtectedShell({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  return (
    <AuthProvider initialUser={user}>
      <ProtectedClientShell>{children}</ProtectedClientShell>
    </AuthProvider>
  );
}
