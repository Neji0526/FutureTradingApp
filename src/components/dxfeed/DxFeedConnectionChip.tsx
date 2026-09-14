"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useDxFeedActive } from "./useDxFeedActive";
import { useFeedStatusStore } from "@/store/feed-status-store";

const EMPTY_EXCHANGES: string[] = [];

/**
 * Compact nav chip — visible when dxFeed is the live market-data provider.
 * Shows “Connected dxFeed” plus entitled exchanges when available.
 */
export function DxFeedConnectionChip({ className }: { className?: string }) {
  const active = useDxFeedActive();
  // Stable fallback — `?? []` inside a zustand selector causes React #185 (infinite loop).
  const exchanges = useFeedStatusStore((s) => s.state?.exchanges) ?? EMPTY_EXCHANGES;

  if (!active) return null;

  const entitled =
    exchanges.length > 0
      ? exchanges.slice(0, 3).join(", ") + (exchanges.length > 3 ? "…" : "")
      : null;

  return (
    <div
      className={cn(
        "inline-flex max-w-[220px] items-center gap-2 rounded-full border border-long/25 bg-long/10 px-2.5 py-1",
        className,
      )}
      title={entitled ? `dxFeed connected · ${entitled}` : "dxFeed market data connected"}
      aria-label="Connected dxFeed"
    >
      <span className="relative flex h-1.5 w-1.5 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-long/70" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-long" />
      </span>
      <Image
        src="/vendors/dxfeed/logo-sym.png"
        alt=""
        width={14}
        height={14}
        className="shrink-0 object-contain"
        unoptimized
      />
      <span className="min-w-0 truncate text-[11px] font-semibold tracking-tight text-long">
        Connected dxFeed
      </span>
    </div>
  );
}
