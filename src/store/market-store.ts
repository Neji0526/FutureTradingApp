"use client";

import { create } from "zustand";
import type { Candle, ConnectionStatus, OrderBook, Quote } from "@/lib/types";
import { DEFAULT_SYMBOL, INSTRUMENTS, WS_URL } from "@/lib/constants";
import { computeContractCode } from "@/lib/contract-code";
import { getWsClient } from "@/lib/ws-client";
import { getAuthToken } from "@/store/auth-store";
import { isByoMode } from "@/store/market-data-store";

/** REST base of the TradingBackend (Model B per-user quote polling). */
const API_BASE = WS_URL ? WS_URL.replace(/^ws/, "http").replace(/\/ws.*$/, "") : "";

/* Model B: poll the user's own quote endpoint for the selected symbol and push
   it into the store as a Quote, so the chart's forming-candle logic is unchanged
   (no shared WS market feed — that would be the wrong, simulated price in byo). */
let byoTimer: ReturnType<typeof setInterval> | null = null;
let byoSymbol = "";

/** Shared/dxFeed: REST backup so headers/charts stay live even if WS drops a symbol. */
let liveMarkTimer: ReturnType<typeof setInterval> | null = null;

async function pollByoQuote(symbol: string, apply: (q: Quote) => void) {
  const token = getAuthToken();
  if (!token || !API_BASE) return;
  try {
    const res = await fetch(`${API_BASE}/api/market-data/quote?symbol=${encodeURIComponent(symbol)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // 204 = the user's Live session is still warming up (no trade yet) → keep last quote.
    if (res.status === 204 || !res.ok) return;
    const q = (await res.json()) as Quote; // full real-time quote (incl. 24h stats)
    if (q && typeof q.price === "number") apply(q);
  } catch {
    /* keep last quote */
  }
}

/** Build a Quote from the latest live candle bar (dxFeed has no separate quote REST). */
function quoteFromCandles(symbol: string, candles: Candle[]): Quote | null {
  if (!candles.length) return null;
  const last = candles[candles.length - 1]!;
  if (!(last.close > 0)) return null;
  let high = last.high;
  let low = last.low;
  let volume = 0;
  for (const c of candles) {
    if (c.high > high) high = c.high;
    if (c.low > 0 && c.low < low) low = c.low;
    volume += c.volume ?? 0;
  }
  const tick = 0.25; // display only; OrderBook uses instrument tick separately
  return {
    symbol,
    price: last.close,
    bid: last.close - tick,
    ask: last.close + tick,
    change24h: 0,
    high24h: high,
    low24h: low,
    volume24h: Math.round(volume),
    lastSize: last.volume,
    ts: Date.now(),
  };
}

interface MarketState {
  quotes: Record<string, Quote>;
  prevPrice: Record<string, number>; // for up/down flash
  orderbook: OrderBook | null;
  selectedSymbol: string;
  contractCodes: Record<string, string>; // root → dated code (e.g. ES → ESM6)
  status: ConnectionStatus;
  initialized: boolean;

  init: () => void;
  selectSymbol: (symbol: string) => void;
  loadInstruments: () => Promise<void>;
  /** Model B: poll the per-user REST quote endpoint for `symbol`. */
  watchByo: (symbol: string) => void;
  /** Merge a quote into the store (WS, REST backup, or chart history hydrate). */
  applyQuote: (q: Quote) => void;
  /** Keep header/DOM prices aligned with the candle series the chart just painted. */
  hydrateQuoteFromCandles: (symbol: string, candles: Candle[]) => void;
}

export const useMarketStore = create<MarketState>((set, get) => ({
  quotes: {},
  prevPrice: {},
  orderbook: null,
  selectedSymbol: DEFAULT_SYMBOL,
  contractCodes: {},
  status: "idle",
  initialized: false,

  applyQuote: (q) => {
    if (!q?.symbol || !(q.price > 0)) return;
    set((s) => {
      const prev = s.quotes[q.symbol];
      // Ignore older WS frames so a stale reconnect snapshot can't freeze NQ at an
      // old print while live bars have already moved on.
      if (prev && prev.ts > q.ts && Date.now() - prev.ts < 15_000) return s;
      return {
        prevPrice: { ...s.prevPrice, [q.symbol]: prev?.price ?? q.price },
        quotes: { ...s.quotes, [q.symbol]: q },
      };
    });
  },

  hydrateQuoteFromCandles: (symbol, candles) => {
    const q = quoteFromCandles(symbol, candles);
    if (!q) return;
    const prev = get().quotes[symbol];
    // Always refresh volume/high/low from bars; bump price when bars are newer or
    // the header is clearly stale vs the live series (the 29508-vs-29200 bug).
    const stale =
      !prev ||
      Math.abs(prev.price - q.price) / Math.max(q.price, 1) > 0.001 ||
      (prev.volume24h ?? 0) === 0 ||
      Date.now() - prev.ts > 3_000;
    if (!stale && prev) {
      // Still refresh volume stats from the deepening live-bar buffer.
      get().applyQuote({
        ...prev,
        high24h: Math.max(prev.high24h, q.high24h),
        low24h: prev.low24h > 0 ? Math.min(prev.low24h, q.low24h) : q.low24h,
        volume24h: Math.max(prev.volume24h, q.volume24h),
        ts: Date.now(),
      });
      return;
    }
    get().applyQuote({
      ...q,
      // Preserve a fresher WS bid/ask spread when the mid matches.
      bid: prev && Math.abs(prev.price - q.price) < q.price * 0.0002 ? prev.bid : q.bid,
      ask: prev && Math.abs(prev.price - q.price) < q.price * 0.0002 ? prev.ask : q.ask,
      change24h: prev?.change24h ?? 0,
    });
  },

  init: () => {
    if (get().initialized) return;
    set({ initialized: true });

    const ws = getWsClient();
    ws.onStatus((status) => set({ status }));
    ws.onMessage((msg) => {
      if (msg.type === "quote") {
        get().applyQuote(msg.data);
      } else if (msg.type === "orderbook") {
        if (msg.data.symbol === get().selectedSymbol) set({ orderbook: msg.data });
      }
    });

    ws.connect();

    if (isByoMode()) {
      get().watchByo(get().selectedSymbol);
    } else {
      for (const inst of INSTRUMENTS) {
        ws.subscribe("quotes", inst.symbol);
      }
      // REST live-mark backup: every second, pull recent history for the selected
      // symbol (and warm a few others) so NQ/YM/GC can't freeze like ES never does.
      const pollLiveMarks = async () => {
        if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
        const selected = get().selectedSymbol;
        const warm = new Set([selected, "ES", "NQ", "YM", "GC", "CL"]);
        await Promise.all(
          [...warm].map(async (sym) => {
            try {
              const bars = await getWsClient().getHistory(sym, 60, 120);
              if (bars.length) get().hydrateQuoteFromCandles(sym, bars);
            } catch {
              /* ignore */
            }
          }),
        );
      };
      void pollLiveMarks();
      if (liveMarkTimer) clearInterval(liveMarkTimer);
      liveMarkTimer = setInterval(() => void pollLiveMarks(), 2_000);
    }

    void get().loadInstruments();
  },

  selectSymbol: (symbol) => {
    const prev = get().selectedSymbol;
    if (prev === symbol) return;

    if (isByoMode()) {
      get().watchByo(symbol);
    } else {
      const ws = getWsClient();
      for (const inst of INSTRUMENTS) ws.subscribe("quotes", inst.symbol);
      // Drop the stale selected quote so the header can't keep showing an hours-old
      // NQ print while fresh bars load (was stuck at 29508 while server was ~29200).
      set((s) => {
        const quotes = { ...s.quotes };
        delete quotes[symbol];
        return { selectedSymbol: symbol, orderbook: null, quotes };
      });
      void getWsClient()
        .getHistory(symbol, 60, 120)
        .then((bars) => {
          if (bars.length && get().selectedSymbol === symbol) {
            get().hydrateQuoteFromCandles(symbol, bars);
          }
        })
        .catch(() => {});
      return;
    }

    set({ selectedSymbol: symbol, orderbook: null });
  },

  /** Start/replace the Model B quote poll for `symbol` (per-user REST feed). */
  watchByo: (symbol) => {
    if (byoTimer && byoSymbol === symbol) return;
    if (byoTimer) clearInterval(byoTimer);
    byoSymbol = symbol;
    const apply = (q: Quote) => get().applyQuote(q);
    void pollByoQuote(symbol, apply); // immediate
    byoTimer = setInterval(() => void pollByoQuote(byoSymbol, apply), 1500);
  },

  loadInstruments: async () => {
    // Seed with locally-computed codes so the UI is populated immediately.
    const now = new Date();
    const codes: Record<string, string> = {};
    for (const inst of INSTRUMENTS) codes[inst.symbol] = computeContractCode(inst.symbol, inst.category, now);
    set({ contractCodes: codes });

    // Override with backend-resolved (Databento-accurate) codes when available.
    const fetched = await getWsClient().getInstruments();
    if (fetched) {
      const merged = { ...get().contractCodes };
      for (const i of fetched) merged[i.symbol] = i.contractCode;
      set({ contractCodes: merged });
    }
  },
}));
