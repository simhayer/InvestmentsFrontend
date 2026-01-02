"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface SymbolLogoProps {
  symbol: string;
  isCrypto?: boolean;
  className?: string;
}

export default function SymbolLogo({
  symbol,
  isCrypto,
  className,
}: SymbolLogoProps) {
  const [error, setError] = useState(false);
  //   const TOKEN = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN!;
  const TOKEN = "pk_DWddSk6fRYe-yJ7z1BG3OA";

  useEffect(() => {
    setError(false);
  }, [symbol, isCrypto]);

  const normalizeSymbol = (s: string) =>
    s.toUpperCase().replace(/USDT|USDC|BUSD|USD$/i, "");

  const getUrl = () => {
    const s = normalizeSymbol(symbol);
    if (isCrypto) {
      console.log("crypto logo url");
      console.log(
        `https://img.logo.dev/crypto/${s}?token=${TOKEN}&retina=true`
      );
      return `https://img.logo.dev/crypto/${s}?token=${TOKEN}&retina=true`;
    }
    return `https://img.logo.dev/ticker/${s}?token=${TOKEN}&retina=true`;
  };

  return (
    <div
      className={cn(
        "h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-neutral-100 bg-white flex items-center justify-center",
        className
      )}
    >
      {!error ? (
        <img
          src={getUrl()}
          alt={`${symbol} logo`}
          className="w-full h-full object-contain p-1.5"
          onError={() => setError(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-white text-[11px] font-bold uppercase">
          {symbol.slice(0, 2)}
        </div>
      )}
    </div>
  );
}
