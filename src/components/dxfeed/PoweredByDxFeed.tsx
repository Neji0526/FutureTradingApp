"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useDxFeedActive } from "./useDxFeedActive";

type Size = "sm" | "md" | "lg";

const SIZE: Record<
  Size,
  { mark: number; text: string; gap: string }
> = {
  sm: { mark: 18, text: "text-[10px]", gap: "gap-1.5" },
  md: { mark: 28, text: "text-[12px]", gap: "gap-2" },
  lg: { mark: 40, text: "text-[13px]", gap: "gap-2.5" },
};

/**
 * Required attribution whenever a window shows dxFeed market data.
 * Hidden when the feed provider is not dxFeed.
 */
export function PoweredByDxFeed({
  className,
  compact = false,
  size,
}: {
  className?: string;
  /** @deprecated Prefer `size="sm"`. */
  compact?: boolean;
  size?: Size;
}) {
  const active = useDxFeedActive();
  if (!active) return null;

  const s = SIZE[size ?? (compact ? "sm" : "md")];

  return (
    <div
      className={cn(
        "pointer-events-none flex items-center select-none opacity-90",
        s.gap,
        className,
      )}
      title="Market data provided by dxFeed"
      aria-label="Powered by dxFeed"
    >
      <Image
        src="/vendors/dxfeed/logo-sym.png"
        alt=""
        width={s.mark}
        height={s.mark}
        className="shrink-0 object-contain"
        unoptimized
      />
      <span className={cn("font-medium tracking-wide text-muted", s.text)}>
        Powered by <span className="text-foreground/85">dxFeed</span>
      </span>
    </div>
  );
}
