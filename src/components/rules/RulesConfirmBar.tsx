"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { isValidOrderNumber, normalizeOrderNumber } from "@/lib/order-number";

/**
 * Sticky confirm bar when rules are opened from onboarding Documents.
 * Confirm → back to onboarding with trading-rules checkbox checked.
 */
export function RulesConfirmBar() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from");
  const order = normalizeOrderNumber(params.get("order") ?? "");

  if (from !== "onboarding" || !isValidOrderNumber(order)) return null;

  function confirm() {
    router.push(`/onboarding?order=${encodeURIComponent(order)}&rulesAccepted=1`);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--l-line)] bg-white/95 px-4 py-3 shadow-[0_-8px_30px_-12px_rgba(10,35,66,0.25)] backdrop-blur sm:px-8">
      <div className="mx-auto flex max-w-[900px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] leading-relaxed text-[var(--l-body)]">
          Read the trading rules, then confirm to continue onboarding.
        </p>
        <button
          type="button"
          onClick={confirm}
          className="l-cta shrink-0 rounded-xl px-6 py-3 text-[14px] font-bold"
        >
          Confirm &amp; continue
        </button>
      </div>
    </div>
  );
}
