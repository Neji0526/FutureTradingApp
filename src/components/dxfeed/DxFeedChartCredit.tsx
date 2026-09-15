"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useDxFeedActive } from "./useDxFeedActive";

/**
 * Quiet chart watermark for bottom-left of price / equity panes.
 * Shown only when dxFeed is the active market-data provider.
 *
 * Uses logo-black-h (white wordmark on near-black) so it sits cleanly
 * on dark charts — not the light-plate assets that flash as a white box.
 */
export function DxFeedChartCredit({ className }: { className?: string }) {
  const active = useDxFeedActive();
  if (!active) return null;

  return (
    <div
      className={cn(
        "pointer-events-none select-none",
        "flex flex-col items-start gap-1 rounded-md",
        "border border-white/[0.06] bg-[#0e1020]/88 px-2.5 py-1.5 shadow-sm backdrop-blur-[6px]",
        className,
      )}
      title="Market data provided by dxFeed"
      aria-label="Powered by dxFeed"
    >
      <span className="pl-0.5 text-[8px] font-medium uppercase tracking-[0.2em] text-white/42">
        Powered by
      </span>
      <Image
        src="/vendors/dxfeed/logo-black-h.png"
        alt="dxFeed"
        width={96}
        height={28}
        className="h-[15px] w-auto object-contain object-left"
        unoptimized
      />
    </div>
  );
}
