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
          : "right-2 bottom-2 h-6 w-6 p-1 sm:right-2.5 sm:bottom-2.5 sm:h-7 sm:w-7 sm:p-1.5",
      ].join(" ")}
    >
      <IconCheck />
    </span>
  );
}

/** Mild vertical stagger — matches the design mosaic without large empty gaps. */
const LEFT_OFFSETS = ["mt-0", "mt-8", "mt-3", "mt-10", "mt-2", "mt-12"];
const RIGHT_OFFSETS = ["mt-6", "mt-0", "mt-10", "mt-4", "mt-12", "mt-2"];

function Tile({ src, offset }: { src: string; offset: string }) {
  return (
    <div className={offset}>
      <div className="relative overflow-hidden rounded-2xl">
        <Img
          src={src}
          alt=""
          label={src.split("/").pop()}
          tone="dark"
          sizes="(min-width: 1280px) 140px, 120px"
          className="aspect-[3/4] w-full border-0 bg-transparent"
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
        className ?? "px-7 py-3.5 text-[14px]",
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
 * Mobile / tablet: compact 3×2 grid (unchanged).
 * Desktop (lg+): centered featured trader with staggered mosaics either side.
 */
export function TopTraders({ ctaHref }: { ctaHref: string }) {
  return (
    <section id="traders" className="l-grid overflow-hidden py-14 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
        {/* Mobile / tablet header — keep current copy */}
        <header className="mx-auto max-w-2xl text-center lg:hidden">
          <h2 className="text-[clamp(1.8rem,4.6vw,3rem)] leading-[1.14] font-extrabold tracking-[-0.025em] text-white">
            Traders Who Scaled
            <br />
            <span className="l-serif font-normal">With The Vault</span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[13.5px] leading-relaxed text-white/55 sm:text-[15px]">
            From first funding to $1,000,000 accounts. These traders proved it&rsquo;s possible.
          </p>
        </header>

        {/* Desktop header — light eyebrow only, mosaic is the hero */}
        <header className="mx-auto hidden max-w-xl text-center lg:block">
          <p className="l-serif text-[17px] text-white/55">it&rsquo;s possible.</p>
        </header>

        {/* Compact six-trader grid below lg — unchanged */}
        <div className="mt-8 grid grid-cols-3 gap-2 sm:mt-10 sm:gap-3 lg:hidden">
          {MOSAIC_MOBILE.map((src) => (
            <div key={src} className="relative overflow-hidden rounded-lg sm:rounded-xl">
              <Img
                src={src}
                alt=""
                label={src.split("/").pop()}
                tone="dark"
                sizes="30vw"
                className="aspect-[3/4] w-full border-0 bg-transparent"
              />
              <Verified compact />
            </div>
          ))}
        </div>

        <div className="mt-7 flex justify-center lg:hidden">
          <Cta href={ctaHref} className="px-5 py-2.5 text-[13px] sm:px-6 sm:py-3 sm:text-[14px]" />
        </div>

        {/* Desktop mosaic — matches design: 3×2 each side + featured center */}
        <div className="mt-10 hidden items-start justify-center gap-4 xl:gap-5 lg:flex">
          <div className="grid w-[min(100%,380px)] shrink grid-cols-3 gap-3 xl:w-[420px] xl:gap-3.5">
            {MOSAIC_LEFT.map((src, i) => (
              <Tile key={src} src={src} offset={LEFT_OFFSETS[i] ?? "mt-0"} />
            ))}
          </div>

          <figure className="relative z-10 w-[240px] shrink-0 xl:w-[280px]">
            <div className="relative overflow-hidden rounded-2xl border-[3px] border-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.55)]">
              <Img
                src={FEATURED_TRADER.src}
                alt={FEATURED_TRADER.name}
                label="trader-center.jpg"
                tone="dark"
                sizes="(min-width: 1280px) 280px, 240px"
                className="aspect-[4/5] w-full border-0 bg-transparent"
              />
              <span className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--l-blue-600)] p-2 text-white shadow-[0_2px_10px_rgba(0,0,0,0.35)]">
                <IconArrowUpRight />
              </span>
            </div>
            <figcaption className="mt-5 text-center">
              <p className="text-[17px] font-bold tracking-[-0.01em] text-white xl:text-[18px]">
                {FEATURED_TRADER.name}
              </p>
              <p className="mt-1.5 text-[11px] font-semibold tracking-[0.16em] text-[var(--l-blue-300)] uppercase">
                {FEATURED_TRADER.role}
              </p>
            </figcaption>
          </figure>

          <div className="grid w-[min(100%,380px)] shrink grid-cols-3 gap-3 xl:w-[420px] xl:gap-3.5">
            {MOSAIC_RIGHT.map((src, i) => (
              <Tile key={src} src={src} offset={RIGHT_OFFSETS[i] ?? "mt-0"} />
            ))}
          </div>
        </div>

        <div className="mt-12 hidden justify-center lg:flex">
          <Cta href={ctaHref} />
        </div>
      </div>
    </section>
  );
}
