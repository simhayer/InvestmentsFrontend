"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ProviderAvatarProps = {
  name: string;
  className?: string;
};

export default function ProviderAvatar({
  name,
  className,
}: ProviderAvatarProps) {
  const [imgError, setImgError] = React.useState(false);

  React.useEffect(() => {
    setImgError(false);
  }, [name]);

  const initials = React.useMemo(() => {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((s) => s[0])
      .join("")
      .toUpperCase();
  }, [name]);

  const token = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN;
  const encoded = encodeURIComponent(name.trim());
  const logoUrl = token
    ? `https://img.logo.dev/name/${encoded}?token=${token}&retina=true`
    : "";

  return (
    <div className={cn("relative shrink-0", className)}>
      {!imgError && logoUrl ? (
        <img
          src={logoUrl}
          alt={name}
          className="h-full w-full rounded-2xl border border-neutral-100 bg-white object-contain p-2 shadow-sm"
          onError={() => setImgError(true)}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="h-full w-full rounded-2xl flex items-center justify-center font-bold text-sm bg-neutral-800 text-white shadow-sm">
          {initials}
        </div>
      )}

      {/* status dot */}
      <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
    </div>
  );
}
