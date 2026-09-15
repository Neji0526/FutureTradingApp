import { Img } from "./Img";

/** Global reach: the dotted map with its located pins. */
export function WorldMap() {
  return (
    <section className="bg-white pb-16 sm:pb-24">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
        <header className="mx-auto max-w-2xl text-center">
          <p className="l-serif text-[15px] text-[var(--l-body)] sm:text-[16px]">Worldwide</p>
          <h2 className="mt-2.5 text-[clamp(1.7rem,4.6vw,2.8rem)] leading-[1.1] font-extrabold tracking-[-0.03em]">
            <span className="text-[var(--l-red)]">One platform.</span>{" "}
            <span className="text-[var(--l-ink)]">52 Countries.</span>
          </h2>
          <p className="mt-4 text-[14.5px] leading-relaxed text-[var(--l-body)] sm:text-[15.5px]">
            Funded traders on every continent. No borders, no exceptions.
          </p>
        </header>

        {/* Full-width map on all breakpoints — no horizontal scroll on mobile. */}
        <div className="mt-8 flex justify-center sm:mt-12">
          <Img
            src="/landing/world-map.png"
            alt="World map with funded traders marked in Los Angeles, New York, São Paulo, Frankfurt, Moscow, Dubai, Cape Town and Sydney"
            label="world-map.png"
            fit="contain"
            sizes="(max-width: 640px) 92vw, (max-width: 1200px) 100vw, 1180px"
            className="h-auto w-full max-w-[300px] border-0 bg-transparent sm:max-w-none sm:aspect-[1376/768]"
          />
        </div>
      </div>
    </section>
  );
}
