"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useDxFeedActive } from "./useDxFeedActive";
import { useFeedStatusStore } from "@/store/feed-status-store";

/** About dialog — shows the dxFeed logo once market-data connection is established. */
export function AboutDxFeedModal({ onClose }: { onClose: () => void }) {
  const active = useDxFeedActive();
  const exchanges = useFeedStatusStore((s) => s.state?.exchanges ?? []);
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
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <h2 className="text-sm font-semibold">About market data</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded px-1.5 text-muted hover:text-foreground"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <p className="text-[13px] leading-relaxed text-muted">
            The Vault trading terminal. Live futures quotes and charts use the
            configured market-data provider.
          </p>

          {active ? (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a0e17]">
              <div className="bg-gradient-to-b from-[#f05a28]/20 to-transparent px-5 pb-2 pt-5">
                <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-[#ff8f6b]">
                  Powered by
                </p>
              </div>
              <div className="flex flex-col items-center gap-4 px-5 pb-6 pt-2">
                <Image
                  src="/vendors/dxfeed/logo-white-v.png"
                  alt="dxFeed"
                  width={220}
                  height={220}
                  className="h-auto w-[200px] sm:w-[220px]"
                  unoptimized
                />
                <Image
                  src="/vendors/dxfeed/logo-white-h.png"
                  alt=""
                  width={160}
                  height={40}
                  className="h-8 w-auto opacity-90"
                  unoptimized
                />
                <p className="max-w-[280px] text-center text-[12px] leading-relaxed text-white/55">
                  Live CME / futures market data for The Vault
                  {exchanges.length > 0 ? (
                    <>
                      {" "}
                      · entitled: {exchanges.slice(0, 5).join(", ")}
                      {exchanges.length > 5 ? "…" : ""}
                    </>
                  ) : null}
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-surface-2 px-4 py-5 text-center text-[13px] text-muted">
              dxFeed market data is not connected on this environment.
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
