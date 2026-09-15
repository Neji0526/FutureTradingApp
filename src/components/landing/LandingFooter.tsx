import Link from "next/link";
import { FOOTER_LINKS } from "./data";
import { Img } from "./Img";

export function LandingFooter() {
  return (
    <footer className="l-grid pt-12 pb-8 sm:pt-20 sm:pb-10">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
        <div className="flex flex-col gap-10 lg:grid lg:grid-cols-5 lg:gap-x-10 lg:gap-y-12">
          <div className="lg:col-span-2">
            <p className="text-[14px] font-extrabold tracking-[0.22em] text-white uppercase sm:text-[15px]">
              The Vault
            </p>
            <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-white/45 sm:mt-4 sm:text-[13.5px]">
              Funding futures traders on real CME liquidity. Pass the evaluation, trade our capital,
              keep 100% of what you make.
            </p>
            <Img
              src="/landing/signature-white.png"
              alt="Founder signature"
              label="signature-white.png"
              fit="contain"
              tone="dark"
              sizes="140px"
              className="mt-5 h-10 w-36 border-0 bg-transparent sm:mt-6 sm:h-12 sm:w-40"
            />
          </div>

          {/*
            Mobile: three equal columns so nothing sits alone with dead space.
            Desktop: `contents` lifts each nav into the parent 5-col grid.
          */}
          <div className="grid grid-cols-3 gap-x-3 gap-y-8 border-t border-white/10 pt-8 sm:gap-x-8 sm:pt-10 lg:contents lg:border-0 lg:pt-0">
            {FOOTER_LINKS.map((col) => (
              <nav key={col.heading} aria-label={col.heading}>
                <h2 className="text-[10px] font-bold tracking-[0.14em] text-white/40 uppercase sm:text-[11px] sm:tracking-[0.16em]">
                  {col.heading}
                </h2>
                <ul className="mt-3 space-y-2 sm:mt-4 sm:space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-[12px] leading-snug text-white/70 transition-colors hover:text-white sm:text-[13.5px]"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 sm:mt-14 sm:gap-4 sm:pt-8 sm:flex-row sm:items-start sm:justify-between">
          <p className="shrink-0 text-[11px] text-white/35 sm:text-[12px]">
            © {new Date().getFullYear()} The Vault. All rights reserved.
          </p>
          <p className="max-w-xl text-[10.5px] leading-relaxed text-white/30 sm:text-right sm:text-[11px]">
            Futures trading carries substantial risk of loss and is not suitable for every investor.
            Evaluation accounts are simulated. Past performance is not indicative of future results.
          </p>
        </div>
      </div>
    </footer>
  );
}
