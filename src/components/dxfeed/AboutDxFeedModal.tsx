"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useDxFeedActive } from "./useDxFeedActive";
import { useFeedStatusStore } from "@/store/feed-status-store";

const EMPTY_EXCHANGES: string[] = [];

/** About dialog — calm, professional dxFeed credit when feed is connected. */
export function AboutDxFeedModal({ onClose }: { onClose: () => void }) {
  const active = useDxFeedActive();
  // Stable fallback — `?? []` in a zustand selector causes React #185 (infinite loop).
  const exchanges = useFeedStatusStore((s) => s.state?.exchanges) ?? EMPTY_EXCHANGES;
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <h2 className="text-sm font-semibold tracking-tight">About market data</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-1.5 py-0.5 text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <p className="text-[13px] leading-relaxed text-muted">
            The Vault shows live futures prices from your configured market-data provider.
          </p>

          {active ? (
            <div className="flex flex-col items-center rounded-xl bg-[#0a0e17] px-6 py-8">
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                Powered by
              </p>
              <Image
                src="/vendors/dxfeed/logo-white-v.png"
                alt="dxFeed"
                width={168}
                height={168}
                className="h-auto w-[140px] sm:w-[160px]"
                unoptimized
              />
              {exchanges.length > 0 ? (
                <p className="mt-5 max-w-[240px] text-center text-[11px] leading-relaxed text-white/40">
                  Entitled: {exchanges.slice(0, 5).join(", ")}
                  {exchanges.length > 5 ? "…" : ""}
                </p>
              ) : (
                <p className="mt-5 text-center text-[11px] text-white/40">
                  Live market data connected
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-surface-2 px-4 py-6 text-center text-[13px] text-muted">
              dxFeed is not connected on this environment.
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
