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
        className="w-full max-w-sm rounded-xl border border-border bg-surface shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
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

        <div className="space-y-4 px-4 py-5">
          <p className="text-xs text-muted">
            The Vault trading terminal. Live futures quotes and charts use the
            configured market-data provider.
          </p>

          {active ? (
            <div className="rounded-lg border border-border bg-[#0a0e17] px-4 py-5">
              <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-2">
                Connected data source
              </p>
              <div className="flex justify-center">
                <Image
                  src="/vendors/dxfeed/logo-white-v.png"
                  alt="dxFeed"
                  width={140}
                  height={140}
                  className="h-auto w-[140px]"
                  unoptimized
                />
              </div>
              <p className="mt-4 text-center text-xs text-muted">
                Powered by dxFeed
                {exchanges.length > 0 ? (
                  <>
                    {" "}
                    · entitled: {exchanges.slice(0, 6).join(", ")}
                    {exchanges.length > 6 ? "…" : ""}
                  </>
                ) : null}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-surface-2 px-4 py-4 text-center text-xs text-muted">
              dxFeed market data is not connected on this environment.
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
