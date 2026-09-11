"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isValidOrderNumber, normalizeOrderNumber } from "@/lib/order-number";

/**
 * Recovers a broken Make.com / email link of the form
 *   /onboarding?order=#3328
 * where the browser treats `#3328` as a URL fragment and the server sees an
 * empty `order` query. Reads the hash on the client, then reloads with a clean
 * `?order=3328` so the server-side purchase gate can run.
 */
export function OnboardingOrderGate() {
  const router = useRouter();
  const [message, setMessage] = useState("Checking your purchase…");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = normalizeOrderNumber(params.get("order") ?? "");
    const fromHash = normalizeOrderNumber(window.location.hash.replace(/^#/, ""));
    const order = isValidOrderNumber(fromQuery)
      ? fromQuery
      : isValidOrderNumber(fromHash)
        ? fromHash
        : "";

    if (!order) {
      setMessage("Purchase not found. Redirecting…");
      router.replace("/?notice=purchase");
      return;
    }

    router.replace(`/onboarding?order=${encodeURIComponent(order)}`);
  }, [router]);

  return (
    <div className="onboarding flex min-h-screen items-center justify-center bg-white px-5">
      <p className="text-sm text-[var(--l-muted)]">{message}</p>
    </div>
  );
}
