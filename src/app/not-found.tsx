import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { CLICKFUNNELS_CHECKOUT_URL, SESSION_COOKIE } from "@/lib/constants";
import { LandingNav } from "@/components/landing/LandingNav";
import { IconArrowRight } from "@/components/rules/icons";

export const metadata: Metadata = {
  title: "Page not found — The Vault",
  robots: { index: false },
};

/** Shown for any unknown URL or `notFound()` call. Session only decides where the CTA points. */
export default async function NotFound() {
  const store = await cookies();
  const session = store.get(SESSION_COOKIE)?.value;
  const role = session?.split(":")[1];

  const isAuthed = Boolean(session);
  const portalHref = role === "admin" ? "/admin" : "/dashboard";
  const purchaseHref = CLICKFUNNELS_CHECKOUT_URL || "/#pricing";

  return (
    <div className="landing flex min-h-screen flex-col bg-white">
      <LandingNav isAuthed={isAuthed} homeHref={portalHref} purchaseHref={purchaseHref} />

      <main className="l-grid relative flex flex-1 items-center justify-center overflow-hidden px-5 py-20 sm:px-8 sm:py-28">
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--l-blue-500)]/20 blur-[120px]"
        />

        <div className="relative mx-auto max-w-xl text-center">
          <p className="text-[clamp(5.5rem,22vw,10rem)] leading-none font-extrabold tracking-[-0.04em] text-white/90">
            404
          </p>
          <p className="l-serif mt-4 text-[17px] text-[var(--l-blue-300)] sm:text-[19px]">
            This vault is empty
          </p>
          <h1 className="mt-2 text-[clamp(1.5rem,4.5vw,2.25rem)] leading-[1.1] font-extrabold tracking-[-0.01em] text-white uppercase">
            Page not found
          </h1>
          <p className="mx-auto mt-4 max-w-md text-[14px] leading-relaxed text-white/65 sm:text-[15px]">
            The page you&apos;re looking for doesn&apos;t exist or has been moved. Check the
            address, or head back to somewhere familiar.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={isAuthed ? portalHref : "/"}
              className="l-cta inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-[14px] font-bold text-white!"
            >
              {isAuthed ? "Go to your dashboard" : "Back to home"}
              <span className="h-4 w-4">
                <IconArrowRight />
              </span>
            </Link>
            <Link
              href="/rules"
              className="inline-flex items-center rounded-xl border border-white/25 px-6 py-3.5 text-[14px] font-bold text-white! transition-colors hover:border-white/50 hover:bg-white/[0.06]"
            >
              Trading rules
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-[var(--l-line)] py-8">
        <p className="text-center text-[12px] text-[var(--l-body)]/70">
          © {new Date().getFullYear()} The Vault. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
