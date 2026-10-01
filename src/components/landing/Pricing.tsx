"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CHALLENGE_PLANS, FUNDED_PLANS, type Plan } from "./data";
import { IconArrowRight, IconCheck, IconInfo } from "./icons";

/** Compact plan card — one screen at a time on mobile. */
function PlanCard({
  plan,
  ctaHref,
  featured,
}: {
  plan: Plan;
  ctaHref: string;
  featured: boolean;
}) {
  return (
    <article
      className={[
        "flex h-full flex-col overflow-hidden rounded-2xl border bg-white",
        featured ? "border-transparent shadow-md" : "border-[var(--l-line)]",
      ].join(" ")}
    >
      <header
        className={[
          "px-4 py-3.5 sm:px-6 sm:py-5",
          featured ? "l-card-blue" : "bg-[var(--l-paper-2)]",
        ].join(" ")}
      >
        <span
          className={[
            "inline-block rounded-md px-2 py-0.5 text-[9px] font-bold tracking-[0.12em] uppercase sm:text-[10px]",
            featured
              ? plan.phase.toLowerCase() === "master"
                ? "bg-[var(--l-red)] text-white"
                : "bg-white/20 text-white"
              : "bg-[var(--l-line)] text-[var(--l-body)]",
          ].join(" ")}
        >
          {plan.phase}
        </span>
        <p
          className={[
            "nums mt-2 text-[1.65rem] leading-none font-extrabold tracking-[-0.03em] sm:text-[2rem]",
            featured ? "text-white" : "text-[var(--l-ink)]",
          ].join(" ")}
        >
          {plan.size}
        </p>
      </header>

      <div className="flex flex-1 flex-col px-4 py-3.5 sm:px-6 sm:py-5">
        <dl>
          {plan.rows.map((r) => (
            <div
              key={r.label}
              className="flex items-center justify-between gap-3 border-b border-[var(--l-line)] py-2 last:border-0"
            >
              <dt className="flex min-w-0 items-center gap-1.5 text-[12px] text-[var(--l-ink)] sm:text-[13px]">
                <span className="h-3 w-3 shrink-0 text-[var(--l-blue-500)] sm:h-3.5 sm:w-3.5">
                  <IconCheck />
                </span>
                <span className="truncate">{r.label}</span>
                {r.hint ? (
                  <span className="hidden h-3.5 w-3.5 shrink-0 text-[var(--l-body)]/50 sm:inline" aria-hidden>
                    <IconInfo />
                  </span>
                ) : null}
              </dt>
              <dd className="nums shrink-0 text-[12px] font-bold text-[var(--l-ink)] sm:text-[13px]">
                {r.value}
              </dd>
            </div>
          ))}
        </dl>

        <a
          href="#faq"
          className="mt-3 text-[12px] font-semibold text-[var(--l-blue-500)] hover:underline sm:text-[13px]"
        >
          All rules &rarr;
        </a>

        <div className="mt-3 flex items-center gap-2">
          <span className="nums text-[12px] text-[var(--l-body)] line-through sm:text-[13px]">
            {plan.was}
          </span>
          <span className="rounded-md bg-[var(--l-red)] px-1.5 py-0.5 text-[9px] font-bold text-white">
            -50%
          </span>
        </div>
        <p className="mt-1 flex items-baseline gap-1.5">
          <span className="nums text-[24px] leading-none font-extrabold tracking-[-0.03em] text-[var(--l-ink)] sm:text-[28px]">
            {plan.now}
          </span>
          <span className="text-[12px] text-[var(--l-body)]">{plan.cadence}</span>
        </p>

        <Link
          href={ctaHref}
          className="mt-3 rounded-xl bg-[var(--l-navy-900)] px-4 py-2.5 text-center text-[13px] font-bold text-white transition-colors hover:bg-[var(--l-navy-800)] sm:mt-4 sm:py-3 sm:text-[14px]"
        >
          Get funded today
        </Link>
      </div>
    </article>
  );
}

