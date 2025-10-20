// app/(public)/layout.tsx
import PublicShell from "./public-shell";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicShell>{children}</PublicShell>;
}
