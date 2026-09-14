"use client";

import { useEffect } from "react";
import { useFeedStatusStore } from "@/store/feed-status-store";

/** True when the backend market-data provider is dxFeed. */
export function useDxFeedActive(): boolean {
  const start = useFeedStatusStore((s) => s.start);
  const stop = useFeedStatusStore((s) => s.stop);
  const provider = useFeedStatusStore((s) => s.state?.provider);
  const dxfeedConnected = useFeedStatusStore((s) => s.state?.dxfeedConnected);

  useEffect(() => {
    start();
    return () => stop();
  }, [start, stop]);

  return dxfeedConnected === true || provider === "dxfeed";
}
