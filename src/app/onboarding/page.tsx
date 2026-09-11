import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Wizard } from "@/components/onboarding/Wizard";
import { OnboardingOrderGate } from "@/components/onboarding/OnboardingOrderGate";
import { getBackendHttpBase } from "@/lib/api-base";
import { isValidOrderNumber, normalizeOrderNumber } from "@/lib/order-number";

export const metadata: Metadata = {
  title: "Register & activate — The Vault",
  description: "Create your account, verify your identity, confirm purchase, and activate trading.",
};

/**
 * Purchase-gated registration — `/onboarding?order=ORDER_NUMBER`.
 *
 * Order numbers from ClickFunnels look like "#3327". Email links must use
 * `?order=3327` (no raw `#`). A broken `?order=#3327` link is recovered on the
 * client via {@link OnboardingOrderGate}.
 */
export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  const orderNumber = normalizeOrderNumber(typeof order === "string" ? order : "");

  // Empty / hash-truncated query — don't redirect yet; client may recover from `#3327`.
  if (!orderNumber) {
    return <OnboardingOrderGate />;
  }

  if (!isValidOrderNumber(orderNumber)) {
    redirect("/?notice=purchase");
  }

  const backend = getBackendHttpBase();
  if (!backend) {
    redirect("/?notice=purchase");
  }

  let ok = false;
  try {
    const res = await fetch(
      `${backend}/api/purchases/${encodeURIComponent(orderNumber)}/validate`,
      { cache: "no-store" },
    );
    if (res.ok) {
      const data = (await res.json()) as { ok?: boolean };
      ok = Boolean(data.ok);
    }
  } catch {
    ok = false;
  }

  if (!ok) {
    redirect("/?notice=purchase");
  }

  return (
    <div className="onboarding min-h-screen bg-white">
      <header className="border-b border-[var(--l-line)]">
        <div className="mx-auto flex h-14 max-w-[1100px] items-center px-5 sm:h-16 sm:px-8">
          <Link
            href="/"
            className="text-[13px] font-extrabold tracking-[0.22em] text-[var(--l-ink)] uppercase sm:text-[15px]"
          >
            The Vault
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-5 py-10 sm:px-8 sm:py-14">
        <Wizard orderNumber={orderNumber} />
      </main>
    </div>
  );
}
