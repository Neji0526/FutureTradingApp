"use client";

import { create } from "zustand";
import { WS_URL, USE_MOCK_FEED } from "@/lib/constants";

const API_BASE = WS_URL ? WS_URL.replace(/^ws/, "http").replace(/\/ws.*$/, "") : "";

export type FeedMarketState =
  | "live"
  | "thin"
  | "flat"
  | "stale"
  | "missing"
  | "closed"
  | "blocked";

export interface FeedMarketRow {
  symbol: string;
  name: string;
  state: FeedMarketState;
  exchange: string | null;
  entitled: boolean;
  reason: string | null;
  ageSec: number | null;
  price: number | null;
  volume24h: number | null;
}

export interface FeedLiveState {
  provider: string;
  at: string;
  marketOpen: boolean;
  exchanges: string[];
  candleEntitled: boolean | null;
  markets: FeedMarketRow[];
}

interface FeedStatusStore {
  state: FeedLiveState | null;
  bySymbol: Record<string, FeedMarketRow>;
  poll: () => Promise<void>;
  start: () => void;
  stop: () => void;
}

let timer: ReturnType<typeof setInterval> | null = null;

export const useFeedStatusStore = create<FeedStatusStore>((set, get) => ({
  state: null,
  bySymbol: {},

  poll: async () => {
    if (USE_MOCK_FEED || !API_BASE) return;
    try {
      const res = await fetch(`${API_BASE}/api/market/live-state`, { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as FeedLiveState;
      const bySymbol: Record<string, FeedMarketRow> = {};
      for (const m of data.markets ?? []) bySymbol[m.symbol] = m;
      set({ state: data, bySymbol });
    } catch {
      /* keep last */
    }
  },

  start: () => {
    if (timer || USE_MOCK_FEED || !API_BASE) return;
    void get().poll();
    timer = setInterval(() => void get().poll(), 15_000);
  },

  stop: () => {
    if (timer) clearInterval(timer);
    timer = null;
  },
}));
