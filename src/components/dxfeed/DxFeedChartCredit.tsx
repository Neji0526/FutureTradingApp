"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useDxFeedActive } from "./useDxFeedActive";

type Size = "md" | "lg";
type Tone = "dark" | "light";

const SIZE = {
  md: {
    pad: "gap-1.5 px-3 py-2",
    label: "text-[9px] tracking-[0.2em]",
    logoH: "h-[20px]",
    logoW: 120,
    logoHpx: 32,
  },
  lg: {
    pad: "gap-2 px-3.5 py-2.5",
    label: "text-[10px] tracking-[0.22em]",
    logoH: "h-[26px]",
    logoW: 156,
    logoHpx: 40,
  },
} as const;

function DxFeedCreditMark({
  className,
  size = "md",
  tone = "dark",
}: {
  className?: string;
  size?: Size;
  tone?: Tone;
}) {
  const s = SIZE[size];
  const dark = tone === "dark";

  return (
    <div
      className={cn(
        "select-none",
        "flex flex-col items-start rounded-lg",
        s.pad,
        dark
          ? "border border-white/[0.08] bg-[#0e1020]/90 shadow-sm backdrop-blur-[6px]"
          : "border border-[var(--l-line)] bg-[var(--l-paper-2)] shadow-sm",
        className,
      )}
      title="Market data provided by dxFeed"
      aria-label="Powered by dxFeed"
    >
      <span
        className={cn(
          "pl-0.5 font-medium uppercase",
          s.label,
          dark ? "text-white/45" : "text-[var(--l-body)]",
        )}
      >
        Powered by
      </span>
      <Image
        src={dark ? "/vendors/dxfeed/logo-black-h.png" : "/vendors/dxfeed/logo-white-h.png"}
        alt="dxFeed"
        width={s.logoW}
        height={s.logoHpx}
        className={cn(s.logoH, "w-auto object-contain object-left")}
        unoptimized
      />
    </div>
  );
}

/**
 * Chart / ticket watermark — only when dxFeed is the live provider.
 */
export function DxFeedChartCredit({
  className,
  size = "md",
  tone = "dark",
}: {
  className?: string;
  size?: Size;
  tone?: Tone;
}) {
  const active = useDxFeedActive();
  if (!active) return null;

  return (
    <DxFeedCreditMark
      className={cn("pointer-events-none", className)}
      size={size}
      tone={tone}
    />
  );
}

/** Onboarding / static attribution — always visible, no feed polling required. */
export function DxFeedOnboardingCredit({
  className,
  size = "lg",
}: {
  className?: string;
  size?: Size;
}) {
  return <DxFeedCreditMark className={className} size={size} tone="light" />;
}
