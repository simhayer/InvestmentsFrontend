"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, X } from "lucide-react";
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

type Result = {
  symbol: string;
  description: string;
  [key: string]: any;
};

export function CommandSearch({
  onSelect,
  placeholder = "Search name or symbol",
  className = "",
  autoFocus = false,
}: {
  onSelect?: (r: Result) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<Result[]>([]);
  const [loading, setLoading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState<number | undefined>(undefined);

  // --- Keep popover width same as input ---
  React.useLayoutEffect(() => {
    const update = () => setWidth(anchorRef.current?.offsetWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // --- Debounced remote search ---
  React.useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setLoading(false);
      setOpen(false);
      return;
    }

    const t = setTimeout(async () => {
      try {
        setLoading(true);
        setOpen(true); // show popover immediately while searching
        const r = await searchSymbols(q);
        setResults(Array.isArray(r) ? r : []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const handleSelect = (r: Result) => {
    onSelect
      ? onSelect(r)
      : router.push(`/investment/${encodeURIComponent(r.symbol)}`);
    setOpen(false);
    setQuery("");
    setResults([]);
    inputRef.current?.blur();
  };

  const clear = () => {
    setQuery("");
    setResults([]);
    setOpen(false);
    inputRef.current?.focus();
  };

  // Autofocus when requested (mobile sheet)
  React.useEffect(() => {
    if (autoFocus) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [autoFocus]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* Inline input as Anchor (no toggle flicker) */}
      <PopoverAnchor asChild>
        <div
          ref={anchorRef}
          className={[
            "w-full relative flex items-center",
            "rounded-full border border-neutral-200 bg-white shadow-sm",
            "pl-10 pr-14 py-2.5",
            "transition focus-within:border-neutral-300",
            "focus-within:shadow-[0_8px_24px_rgba(0,0,0,0.05)]",
            className,
          ].join(" ")}
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-neutral-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (query.trim().length > 0) setOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setOpen(false);
                (e.target as HTMLInputElement).blur();
              }
            }}
            placeholder={placeholder}
            className="w-full bg-transparent outline-none text-sm text-neutral-800 placeholder:text-neutral-500"
            aria-autocomplete="list"
            aria-controls="search-results"
            autoComplete="off"
          />
          <div className="absolute inset-y-0 right-3 flex items-center gap-2">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
            ) : query ? (
              <button
                type="button"
                onClick={clear}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-neutral-100"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5 text-neutral-500" />
              </button>
            ) : (
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 text-xs text-neutral-500">
                /
              </span>
            )}
          </div>
        </div>
      </PopoverAnchor>

      {/* Popover with results */}
      <PopoverContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={() => setOpen(false)}
        align="start"
        sideOffset={6}
        className="p-0 z-[60] max-w-md"
        style={{ width }}
      >
        {query.trim().length > 0 && (
          <Command shouldFilter={false}>
            <CommandList id="search-results" className="max-h-72">
              {loading && (
                <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}

              {!loading && results.length === 0 ? (
                <CommandEmpty>No results.</CommandEmpty>
              ) : null}

              {results.length > 0 && (
                <CommandGroup>
                  {results.map((r) => (
                    <CommandItem
                      key={`${r.symbol}-${r.description}`}
                      value={`${r.symbol} ${r.description}`}
                      onSelect={() => handleSelect(r)}
                      className="flex items-center justify-between"
                    >
                      <span className="truncate">{r.description}</span>
                      <span className="text-xs text-muted-foreground">
                        {r.symbol}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  );
}
