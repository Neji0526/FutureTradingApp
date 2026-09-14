"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/store/theme-store";
import { useDxFeedActive } from "./useDxFeedActive";

export type DxFeedBadgeVariant = "badge" | "overlay" | "inline";
export type DxFeedBadgeSize = "sm" | "md" | "lg";

/**
 * Market-data attribution — designed for clear “Powered by dxFeed” recognition.
 *
 * - badge: dashboard / headers (pill, high contrast)
 * - overlay: charts on dark panes
 * - inline: order ticket / dense UI
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

  const resolvedSize: DxFeedBadgeSize = size ?? (compact ? "sm" : variant === "badge" ? "lg" : "md");

  if (variant === "overlay") {
    return (
      <OverlayBadge size={resolvedSize} className={className} />
    );
  }

  if (variant === "inline") {
    return (
      <InlineBadge size={resolvedSize} dark={theme === "dark"} className={className} />
    );
  }

  return (
    <HeroBadge size={resolvedSize} dark={theme === "dark"} className={className} />
  );
}

function HeroBadge({
  size,
  dark,
  className,
}: {
  size: DxFeedBadgeSize;
  dark: boolean;
  className?: string;
}) {
  const dims =
    size === "lg"
      ? { mark: 44, logoH: 36, pad: "px-3.5 py-2.5", title: "text-[11px]", name: "text-[15px]" }
      : size === "md"
        ? { mark: 36, logoH: 30, pad: "px-3 py-2", title: "text-[10px]", name: "text-[13px]" }
        : { mark: 28, logoH: 24, pad: "px-2.5 py-1.5", title: "text-[9px]", name: "text-[12px]" };

  return (
    <div
      className={cn(
        "inline-flex max-w-full items-center gap-3 rounded-2xl border shadow-sm",
        dims.pad,
        dark
          ? "border-white/12 bg-gradient-to-br from-[#1a1f2e] to-[#0f131c] text-white"
          : "border-[var(--l-line,#e5e7eb)] bg-white text-[var(--l-ink,#111)]",
        className,
      )}
      title="Market data provided by dxFeed"
      aria-label="Powered by dxFeed"
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl",
          dark ? "bg-white/5 ring-1 ring-white/10" : "bg-[#fff4ef] ring-1 ring-[#f05a28]/25",
        )}
        style={{ width: dims.mark + 10, height: dims.mark + 10 }}
      >
        <Image
          src="/vendors/dxfeed/logo-sym.png"
          alt=""
          width={dims.mark}
          height={dims.mark}
          className="object-contain"
          unoptimized
        />
      </span>
      <div className="min-w-0 leading-tight">
        <p
          className={cn(
            "font-bold uppercase tracking-[0.16em]",
            dims.title,
            dark ? "text-[#ff8f6b]" : "text-[#e24a1c]",
          )}
        >
          Powered by
        </p>
        <p className={cn("mt-0.5 font-extrabold tracking-tight", dims.name)}>
          dxFeed
        </p>
        <p className={cn("mt-0.5 text-[10px]", dark ? "text-white/45" : "text-black/45")}>
          Live market data
        </p>
      </div>
      {/* Full wordmark for larger badges — readable brand lockup */}
      {size === "lg" ? (
        <Image
          src={dark ? "/vendors/dxfeed/logo-white-h.png" : "/vendors/dxfeed/logo-black-h.png"}
          alt="dxFeed"
          width={120}
          height={dims.logoH}
          className="ml-1 hidden h-8 w-auto object-contain sm:block"
          unoptimized
        />
      ) : null}
    </div>
  );
}

function OverlayBadge({
  size,
  className,
}: {
  size: DxFeedBadgeSize;
  className?: string;
}) {
  const logoW = size === "lg" ? 130 : size === "md" ? 110 : 90;
  const logoH = size === "lg" ? 32 : size === "md" ? 28 : 22;

  return (
    <div
      className={cn(
        "inline-flex flex-col gap-1 rounded-xl border border-white/15 bg-black/65 px-3 py-2 shadow-lg backdrop-blur-md",
        className,
      )}
      title="Market data provided by dxFeed"
      aria-label="Powered by dxFeed"
    >
      <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#ff8f6b]">
        Powered by
      </p>
      <Image
        src="/vendors/dxfeed/logo-white-h.png"
        alt="dxFeed"
        width={logoW}
        height={logoH}
        className="h-auto object-contain object-left"
        style={{ width: logoW, height: "auto" }}
        unoptimized
      />
    </div>
  );
}

function InlineBadge({
  size,
  dark,
  className,
}: {
  size: DxFeedBadgeSize;
  dark: boolean;
  className?: string;
}) {
  const mark = size === "lg" ? 32 : size === "md" ? 26 : 20;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-lg px-2 py-1.5",
        dark ? "bg-white/5" : "bg-black/[0.03]",
        className,
      )}
      title="Market data provided by dxFeed"
      aria-label="Powered by dxFeed"
    >
      <Image
        src="/vendors/dxfeed/logo-sym.png"
        alt=""
        width={mark}
        height={mark}
        className="shrink-0 object-contain"
        unoptimized
      />
      <span className="leading-tight">
        <span
          className={cn(
            "block text-[9px] font-bold uppercase tracking-[0.14em]",
            dark ? "text-[#ff8f6b]" : "text-[#e24a1c]",
          )}
        >
          Powered by
        </span>
        <span className={cn("block text-[12px] font-bold", dark ? "text-white/90" : "text-foreground")}>
          dxFeed
        </span>
      </span>
    </div>
  );
}
