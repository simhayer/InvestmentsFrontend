import type React from "react";

export function Skeleton({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse bg-gray-300 dark:bg-gray-700 rounded ${className}`}
    />
  );
}
