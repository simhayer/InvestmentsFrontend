"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Investment } from "@/types/investment";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  searchSymbols,
  fetchQuote,
  fetchProfile,
  mapFinnhubType,
} from "@/lib/finnhub";
import { useDebounce } from "@/hooks/use-debounce";

type InvestmentFormData = {
  symbol: string;
  name: string;
  type: Investment["type"];
  quantity: string;
  purchasePrice: string;
  currentPrice: number;
  purchaseDate: string;
  avg_price: number;
};

interface Props {
  onAdd: (investment: Omit<Investment, "id">) => void;
  onCancel: () => void;
}

export function AddInvestmentCard({ onAdd, onCancel }: Props) {
  const [formData, setFormData] = useState<InvestmentFormData>({
    symbol: "",
    name: "",
    type: "stock",
    quantity: "",
    purchasePrice: "",
    currentPrice: 0,
    purchaseDate: new Date().toISOString().split("T")[0],
    avg_price: 0,
  });

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasSelected, setHasSelected] = useState(false);

  useEffect(() => {
    if (!debouncedSearch || hasSelected) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const matches = await searchSymbols(debouncedSearch);
        setResults(matches.slice(0, 5));
        setShowDropdown(true);
      } catch (err) {
        console.error("Search error:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedSearch, hasSelected]);

  const handleSelectSymbol = async (symbol: string, name: string) => {
    setHasSelected(true);
    setSearch(symbol);
    setShowDropdown(false);

    try {
      const [quoteData, profileData] = await Promise.all([
        fetchQuote(symbol),
        fetchProfile(symbol),
      ]);

      const price = quoteData?.c || 0;
      const mappedType = mapFinnhubType(profileData?.type || "");

      setFormData((prev) => ({
        ...prev,
        symbol,
        name,
        currentPrice: price,
        type: mappedType,
      }));
    } catch (err) {
      console.error("Symbol selection failed", err);
    }
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.type) {
      alert("Please select an investment type");
      return;
    }

    const parsedPurchasePrice = parseFloat(formData.purchasePrice);

    const investment: Investment = {
      ...formData,
      id: Date.now().toString(),
      symbol: formData.symbol.toUpperCase(),
      quantity: parseFloat(formData.quantity),
      purchasePrice: parsedPurchasePrice,
      currentPrice: formData.currentPrice,
      avgPrice: parsedPurchasePrice,
      institution: "Manual Entry",
      currency: "USD",
      // avg_price: parsedPurchasePrice,
    };

    onAdd(investment);
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Investment</CardTitle>
        <CardDescription>
          Add a new stock, cryptocurrency, or other investment to your portfolio
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 relative">
          <div className="space-y-2 relative">
            <Label htmlFor="symbol">Symbol</Label>
            <Input
              id="symbol"
              placeholder="e.g., AAPL, BTC"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setHasSelected(false);
              }}
              autoComplete="off"
              required
            />
            {showDropdown && results.length > 0 && (
              <div className="absolute z-10 w-full bg-white border rounded shadow max-h-48 overflow-y-auto">
                {results.map((item) => (
                  <div
                    key={item.symbol}
                    onClick={() =>
                      handleSelectSymbol(item.symbol, item.description)
                    }
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <div className="font-medium">{item.symbol}</div>
                    <div className="text-sm text-gray-500">
                      {item.description}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={formData.name} readOnly disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Input
              id="type"
              value={formData.type.toUpperCase()}
              readOnly
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              step="0.00001"
              placeholder="0.00"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="purchasePrice">Purchase Price ($)</Label>
            <Input
              id="purchasePrice"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.purchasePrice}
              onChange={(e) =>
                setFormData({ ...formData, purchasePrice: e.target.value })
              }
              required
            />
            {formData.currentPrice > 0 && (
              <p className="text-sm text-gray-500">
                Live market price: ${formData.currentPrice.toFixed(2)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="purchaseDate">Purchase Date</Label>
            <Input
              id="purchaseDate"
              type="date"
              value={formData.purchaseDate}
              onChange={(e) =>
                setFormData({ ...formData, purchaseDate: e.target.value })
              }
              required
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" className="flex-1">
              Add Investment
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
