/** Line icons used across the landing page. All inherit `currentColor`. */

type P = { className?: string };

const base = "h-full w-full";

export function IconCheck({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden>
      <path d="m5 13 4.5 4.5L19 7" />
    </svg>
  );
}

export function IconArrowRight({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden>
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  );
}

export function IconArrowUpRight({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden>
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

export function IconUsers({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden>
      <path d="M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19" />
      <circle cx="10" cy="8" r="3.2" />
      <path d="M20 19v-1.4a3.4 3.4 0 0 0-2.6-3.3M15.5 5.2a3.2 3.2 0 0 1 0 5.6" />
    </svg>
  );
}

export function IconMedal({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden>
      <circle cx="12" cy="9" r="5.2" />
      <path d="m9 13.6-1.4 6.4L12 18l4.4 2-1.4-6.4" />
    </svg>
  );
}

export function IconClock({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M12 7.4V12l3 1.8" />
    </svg>
  );
}

export function IconInfinity({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden>
      <path d="M7 8.5a3.5 3.5 0 1 0 0 7c2.4 0 3.4-1.8 5-3.5 1.6-1.7 2.6-3.5 5-3.5a3.5 3.5 0 1 1 0 7c-2.4 0-3.4-1.8-5-3.5C10.4 10.3 9.4 8.5 7 8.5Z" />
    </svg>
  );
}

export function IconStar({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className ?? base} aria-hidden>
      <path d="m12 3.6 2.6 5.3 5.8.85-4.2 4.1 1 5.75L12 16.9l-5.2 2.7 1-5.75-4.2-4.1 5.8-.85Z" />
    </svg>
  );
}

export function IconQuote({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className ?? base} aria-hidden>
      <path d="M9.5 6.5c-3 1.3-4.8 3.7-4.8 6.6 0 2.6 1.5 4.4 3.7 4.4 1.9 0 3.3-1.4 3.3-3.2 0-1.7-1.2-3-2.9-3-.3 0-.6 0-.8.1.4-1.4 1.6-2.7 3.2-3.5l-1.7-1.4Zm8.4 0c-3 1.3-4.8 3.7-4.8 6.6 0 2.6 1.5 4.4 3.7 4.4 1.9 0 3.3-1.4 3.3-3.2 0-1.7-1.2-3-2.9-3-.3 0-.6 0-.8.1.4-1.4 1.6-2.7 3.2-3.5l-1.7-1.4Z" />
    </svg>
  );
}

export function IconInfo({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className ?? base} aria-hidden>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 11v5.2" strokeLinecap="round" />
      <circle cx="12" cy="7.9" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconDiamond({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className ?? base} aria-hidden>
      <path d="m12 3 9 9-9 9-9-9 9-9Z" />
    </svg>
  );
}

export function IconRefresh({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden>
      <path d="M3.5 12a8.5 8.5 0 0 1 14.2-6.3M20.5 12a8.5 8.5 0 0 1-14.2 6.3" />
      <path d="M17.5 3.5V7h-3.5M6.5 20.5V17H10" />
    </svg>
  );
}

export function IconPercent({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden>
      <path d="m6 18 12-12" />
      <circle cx="7.5" cy="7.5" r="2.2" />
      <circle cx="16.5" cy="16.5" r="2.2" />
    </svg>
  );
}

export function IconScale({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden>
      <path d="M4 19.5h16M7 19.5V9.5M17 19.5V9.5M4.5 9.5h15" />
      <path d="M9.5 9.5 7 5.5 4.5 9.5M19.5 9.5 17 5.5 14.5 9.5" />
      <path d="M12 5.5V3.5" />
    </svg>
  );
}

export function IconBolt({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden>
      <path d="M13 2.5 5.5 13.5h6L11 21.5 18.5 10.5h-6L13 2.5Z" />
    </svg>
  );
}

export function IconRules({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden>
      <path d="M4.5 19.5V5.5A1.5 1.5 0 0 1 6 4h9.5L19.5 8v11.5A1.5 1.5 0 0 1 18 21H6a1.5 1.5 0 0 1-1.5-1.5Z" />
      <path d="M15 4v4.5h4.5M8 12h8M8 15.5h5.5" />
    </svg>
  );
}

export function IconMarkets({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden>
      <path d="M4 18.5V11M9.5 18.5V6.5M15 18.5v-5M20.5 18.5V9" />
      <path d="m4 10 5.5-5 5.5 4.5 5.5-5.5" />
    </svg>
  );
}

export const STAT_ICONS = {
  users: IconUsers,
  medal: IconMedal,
  clock: IconClock,
  infinity: IconInfinity,
} as const;

export const APART_ICONS = {
  refresh: IconRefresh,
  percent: IconPercent,
  scale: IconScale,
  bolt: IconBolt,
  rules: IconRules,
  markets: IconMarkets,
} as const;
