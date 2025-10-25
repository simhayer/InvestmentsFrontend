// app/(protected)/protected-shell.tsx  (Server component)
import { getCurrentUser } from "@/lib/auth";
import { AuthProvider } from "@/lib/auth-provider";
import { ProtectedClientShell } from "./protected-client-shell"; // ⬅️ separate file

export default async function ProtectedShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  console.log("ProtectedShell user:", user);
  return (
    <AuthProvider initialUser={user}>
      <ProtectedClientShell>{children}</ProtectedClientShell>
    </AuthProvider>
  );
}
