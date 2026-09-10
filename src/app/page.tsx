import type { Metadata } from "next";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { CLICKFUNNELS_CHECKOUT_URL, SESSION_COOKIE } from "@/lib/constants";

import { LandingNav } from "@/components/landing/LandingNav";
import { Hero } from "@/components/landing/Hero";
import { ScalingLadder } from "@/components/landing/ScalingLadder";
import { TrustStats } from "@/components/landing/TrustStats";
import { WorldMap } from "@/components/landing/WorldMap";
import { Certificates } from "@/components/landing/Certificates";
import { Reviews } from "@/components/landing/Reviews";
import { TopTraders } from "@/components/landing/TopTraders";
import { FiveSteps } from "@/components/landing/FiveSteps";
import { Pricing } from "@/components/landing/Pricing";
import { Faq } from "@/components/landing/Faq";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { PurchaseNotice } from "@/components/landing/PurchaseNotice";

const TITLE = "The Vault — Get funded, keep every dollar you make";
const DESCRIPTION =
  "Pass a two-step evaluation on real CME futures, scale to a $1,000,000 funded account, and keep 100% of your profits. Unlimited free resets, payouts within 24 hours.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website", siteName: "The Vault" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

/**
 * Public landing page.
 *
 * This route used to redirect straight into the portal. It now renders the
 * marketing page for everyone; the session cookie only decides where the CTAs
 * point, so a signed-in visitor still lands one click from their dashboard.
 */
export default async function Home() {
  const store = await cookies();
  const session = store.get(SESSION_COOKIE)?.value;
  const role = session?.split(":")[1];

  const isAuthed = Boolean(session);
  const portalHref = role === "admin" ? "/admin/traders" : "/dashboard";
  // Guests buy an evaluation on ClickFunnels; signed-in users go to the portal.
  const purchaseHref = CLICKFUNNELS_CHECKOUT_URL || "/?notice=purchase";
  const ctaHref = isAuthed ? portalHref : purchaseHref;
  const ctaLabel = isAuthed ? "Go to your dashboard" : "Get Funded Today";

  return (
    <div className="landing">
      <a href="#main" className="l-skip">
        Skip to content
      </a>

      <Suspense fallback={null}>
        <PurchaseNotice />
      </Suspense>

      <LandingNav isAuthed={isAuthed} homeHref={portalHref} purchaseHref={purchaseHref} />

      <main id="main">
        <Hero ctaHref={ctaHref} ctaLabel={ctaLabel} />
        <ScalingLadder ctaHref={ctaHref} />
        <TrustStats />
        <WorldMap />
        <Certificates />
        <Reviews />
        <TopTraders ctaHref={ctaHref} />
        <FiveSteps ctaHref={ctaHref} />
        <Pricing ctaHref={ctaHref} />
        <Faq />
      </main>

      <LandingFooter />
    </div>
  );
}
