import Link from "next/link";
import { Img } from "./Img";
import { FEATURED_TRADER, MOSAIC_LEFT, MOSAIC_RIGHT, MOSAIC_MOBILE } from "./data";
import { IconCheck, IconArrowRight, IconArrowUpRight } from "./icons";

function Verified({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={[
        "absolute flex items-center justify-center rounded-full bg-[var(--l-red)] text-white shadow-[0_2px_8px_rgba(0,0,0,0.35)]",
        compact
          ? "right-1.5 bottom-1.5 h-5 w-5 p-0.5"
          : "right-2.5 bottom-2.5 h-7 w-7 p-1.5",
      ].join(" ")}
    >
      <IconCheck />
    </span>
  );
}

const OFFSETS = ["mt-8", "mt-0", "mt-14", "mt-4", "mt-20", "mt-10"];

function Tile({ src, offset }: { src: string; offset: string }) {
  return (
    <div className={offset}>
      <div className="relative">
        <Img
          src={src}
          alt=""
          label={src.split("/").pop()}
          tone="dark"
          sizes="150px"
          className="aspect-[4/5] w-full rounded-xl border-white/10"
        />
        <Verified />
      </div>
    </div>
  );
}

function Cta({ href, className }: { href: string; className?: string }) {
  return (
    <Link
      href={href}
      className={[
        "inline-flex items-center gap-2 rounded-full bg-white font-bold text-[var(--l-ink)] transition-transform hover:-translate-y-0.5",
        className ?? "px-6 py-3 text-[14px]",
      ].join(" ")}
    >
      Get Funded Now
      <span className="h-4 w-4">
        <IconArrowRight />
      </span>
    </Link>
  );
}

/**
 * Funded-trader wall.
 * Mobile / tablet: compact 3×2 grid of six traders only.
 * Desktop (lg+): full staggered mosaic with featured trader.
 */
export function TopTraders({ ctaHref }: { ctaHref: string }) {
  return (
    <section id="traders" className="l-grid overflow-hidden py-14 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
        <header className="mx-auto max-w-2xl text-center">
          <p className="hidden rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[11.5px] font-semibold text-white/75 lg:inline-block">
            Top Traders
          </p>
          <h2 className="text-[clamp(1.8rem,4.6vw,3rem)] leading-[1.14] font-extrabold tracking-[-0.025em] text-white lg:mt-5">
            Traders Who Scaled
            <br />
            <span className="l-serif font-normal">With The Vault</span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[13.5px] leading-relaxed text-white/55 sm:text-[15px] lg:mt-4">
            From first funding to $1,000,000 accounts. These traders proved it&rsquo;s possible.
          </p>
        </header>

        {/* Compact six-trader grid below lg */}
        <div className="mt-8 grid grid-cols-3 gap-2 sm:mt-10 sm:gap-3 lg:hidden">
          {MOSAIC_MOBILE.map((src) => (
            <div key={src} className="relative">
              <Img
                src={src}
                alt=""
                label={src.split("/").pop()}
                tone="dark"
                sizes="30vw"
                className="aspect-[3/4] w-full rounded-lg border-white/10 sm:rounded-xl"
              />
              <Verified compact />
            </div>
          ))}
        </div>

        <div className="mt-7 flex justify-center lg:hidden">
          <Cta href={ctaHref} className="px-5 py-2.5 text-[13px] sm:px-6 sm:py-3 sm:text-[14px]" />
        </div>

        {/* Desktop mosaic */}
        <div className="mt-16 hidden grid-cols-[1fr_auto_1fr] items-start gap-6 lg:grid">
          <div className="grid grid-cols-3 items-start gap-4">
            {MOSAIC_LEFT.map((src, i) => (
              <Tile key={src} src={src} offset={OFFSETS[i % OFFSETS.length]} />
            ))}
          </div>

          <figure className="w-[220px]">
            <div className="relative">
              <Img
                src={FEATURED_TRADER.src}
                alt={FEATURED_TRADER.name}
                label="trader-center.jpg"
                tone="dark"
                sizes="220px"
                className="aspect-[4/5] w-full rounded-2xl border-2 border-white"
              />
              <span className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--l-blue-600)] p-2 text-white shadow-[0_2px_10px_rgba(0,0,0,0.35)]">
                <IconArrowUpRight />
              </span>
            </div>
            <figcaption className="mt-4 text-center">
              <p className="text-[16px] font-bold text-white">{FEATURED_TRADER.name}</p>
              <p className="mt-1 text-[11px] font-semibold tracking-[0.14em] text-[var(--l-blue-300)] uppercase">
                {FEATURED_TRADER.role}
              </p>
            </figcaption>
          </figure>

          <div className="grid grid-cols-3 items-start gap-4">
            {MOSAIC_RIGHT.map((src, i) => (
              <Tile key={src} src={src} offset={OFFSETS[(i + 3) % OFFSETS.length]} />
            ))}
          </div>
        </div>

        <div className="mt-10 hidden justify-center lg:flex">
          <Cta href={ctaHref} />
        </div>
      </div>
    </section>
  );
}
