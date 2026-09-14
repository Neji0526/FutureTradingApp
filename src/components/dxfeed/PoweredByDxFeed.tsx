"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/store/theme-store";
import { useDxFeedActive } from "./useDxFeedActive";

export type DxFeedBadgeVariant = "badge" | "overlay" | "inline";
export type DxFeedBadgeSize = "sm" | "md" | "lg";

/**
 * Market-data attribution — one clean lockup per surface.
 * badge: headers / dashboard · overlay: charts · inline: dense panels
 */
export function PoweredByDxFeed({
  className,
  compact = false,
  size,
  variant = "badge",
}: {
  className?: string;
  /** @deprecated Prefer `size="sm"`. */
  compact?: boolean;
  size?: DxFeedBadgeSize;
  variant?: DxFeedBadgeVariant;
}) {
  const active = useDxFeedActive();
  const theme = useThemeStore((s) => s.theme);
  if (!active) return null;

  const resolved: DxFeedBadgeSize =
    size ?? (compact ? "sm" : variant === "badge" ? "md" : "md");
  const dark = theme === "dark";

  if (variant === "overlay") {
    return <OverlayLockup size={resolved} className={className} />;
  }
  if (variant === "inline") {
    return <InlineLockup size={resolved} dark={dark} className={className} />;
  }
  return <HeaderLockup size={resolved} dark={dark} className={className} />;
}

/** Dashboard / card headers — mark + Powered by + Connected status. */
function HeaderLockup({
  size,
  dark,
  className,
}: {
  size: DxFeedBadgeSize;
  dark: boolean;
  className?: string;
}) {
  const mark = size === "lg" ? 36 : size === "md" ? 30 : 24;
  const pad = size === "lg" ? "px-3.5 py-2" : size === "md" ? "px-3 py-1.5" : "px-2.5 py-1";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2.5 rounded-full border transition-colors",
        pad,
        dark
          ? "border-white/10 bg-white/[0.04] hover:bg-white/[0.07]"
          : "border-black/8 bg-black/[0.03] hover:bg-black/[0.05]",
        className,
      )}
      title="dxFeed market data connected"
      aria-label="Connected dxFeed — Powered by dxFeed"
    >
      <Image
        src="/vendors/dxfeed/logo-sym.png"
        alt=""
        width={mark}
        height={mark}
        className="shrink-0 object-contain"
        unoptimized
      />
      <div className="min-w-0 pr-0.5 leading-none">
        <p
          className={cn(
            "text-[9px] font-semibold uppercase tracking-[0.14em]",
            dark ? "text-white/45" : "text-black/40",
          )}
        >
          Powered by
        </p>
        <p
          className={cn(
            "mt-1 text-[13px] font-semibold tracking-tight",
            size === "lg" && "text-[14px]",
            dark ? "text-white" : "text-foreground",
          )}
        >
          dxFeed
        </p>
        <p className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-long">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-long" aria-hidden />
          Connected
        </p>
      </div>
    </div>
  );
}

/** Chart overlay — white wordmark on soft glass, caption above. */
function OverlayLockup({
  size,
  className,
}: {
  size: DxFeedBadgeSize;
  className?: string;
}) {
  const w = size === "lg" ? 112 : size === "md" ? 96 : 80;

  return (
    <div
      className={cn(
        "inline-flex flex-col gap-1 rounded-lg border border-white/10 bg-black/50 px-2.5 py-1.5 backdrop-blur-md",
        className,
      )}
      title="Market data provided by dxFeed"
      aria-label="Powered by dxFeed"
    >
      <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-long/90">
        Connected · Powered by
      </p>
      <Image
        src="/vendors/dxfeed/logo-white-h.png"
        alt="dxFeed"
        width={w}
        height={24}
        className="h-5 w-auto object-contain object-left sm:h-6"
        style={{ width: w }}
        unoptimized
      />
    </div>
  );
}

/** Order ticket / dense rows — mark + one-line caption. */
function InlineLockup({
  size,
  dark,
  className,
}: {
  size: DxFeedBadgeSize;
  dark: boolean;
  className?: string;
}) {
  const mark = size === "lg" ? 28 : size === "md" ? 22 : 18;

  return (
    <div
      className={cn("inline-flex items-center gap-2", className)}
      title="Market data provided by dxFeed"
      aria-label="Powered by dxFeed"
    >
      <Image
        src="/vendors/dxfeed/logo-sym.png"
        alt=""
        width={mark}
        height={mark}
        className="shrink-0 object-contain opacity-90"
        unoptimized
      />
      <p className={cn("text-[11px] leading-snug", dark ? "text-white/55" : "text-muted")}>
        <span className="font-semibold text-long">Connected</span>
        {" · Powered by "}
        <span className={cn("font-semibold", dark ? "text-white/90" : "text-foreground")}>
          dxFeed
        </span>
      </p>
    </div>
  );
}
