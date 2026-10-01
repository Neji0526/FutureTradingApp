"use client";

import { useEffect, useState } from "react";

/**
 * Keeps content mounted long enough to animate in and out.
 *
 * `mounted` controls rendering; `shown` flips one frame after mount (and back
 * before unmount) so CSS transitions have a start and end state. `exitMs`
 * must match the transition duration used by the caller.
 */
export function usePresence(open: boolean, exitMs: number) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      let inner = 0;
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => setShown(true));
      });
      return () => {
        cancelAnimationFrame(outer);
        cancelAnimationFrame(inner);
      };
    }
    setShown(false);
    const t = window.setTimeout(() => setMounted(false), exitMs);
    return () => window.clearTimeout(t);
  }, [open, exitMs]);

  return { mounted, shown };
}
