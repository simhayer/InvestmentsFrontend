export type WatchlistItem = {
  id: number;
  symbol: string;
  note: string | null;
  created_at: string;
};

export type Watchlist = {
  id: number;
  name: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  items: WatchlistItem[];
};
