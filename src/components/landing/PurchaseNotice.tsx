"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/** Banner on the home page when onboarding purchase checks fail. */
export function PurchaseNotice() {
  const search = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (search.get("notice") === "purchase") {
      setVisible(true);
      // Clean the URL so a refresh doesn't keep re-showing forever after dismiss.
      router.replace(pathname, { scroll: false });
    }
  }, [search, router, pathname]);

  if (!visible) return null;

  return (
    <div
      role="alert"
      className="border-b border-[var(--l-red)]/20 bg-[var(--l-red)]/10 px-5 py-3.5 text-center text-[14px] font-semibold text-[var(--l-red)] sm:px-8"
    >
      Please purchase the subscription.
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="ml-3 underline decoration-transparent hover:decoration-current"
        aria-label="Dismiss"
      >
        Dismiss
      </button>
    </div>
  );
}
