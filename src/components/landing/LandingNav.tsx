import Image from "next/image";
import Link from "next/link";
import { NavMenu } from "./NavMenu";

export const NAV_LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#scaling", label: "Scaling plan" },
  { href: "#pricing", label: "Pricing" },
  { href: "#payouts", label: "Payouts" },
  { href: "/rules", label: "Rules" },
  { href: "#faq", label: "FAQs" },
];

/**
 * Sticky header: wordmark left, menu toggle right, and nothing else at any
 * width. The links live in <NavMenu>'s dropdown.
 */
export function LandingNav({
  isAuthed,
  homeHref,
  purchaseHref = "/?notice=purchase",
}: {
  isAuthed: boolean;
  homeHref: string;
  /** ClickFunnels checkout for guests (falls back to purchase notice). */
  purchaseHref?: string;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--l-line)] bg-white/90 backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-6 sm:h-16 sm:px-10 lg:px-14">
        <Link href="/" aria-label="The Vault home" className="inline-flex shrink-0 items-center">
          <Image
            src="/logo.png"
            alt="The Vault"
            width={489}
            height={534}
            priority
            className="h-9 w-auto object-contain sm:h-10"
          />
        </Link>

        <NavMenu
          links={NAV_LINKS}
          isAuthed={isAuthed}
          homeHref={homeHref}
          purchaseHref={purchaseHref}
        />
      </nav>
    </header>
  );
}
