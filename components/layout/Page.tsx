// components/layout/page.tsx
import { cn } from "@/lib/utils";

export function Page({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-6 sm:space-y-7", className)}>{children}</div>
  );
}
