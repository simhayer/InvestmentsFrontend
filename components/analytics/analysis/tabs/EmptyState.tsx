"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

export function EmptyState({
  icon,
  title,
  desc,
  onClick,
}: {
  icon?: React.ReactNode;
  title: string;
  desc?: string;
  onClick?: () => void;
}) {
  return (
    <div className="rounded-lg border p-6 text-center">
      <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full border">
        {icon}
      </div>
      <div className="font-medium">{title}</div>
      {desc ? (
        <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      ) : null}
      {onClick ? (
        <Button variant="outline" size="sm" className="mt-3" onClick={onClick}>
          Refresh
        </Button>
      ) : null}
    </div>
  );
}
