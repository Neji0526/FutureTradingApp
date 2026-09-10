import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Wizard } from "@/components/onboarding/Wizard";
import { getBackendHttpBase } from "@/lib/api-base";

export const metadata: Metadata = {
  title: "Register & activate — The Vault",
  description: "Create your account, verify your identity, confirm purchase, and activate trading.",
};

const ORDER_RE = /^[A-Za-z0-9_-]{4,64}$/;

/**
 * Purchase-gated registration — `/onboarding?order=ORDER_NUMBER`.
 *
 * This is the live register + purchase-confirm flow. The order number comes
 * from the post-purchase email (Make.com). On open we verify the purchase
 * exists, is PAID, and has not been redeemed. Email match is enforced on submit.
 */
export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  const orderNumber = typeof order === "string" ? order.trim() : "";

  if (!ORDER_RE.test(orderNumber)) {
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