/** Round prev/next button centred on the carousel's edge. */
function CarouselArrow({
  dir,
  hidden,
  onClick,
}: {
  dir: "prev" | "next";
  hidden: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === "prev" ? "Previous plans" : "Next plans"}
      tabIndex={hidden ? -1 : 0}
      aria-hidden={hidden}
      className={[
        "absolute top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--l-line)] bg-white text-[var(--l-ink)] shadow-[0_8px_24px_-10px_rgba(10,35,66,0.35)] transition-[opacity,background-color] duration-200 hover:bg-[var(--l-paper-2)] sm:flex",
        dir === "prev" ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2",
        hidden ? "pointer-events-none opacity-0" : "opacity-100",
      ].join(" ")}
    >
      <span className={["h-4 w-4", dir === "prev" ? "rotate-180" : ""].join(" ")}>
        <IconArrowRight />
      </span>
    </button>
  );
}

function featuredFor(tab: "challenge" | "funded", index: number, plan: Plan): boolean {
  if (tab === "challenge") return index === 1;
  return plan.phase !== "Starter";
}

/**
 * Pricing — carousel below lg (one card per view) and for funded plans on lg+
 * (three per view); the two challenge plans sit in a plain grid on lg+.
 * Dots are scroll positions, so with three cards in view there are
 * `plans - 2` of them.
 */
