"use client";

import { useEffect } from "react";
import { useFeedStatusStore } from "@/store/feed-status-store";
import { useMarketStore } from "@/store/market-store";
import { cn } from "@/lib/utils";

/**
 * Shows when the selected symbol (or candle history) is blocked by gateway
 * entitlements — so the only remaining ops step is clear to the trader.
 */
export function FeedStatusBanner() {
  const start = useFeedStatusStore((s) => s.start);
  const stop = useFeedStatusStore((s) => s.stop);
  const feed = useFeedStatusStore((s) => s.state);
  const bySymbol = useFeedStatusStore((s) => s.bySymbol);
  const symbol = useMarketStore((s) => s.selectedSymbol);
  const row = bySymbol[symbol];

  useEffect(() => {
    start();
    return () => stop();
  }, [start, stop]);

  if (!feed) return null;

  const blocked = feed.markets.filter((m) => m.state === "blocked" || !m.entitled);
  const noCandle = feed.candleEntitled === false;
  const selectedBlocked = row && (row.state === "blocked" || !row.entitled);
  const selectedMissing = row?.state === "missing";

  if (!selectedBlocked && !selectedMissing && !noCandle && blocked.length === 0) {
    return null;
  }

  let title = "Market data notice";
  let body = "";
  let tone = "border-warning/50 bg-warning/10 text-warning";

  if (selectedBlocked && row?.reason) {
    title = `${symbol} needs a gateway entitlement`;
    body = row.reason;
    tone = "border-short/50 bg-short/10 text-short";
  } else if (selectedMissing) {
    title = `No live quote for ${symbol}`;
    body =
      row?.reason ??
      "Waiting for the feed. If this persists, confirm exchange entitlements on the dxFeed account.";
  } else if (blocked.length) {
    title = "Some symbols are blocked on this gateway";
    body = blocked.map((b) => `${b.symbol}${b.exchange ? ` (${b.exchange})` : ""}`).join(", ");
  } else if (noCandle) {
    title = "Chart history is live-bars only";
    body =
      "This gateway has no Candle entitlement. Charts build from live prints after the backend starts. Enable Candle history on the dxFeed account for full depth.";
  }

  if (!body) return null;

  return (
    <div className={cn("flex items-start gap-3 rounded-lg border px-4 py-3", tone)}>
      <span className="mt-0.5 text-base leading-none">📡</span>
      <div className="min-w-0">
        <div className="text-sm font-semibold">{title}</div>
        <p className="mt-0.5 text-xs text-foreground/80">{body}</p>
        {feed.exchanges.length > 0 && (
          <p className="mt-1 text-[10px] text-muted">
            Entitled exchanges: {feed.exchanges.join(", ")}
            {feed.candleEntitled === false ? " · Candle: no" : feed.candleEntitled === true ? " · Candle: yes" : ""}
          </p>
        )}
      </div>
    </div>
  );
}
