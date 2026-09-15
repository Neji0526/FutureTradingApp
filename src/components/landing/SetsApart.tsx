import { APART_FEATURES } from "./data";
import { APART_ICONS } from "./icons";

/**
 * "What Sets The Vault Apart" — six differentiators above the journey section.
 */
export function SetsApart() {
  return (
    <section id="apart" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
        <header className="mx-auto max-w-2xl text-center">
          <p className="l-serif text-[15px] text-[var(--l-body)] sm:text-[16px]">Build your plan</p>
          <h2 className="mt-3 text-[clamp(1.8rem,4.6vw,3rem)] leading-[1.12] font-extrabold tracking-[-0.03em] text-[var(--l-ink)]">
            What Sets{" "}
            <span className="l-serif rounded-sm bg-[var(--l-blue-300)]/35 px-1.5 font-normal text-[var(--l-ink)]">
              The Vault
            </span>{" "}
            Apart
          </h2>
          <p className="mt-4 text-[14.5px] leading-relaxed text-[var(--l-body)] sm:text-[15.5px]">
            Not from our marketing team. From 2,340+ traders:
          </p>
        </header>

        <ul className="mt-12 grid grid-cols-1 gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {APART_FEATURES.map((f) => {
            const Icon = APART_ICONS[f.icon];
            return (
              <li
                key={f.title}
                className="rounded-2xl border border-[var(--l-line)] bg-white p-5 sm:p-6"
              >
                <span className="flex h-9 w-9 items-center justify-center text-[var(--l-blue-500)] sm:h-10 sm:w-10">
                  <Icon />
                </span>
                <h3 className="mt-4 text-[15.5px] font-bold tracking-[-0.01em] text-[var(--l-ink)] sm:text-[16.5px]">
                  {f.title}
                </h3>
                <p className="mt-2.5 text-[13px] leading-relaxed text-[var(--l-body)] sm:text-[13.5px]">
                  {f.body}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
