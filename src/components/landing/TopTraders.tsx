import Link from "next/link";
import { Img } from "./Img";
import { FACE_FOCUS, FEATURED_TRADER, MOSAIC_LEFT, MOSAIC_RIGHT, MOSAIC_MOBILE } from "./data";
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

/**
 * Desktop mosaic geometry in design pixels, multiplied by `--s` on the
 * container. Each side is three columns of two tiles, left to right; the
 * outer columns sit highest and step down towards the featured trader.
 */
type MosaicCol = { w: number; top: number; h: [number, number] };

const LEFT_COLS: MosaicCol[] = [
  { w: 75, top: 11, h: [97, 119] },
  { w: 75, top: 33, h: [102, 86] },
  { w: 86, top: 55, h: [120, 97] },
];
const RIGHT_COLS: MosaicCol[] = [
  { w: 87, top: 55, h: [97, 118] },
  { w: 76, top: 33, h: [87, 107] },
  { w: 76, top: 0, h: [118, 97] },
];
const FEATURED = { w: 154, h: 196, top: 27 };
const GAP = 10;

const px = (n: number) => `calc(var(--s) * ${n}px)`;

function Tile({ src, w, h }: { src: string; w: number; h: number }) {
  return (
    <div className="relative overflow-hidden rounded-2xl" style={{ width: px(w), height: px(h) }}>
      <Img
        src={src}
        alt=""
        label={src.split("/").pop()}
        tone="dark"
        position={FACE_FOCUS[src]}
        sizes="(min-width: 1280px) 135px, 115px"
        className="h-full w-full border-0 bg-transparent"
      />
      <Verified />
    </div>
  );
}

/** Fills columns top tile first, column by column. */
function MosaicSide({ cols, srcs }: { cols: MosaicCol[]; srcs: string[] }) {
  return (
    <div className="flex shrink-0 items-start" style={{ gap: px(GAP) }}>
      {cols.map((col, i) => (
        <div
          key={i}
          className="flex flex-col"
          style={{ marginTop: px(col.top), gap: px(GAP) }}
        >
          {col.h.map((h, j) => {
            const src = srcs[i * 2 + j];
            return src ? <Tile key={src} src={src} w={col.w} h={h} /> : null;
          })}
        </div>
      ))}
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
 * Funded-trader wall. One header (pill, heading, copy) at every width.
 * Mobile / tablet: compact 3×2 grid with the CTA underneath.
 * Desktop (lg+): CTA in the header, then the featured trader with staggered
 * mosaics either side.
 */
export function TopTraders({ ctaHref }: { ctaHref: string }) {
  return (
    <section id="traders" className="l-grid overflow-hidden py-14 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
        <header className="mx-auto max-w-2xl text-center">
          <span className="inline-flex rounded-full border border-white/15 bg-white/[0.06] px-4 py-1.5 text-[12px] font-medium text-white/80 sm:text-[12.5px]">
            Top Traders
          </span>
          <h2 className="mt-5 text-[clamp(1.8rem,4.6vw,3rem)] leading-[1.14] font-extrabold tracking-[-0.025em] text-white">
            Traders Who Scaled
            <br />
            <span className="l-serif font-normal">With The Vault</span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[13.5px] leading-relaxed text-white/55 sm:text-[15px]">
            From first funding to $1,000,000 accounts. These traders proved it&rsquo;s possible.
          </p>
          {/* Below lg the CTA sits under the compact grid instead. */}
          <div className="mt-7 hidden justify-center lg:flex">
            <Cta href={ctaHref} />
          </div>
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
                position={FACE_FOCUS[src]}
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

        {/* Desktop mosaic — fan of 3×2 tiles each side + featured center */}
        <div
          className="mt-12 hidden items-start justify-center [--s:1.3] lg:flex xl:[--s:1.5]"
          style={{ gap: px(16) }}
        >
          <MosaicSide cols={LEFT_COLS} srcs={MOSAIC_LEFT} />

          <figure
            className="relative z-10 shrink-0"
            style={{ width: px(FEATURED.w), marginTop: px(FEATURED.top) }}
          >
            <div
              className="relative overflow-hidden rounded-2xl shadow-[0_20px_50px_-20px_rgba(0,0,0,0.55)]"
              style={{ height: px(FEATURED.h) }}
            >
              <Img
                src={FEATURED_TRADER.src}
                alt={FEATURED_TRADER.name}
                label="trader-center.jpg"
                tone="dark"
                sizes="(min-width: 1280px) 235px, 200px"
                className="h-full w-full border-0 bg-transparent"
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

          <MosaicSide cols={RIGHT_COLS} srcs={MOSAIC_RIGHT} />
        </div>
      </div>
    </section>
  );
}
