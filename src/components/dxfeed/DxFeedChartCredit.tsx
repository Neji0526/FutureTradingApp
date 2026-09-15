"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useDxFeedActive } from "./useDxFeedActive";

type Size = "md" | "lg";
type Tone = "dark" | "light";
type Variant = "chart" | "ticket";

const SIZE = {
  md: {
    icon: "h-[18px] w-[18px]",
    label: "text-[9px] tracking-[0.2em]",
    logoH: "h-[18px]",
    logoW: 108,
    logoHpx: 28,
  },
  lg: {
    icon: "h-[22px] w-[22px]",
    label: "text-[10px] tracking-[0.22em]",
    logoH: "h-[22px]",
    logoW: 132,
    logoHpx: 34,
  },
} as const;

/** Official mark — no white plate, reads cleanly on dark UI. */
function DxFeedMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("shrink-0", className)} aria-hidden>
      <path fill="#FF5722" d="M2 2h7.2L7.5 3.7 11.8 8 8 11.8 3.7 7.5 2 9.2V2z" />
      <path fill="#FF5722" d="M22 2v7.2L20.3 7.5 16 11.8 12.2 8 16.5 3.7 18.8 2H22z" />
      <path fill="#5B6577" d="M2 22V14.8L3.7 16.5 8 12.2 11.8 16 7.5 20.3 5.2 22H2z" />
      <path fill="#FF5722" d="M22 22h-7.2l1.7-1.7L12.2 16 16 12.2l4.3 4.3L22 14.8V22z" />
    </svg>
  );
}

function DxFeedCreditMark({
  className,
  size = "md",
  tone = "dark",
  variant = "chart",
}: {
  className?: string;
  size?: Size;
  tone?: Tone;
  variant?: Variant;
}) {
  const s = SIZE[size];
  const dark = tone === "dark";
  const ticket = variant === "ticket";

  const shell = cn(
    "group cursor-default select-none",
    "overflow-hidden transition-all duration-300 ease-out",
    ticket
      ? cn(
          "mx-auto flex w-fit flex-col items-center rounded-xl",
          "border border-border/80 bg-surface-2/60 px-2 py-2",
          "hover:border-border hover:bg-surface-2/90 hover:px-4 hover:py-3 hover:shadow-md",
        )
      : cn(
          "inline-flex items-center rounded-lg",
          dark
            ? "border border-white/[0.07] bg-[#0e1020]/82 backdrop-blur-[6px] hover:border-white/[0.12] hover:bg-[#0e1020]/95 hover:shadow-md"
            : "border border-[var(--l-line)] bg-[var(--l-paper-2)] hover:shadow-md",
          "px-2 py-2 hover:px-3.5 hover:py-2.5",
        ),
    className,
  );

  const labelCls = cn(
    "font-medium uppercase whitespace-nowrap",
    s.label,
    ticket ? "text-muted-2" : dark ? "text-white/45" : "text-[var(--l-body)]",
  );

  const wordmarkSrc = dark ? "/vendors/dxfeed/logo-black-h.png" : "/vendors/dxfeed/logo-white-h.png";

  if (ticket) {
    return (
      <div className={shell} title="Market data provided by dxFeed" aria-label="Powered by dxFeed">
        <div className="flex items-center justify-center">
          <DxFeedMark className={s.icon} />
        </div>
        <div
          className={cn(
            "grid transition-all duration-300 ease-out",
            "grid-rows-[0fr] opacity-0",
            "group-hover:mt-2.5 group-hover:grid-rows-[1fr] group-hover:opacity-100",
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="flex flex-col items-center gap-1.5">
              <span className={labelCls}>Powered by</span>
              <Image
                src={wordmarkSrc}
                alt="dxFeed"
                width={s.logoW}
                height={s.logoHpx}
                className={cn(s.logoH, "w-auto object-contain")}
                unoptimized
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={shell} title="Market data provided by dxFeed" aria-label="Powered by dxFeed">
      <DxFeedMark className={cn(s.icon, "shrink-0")} />
      <div
        className={cn(
          "flex min-w-0 flex-col overflow-hidden transition-all duration-300 ease-out",
          "max-w-0 opacity-0",
          "group-hover:ml-2.5 group-hover:max-w-[160px] group-hover:opacity-100",
        )}
      >
        <span className={cn(labelCls, "pl-0.5")}>Powered by</span>
        <Image
          src={wordmarkSrc}
          alt="dxFeed"
          width={s.logoW}
          height={s.logoHpx}
          className={cn(s.logoH, "mt-1 w-auto object-contain object-left")}
          unoptimized
        />
      </div>
    </div>
  );
}

/** Chart watermark — icon only until hover. Shown when dxFeed is live. */
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

  return <DxFeedCreditMark className={className} size={size} tone={tone} variant="chart" />;
}

/** Order ticket — centered, expands on hover with cleaner panel styling. */
export function DxFeedTicketCredit({
  className,
  size = "lg",
}: {
  className?: string;
  size?: Size;
}) {
  const active = useDxFeedActive();
  if (!active) return null;

  return <DxFeedCreditMark className={className} size={size} tone="dark" variant="ticket" />;
}

/** Onboarding — larger “Powered by dxFeed” attribution. */
export function DxFeedOnboardingCredit({
  className,
}: {
  className?: string;
  size?: Size;
}) {
  return (
    <div
      className={cn("flex w-fit flex-col items-start gap-2", className)}
      aria-label="Powered by dxFeed"
    >
      <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--l-body)]">
        Powered by dxFeed
      </span>
      <Image
        src="/vendors/dxfeed/logo-white-h.png"
        alt="dxFeed"
        width={220}
        height={56}
        className="h-10 w-auto object-contain object-left sm:h-12"
        unoptimized
      />
    </div>
  );
}