export function Pricing({ ctaHref }: { ctaHref: string }) {
  const [tab, setTab] = useState<"challenge" | "funded">("challenge");
  const [active, setActive] = useState(0);
  const [positions, setPositions] = useState(CHALLENGE_PLANS.length);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const plans = tab === "challenge" ? CHALLENGE_PLANS : FUNDED_PLANS;

  const slideWidth = useCallback(() => {
    const slide = scrollerRef.current?.firstElementChild as HTMLElement | null;
    return slide?.offsetWidth ?? 0;
  }, []);

  const measure = useCallback(() => {
    const el = scrollerRef.current;
    const w = slideWidth();
    // Hidden scroller (challenge tab on lg+) has no width — nothing to page.
    if (!el || w <= 0) return;
    setPositions(Math.max(1, Math.round((el.scrollWidth - el.clientWidth) / w) + 1));
  }, [slideWidth]);

  useEffect(() => {
    setActive(0);
    const el = scrollerRef.current;
    if (el) el.scrollTo({ left: 0, behavior: "instant" in el ? "instant" : "auto" });
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [tab, measure]);

  function onScroll() {
    const el = scrollerRef.current;
    const w = slideWidth();
    if (!el || w <= 0) return;
    const idx = Math.round(el.scrollLeft / w);
    setActive(Math.max(0, Math.min(positions - 1, idx)));
  }

  function goTo(i: number) {
    const el = scrollerRef.current;
    const w = slideWidth();
    if (!el || w <= 0) return;
    const next = Math.max(0, Math.min(positions - 1, i));
    el.scrollTo({ left: next * w, behavior: "smooth" });
    setActive(next);
  }

  // Mouse drag-to-scroll. Touch keeps the native swipe; a drag that moved
  // swallows the click that follows so it doesn't trigger a card link.
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const [dragging, setDragging] = useState(false);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    drag.current = { x: e.clientX, left: e.currentTarget.scrollLeft, moved: false };
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (!d.moved) {
      if (Math.abs(dx) < 5) return;
      d.moved = true;
      setDragging(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    e.currentTarget.scrollLeft = d.left - dx;
  }

  function endDrag() {
    const d = drag.current;
    drag.current = null;
    if (!d?.moved) return;
    setDragging(false);
    suppressClick.current = true;
    window.setTimeout(() => (suppressClick.current = false), 0);
    const el = scrollerRef.current;
    const w = slideWidth();
    if (el && w > 0) goTo(Math.round(el.scrollLeft / w));
  }

  return (
    <section id="pricing" className="bg-white py-14 sm:py-28">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
        <header className="mx-auto max-w-2xl text-center">
          <h2 className="text-[clamp(1.6rem,4.6vw,3rem)] leading-[1.12] font-extrabold tracking-[-0.03em] text-[var(--l-ink)]">
            Get started today
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-[var(--l-body)] sm:mt-4 sm:text-[15.5px]">
            Custom-fit financing built for your unique situation.
          </p>
        </header>

        <div className="mt-7 flex justify-center sm:mt-9">
          <div
            role="tablist"
            aria-label="Account type"
            className="inline-flex rounded-full border border-[var(--l-line)] bg-white p-1"
          >
            {(
              [
                ["challenge", "Challenge Accounts"],
                ["funded", "Funded accounts"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                role="tab"
                type="button"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className={[
                  "rounded-full px-3.5 py-2 text-[12px] font-semibold transition-colors sm:px-6 sm:py-2.5 sm:text-[13.5px]",
                  tab === key
                    ? "bg-[var(--l-navy-900)] text-white"
                    : "text-[var(--l-body)] hover:text-[var(--l-ink)]",
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Carousel — swipe, drag with the mouse, or use the arrows / dots */}
        <div
          className={[
            "mt-7",
            tab === "funded" ? "lg:mx-auto lg:mt-10 lg:max-w-5xl" : "lg:hidden",
          ].join(" ")}
        >
          <div className="relative">
            <CarouselArrow
              dir="prev"
              hidden={active <= 0}
              onClick={() => goTo(active - 1)}
            />
            <CarouselArrow
              dir="next"
              hidden={active >= positions - 1}
              onClick={() => goTo(active + 1)}
            />
            <div
              ref={scrollerRef}
              onScroll={onScroll}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onClickCapture={(e) => {
                if (!suppressClick.current) return;
                e.preventDefault();
                e.stopPropagation();
              }}
              onDragStart={(e) => e.preventDefault()}
              className={[
                "flex touch-pan-x overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] lg:-mx-3 [&::-webkit-scrollbar]:hidden",
                dragging ? "cursor-grabbing snap-none select-none" : "snap-x snap-mandatory sm:cursor-grab",
              ].join(" ")}
            >
              {plans.map((p, i) => (
                <div
                  key={`${tab}-${p.phase}-${p.size}`}
                  className="w-full min-w-full shrink-0 grow-0 basis-full snap-start snap-always px-0.5 lg:w-1/3 lg:min-w-0 lg:basis-1/3 lg:px-3"
                >
                  <PlanCard
                    plan={p}
                    ctaHref={ctaHref}
                    featured={featuredFor(tab, i, p)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 lg:mt-7">
            {plans.slice(0, positions).map((p, i) => (
              <button
                key={`${tab}-${p.phase}-${p.size}-dot`}
                type="button"
                aria-label={`Show ${p.phase} ${p.size}`}
                aria-current={i === active ? "true" : undefined}
                onClick={() => goTo(i)}
                className={[
                  "h-1.5 rounded-full transition-all",
                  i === active
                    ? "w-5 bg-[var(--l-navy-900)]"
                    : "w-1.5 bg-[var(--l-ink)]/20",
                ].join(" ")}
              />
            ))}
          </div>
          <p className="mt-2 text-center text-[11px] text-[var(--l-body)] lg:hidden">
            Swipe left or right for more plans
          </p>
        </div>

        {/* Large screens, challenge plans: two-card grid */}
        {tab === "challenge" && (
          <div className="mx-auto mt-10 hidden max-w-3xl grid-cols-2 gap-6 lg:grid">
            {plans.map((p, i) => (
              <PlanCard
                key={`${p.phase}-${p.size}`}
                plan={p}
                ctaHref={ctaHref}
                featured={featuredFor(tab, i, p)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
