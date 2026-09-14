"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useDxFeedActive } from "./useDxFeedActive";

/**
 * Required attribution whenever a window shows dxFeed market data.
 * Hidden when the feed provider is not dxFeed.
 */
export function PoweredByDxFeed({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const active = useDxFeedActive();
  if (!active) return null;

  return (
    <div
      className={cn(
        "pointer-events-none flex items-center gap-1.5 select-none",
        compact ? "opacity-80" : "opacity-90",
        className,
      )}
      title="Market data provided by dxFeed"
      aria-label="Powered by dxFeed"
    >
      <Image
        src="/vendors/dxfeed/logo-sym.png"
        alt=""
        width={compact ? 14 : 16}
        height={compact ? 14 : 16}
        className="shrink-0"
        unoptimized
      />
      <span className={cn("font-medium tracking-wide text-muted", compact ? "text-[10px]" : "text-[11px]")}>
        Powered by <span className="text-foreground/80">dxFeed</span>
      </span>
    </div>
  );
}
