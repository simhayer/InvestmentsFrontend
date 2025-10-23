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
  placeholder = "Search symbols, companies…",
  className = "",
}: {
  onSelect?: (r: Result) => void;
  placeholder?: string;
  className?: string;
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* Inline input as Anchor (no toggle flicker) */}
      <PopoverAnchor asChild>
        <div
          ref={anchorRef}
          className={[
            "w-full max-w-md relative flex items-center",
            "rounded-full border border-input bg-background",
            "pl-9 pr-10 py-2",
            "focus-within:ring-2 focus-within:ring-blue-500",
            className,
          ].join(" ")}
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
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
            className="w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            aria-autocomplete="list"
            aria-controls="search-results"
            autoComplete="off"
          />
          {loading ? (
            <Loader2 className="absolute right-3 h-4 w-4 animate-spin text-muted-foreground" />
          ) : query ? (
            <button
              type="button"
              onClick={clear}
              className="absolute right-2 inline-flex h-6 w-6 items-center justify-center rounded-full hover:bg-muted"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          ) : null}
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
