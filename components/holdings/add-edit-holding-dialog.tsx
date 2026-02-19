"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addHolding, updateHolding, deleteHolding } from "@/utils/investmentsService";
import { searchSymbols, mapFinnhubType } from "@/lib/finnhub";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Trash2, Search, Check, X } from "lucide-react";
import SymbolLogo from "@/components/layout/SymbolLogo";
import { cn } from "@/lib/utils";
import type { Holding } from "@/types/holding";

type Mode = "add" | "edit";

interface SearchResult {
  symbol: string;
  description: string;
  asset_type: string;
  quote_symbol?: string;
}

interface AddEditHoldingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  holding?: Holding | null;
  onSuccess: () => void;
}

const CURRENCIES = [
  { value: "USD", label: "USD" },
  { value: "CAD", label: "CAD" },
];

export function AddEditHoldingDialog({
  open,
  onOpenChange,
  holding,
  onSuccess,
}: AddEditHoldingDialogProps) {
  const mode: Mode = holding ? "edit" : "add";

  // Selected symbol state
  const [selectedSymbol, setSelectedSymbol] = useState<SearchResult | null>(null);
  const [quantity, setQuantity] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Populate form when editing
  useEffect(() => {
    if (open && holding) {
      setSelectedSymbol({
        symbol: holding.symbol,
        description: holding.name || holding.symbol,
        asset_type: holding.type === "cryptocurrency" ? "crypto" : "stock",
      });
      setQuantity(String(holding.quantity ?? ""));
      setPurchasePrice(
        String(holding.purchaseUnitPrice ?? holding.purchasePrice ?? "")
      );
      setCurrency(holding.currency || "USD");
    } else if (open && !holding) {
      setSelectedSymbol(null);
      setSearchQuery("");
      setSearchResults([]);
      setQuantity("");
      setPurchasePrice("");
      setCurrency("USD");
    }
    setShowDeleteConfirm(false);
    setSearchOpen(false);
  }, [open, holding]);

  // Debounced search
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q || q.length < 1) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      setSearchOpen(true);
      try {
        const results = await searchSymbols(q);
        setSearchResults(Array.isArray(results) ? results : []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectSymbol = (result: SearchResult) => {
    setSelectedSymbol(result);
    setSearchQuery("");
    setSearchResults([]);
    setSearchOpen(false);
  };

  const handleClearSymbol = () => {
    setSelectedSymbol(null);
    setSearchQuery("");
    // Focus search input after clearing
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  // Derive asset type from selection
  const resolvedAssetType = selectedSymbol
    ? selectedSymbol.asset_type === "crypto"
      ? "cryptocurrency"
      : mapFinnhubType(selectedSymbol.asset_type || "stock")
    : "equity";

  const isValid =
    selectedSymbol !== null &&
    Number(quantity) > 0 &&
    Number(purchasePrice) > 0;

  const handleSave = useCallback(async () => {
    if (!isValid || !selectedSymbol) return;
    setSaving(true);

    const sym = selectedSymbol.symbol.toUpperCase();
    // Extract just the name part (remove " (SYM) • Type" suffix from description)
    const rawDesc = selectedSymbol.description || sym;
    const nameClean = rawDesc.replace(/\s*\(.*?\)\s*•.*$/, "").trim() || sym;

    try {
      if (mode === "add") {
        await addHolding({
          symbol: sym,
          name: nameClean,
          quantity: Number(quantity),
          purchase_price: Number(purchasePrice),
          type: resolvedAssetType,
          currency,
        });
        toast({
          title: "Holding added",
          description: `${sym} added to your portfolio.`,
        });
      } else if (holding) {
        await updateHolding(String(holding.id), {
          symbol: sym,
          name: nameClean,
          quantity: Number(quantity),
          purchase_price: Number(purchasePrice),
          type: resolvedAssetType,
          currency,
        });
        toast({
          title: "Holding updated",
          description: `${sym} has been updated.`,
        });
      }
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast({
        title: mode === "add" ? "Failed to add" : "Failed to update",
        description:
          err instanceof Error ? err.message : "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [
    isValid,
    mode,
    selectedSymbol,
    quantity,
    purchasePrice,
    resolvedAssetType,
    currency,
    holding,
    onOpenChange,
    onSuccess,
  ]);

  const handleDelete = useCallback(async () => {
    if (!holding) return;
    setDeleting(true);

    try {
      await deleteHolding(String(holding.id));
      toast({
        title: "Holding deleted",
        description: `${holding.symbol} has been removed.`,
      });
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast({
        title: "Failed to delete",
        description:
          err instanceof Error ? err.message : "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }, [holding, onOpenChange, onSuccess]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-2xl p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-lg font-bold text-neutral-900">
            {mode === "add" ? "Add Holding" : `Edit ${holding?.symbol}`}
          </DialogTitle>
          <DialogDescription className="text-sm text-neutral-500">
            {mode === "add"
              ? "Search for a stock, ETF, or crypto to add to your portfolio."
              : "Update the details of your manually added holding."}
          </DialogDescription>
        </DialogHeader>

        {/* Form */}
        <div className="px-6 py-4 space-y-4">
          {/* Symbol Search / Selected Display */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Asset *
            </Label>

            {selectedSymbol ? (
              /* Selected symbol chip */
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50">
                <SymbolLogo
                  symbol={selectedSymbol.symbol}
                  isCrypto={selectedSymbol.asset_type === "crypto"}
                  className="h-8 w-8 rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-900 text-sm">
                      {selectedSymbol.symbol}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md",
                        selectedSymbol.asset_type === "crypto"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      )}
                    >
                      {selectedSymbol.asset_type === "crypto" ? "Crypto" : "Stock"}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 truncate">
                    {selectedSymbol.description}
                  </p>
                </div>
                {mode === "add" && (
                  <button
                    onClick={handleClearSymbol}
                    className="p-1 rounded-md hover:bg-neutral-200 text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ) : (
              /* Search input with dropdown */
              <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                <PopoverAnchor asChild>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                      ref={searchInputRef}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by ticker or name..."
                      autoFocus
                      className="h-10 w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-10 text-base md:text-sm transition-all focus:border-neutral-400 focus:ring-2 focus:ring-neutral-900/5 outline-none"
                    />
                    {searchLoading && (
                      <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-neutral-400" />
                    )}
                  </div>
                </PopoverAnchor>
                <PopoverContent
                  sideOffset={4}
                  className="w-[var(--radix-popover-trigger-width)] p-0 shadow-xl rounded-xl overflow-hidden border-neutral-200 z-[60]"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <Command shouldFilter={false}>
                    <CommandList className="max-h-[240px]">
                      {searchResults.length === 0 && !searchLoading && searchQuery.trim().length > 0 && (
                        <CommandEmpty className="py-6 text-center text-sm text-neutral-500">
                          No results for &ldquo;{searchQuery}&rdquo;
                        </CommandEmpty>
                      )}
                      {searchLoading && searchResults.length === 0 && (
                        <div className="py-6 flex items-center justify-center gap-2 text-sm text-neutral-400">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Searching...
                        </div>
                      )}
                      <CommandGroup>
                        {searchResults.map((r) => (
                          <CommandItem
                            key={r.symbol}
                            onSelect={() => handleSelectSymbol(r)}
                            className="flex items-center gap-3 px-3 py-2.5 cursor-pointer"
                          >
                            <SymbolLogo
                              symbol={r.symbol}
                              isCrypto={r.asset_type === "crypto"}
                              className="h-8 w-8 rounded-lg"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-neutral-900 text-sm">
                                  {r.symbol}
                                </span>
                                <span
                                  className={cn(
                                    "text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md",
                                    r.asset_type === "crypto"
                                      ? "bg-purple-50 text-purple-600"
                                      : "bg-blue-50 text-blue-600"
                                  )}
                                >
                                  {r.asset_type === "crypto" ? "Crypto" : "Stock"}
                                </span>
                              </div>
                              <p className="text-xs text-neutral-500 truncate">
                                {r.description}
                              </p>
                            </div>
                            <Check className="h-4 w-4 text-neutral-300" />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          </div>

          {/* Row: Quantity + Purchase Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="quantity"
                className="text-xs font-semibold text-neutral-500 uppercase tracking-wider"
              >
                Quantity *
              </Label>
              <Input
                id="quantity"
                type="number"
                step="any"
                min="0"
                placeholder="0.00"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="rounded-xl border-neutral-200 tabular-nums"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="price"
                className="text-xs font-semibold text-neutral-500 uppercase tracking-wider"
              >
                Avg. Purchase Price *
              </Label>
              <Input
                id="price"
                type="number"
                step="any"
                min="0"
                placeholder="0.00"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                className="rounded-xl border-neutral-200 tabular-nums"
              />
            </div>
          </div>

          {/* Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Currency
              </Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="rounded-xl border-neutral-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Asset type (auto-detected, read-only display) */}
            {selectedSymbol && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Asset Type
                </Label>
                <div className="h-10 px-3 rounded-xl border border-neutral-200 bg-neutral-50 flex items-center text-sm text-neutral-600">
                  {resolvedAssetType === "cryptocurrency"
                    ? "Crypto"
                    : resolvedAssetType === "etf"
                    ? "ETF"
                    : "Stock"}
                </div>
              </div>
            )}
          </div>

          {/* Cost preview */}
          {Number(quantity) > 0 && Number(purchasePrice) > 0 && (
            <div className="bg-neutral-50 rounded-xl border border-neutral-100 p-3 flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-500">
                Total Cost Basis
              </span>
              <span className="text-sm font-bold text-neutral-900 tabular-nums">
                {currency === "CAD" ? "C$" : "$"}
                {(Number(quantity) * Number(purchasePrice)).toLocaleString(
                  undefined,
                  { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                )}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t border-neutral-100 bg-neutral-50/50 flex-row gap-2">
          {mode === "edit" && (
            <>
              {showDeleteConfirm ? (
                <div className="flex items-center gap-2 mr-auto">
                  <span className="text-xs text-rose-600 font-medium">
                    Confirm delete?
                  </span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="rounded-lg h-8 px-3 text-xs"
                  >
                    {deleting ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      "Yes, delete"
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="rounded-lg h-8 px-3 text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="mr-auto text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg h-9 px-3 gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              )}
            </>
          )}
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isValid || saving}
            className="rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white min-w-[100px]"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : mode === "add" ? (
              "Add Holding"
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
