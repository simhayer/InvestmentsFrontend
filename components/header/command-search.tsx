"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, X, ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import {
  Command,
  CommandList,
  CommandItem,
  CommandEmpty,
  CommandGroup,
} from "@/components/ui/command";
import { searchSymbols } from "@/lib/finnhub";
import SymbolLogo from "@/components/layout/SymbolLogo";

export function CommandSearch() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Keyboard shortcut CMD+K
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Search Logic
  React.useEffect(() => {
    const q = query.trim();
    if (!q) {
      setOpen(false);
      return;
    }
    const t = setTimeout(async () => {
      setLoading(true);
      setOpen(true);
      const r = await searchSymbols(q);
      setResults(Array.isArray(r) ? r : []);
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div className="group relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 transition-colors group-focus-within:text-neutral-900" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search symbols..."
            className="h-10 w-full rounded-full border border-neutral-200 bg-neutral-50/50 pl-10 pr-12 text-sm transition-all focus:border-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-900/5"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {loading ? (
              <Loader2 className="h-3 w-3 animate-spin text-neutral-400" />
            ) : (
              <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-neutral-200 bg-white px-1.5 font-sans text-[10px] font-medium text-neutral-400">
                <span className="text-xs">⌘</span>K
              </kbd>
            )}
          </div>
        </div>
      </PopoverAnchor>
      <PopoverContent
        sideOffset={8}
        className="w-[var(--radix-popover-trigger-width)] p-0 shadow-2xl rounded-2xl overflow-hidden border-neutral-200 z-50"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command shouldFilter={false}>
          <CommandList className="max-h-[300px]">
            {results.length === 0 && !loading && (
              <CommandEmpty className="py-6 text-center text-sm text-neutral-500">
                No assets found.
              </CommandEmpty>
            )}
            <CommandGroup>
              {results.map((r) => (
                <CommandItem
                  key={r.symbol}
                  onSelect={() => {
                    const params = new URLSearchParams();
                    if (r.asset_type) params.set("type", r.asset_type);
                    if (r.quote_symbol) params.set("q", r.quote_symbol);
                    const qs = params.toString();
                    router.push(
                      qs
                        ? `/dashboard/symbol/${r.symbol}?${qs}`
                        : `/dashboard/symbol/${r.symbol}`
                    );

                    setOpen(false);
                    setQuery("");
                  }}
                  className="flex items-center justify-between px-4 py-3 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {/* The reusable logo component */}
                    <SymbolLogo
                      symbol={r.symbol}
                      className="h-8 w-8 rounded-md" // Slightly smaller and tighter corners for lists
                      isCrypto={r.asset_type === "crypto"}
                    />

                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-neutral-900 leading-none mb-1">
                        {r.symbol}
                      </span>
                      <span className="text-xs text-neutral-500 line-clamp-1">
                        {r.description}
                      </span>
                    </div>
                  </div>
                  <div className="h-6 w-6 rounded-md bg-neutral-100 flex items-center justify-center">
                    <ChevronDown className="h-3 w-3 -rotate-90 text-neutral-400" />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
