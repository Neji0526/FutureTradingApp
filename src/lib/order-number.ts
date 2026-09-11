/**
 * ClickFunnels order numbers often look like "#3327". Never put a raw "#" in a
 * query string (`?order=#3327` truncates in the browser). Strip it so "#3327"
 * and "3327" match the same purchase.
 */
export function normalizeOrderNumber(raw: string): string {
  return String(raw ?? "")
    .trim()
    .replace(/^#+/, "")
    .trim();
}

export const ORDER_NUMBER_RE = /^[A-Za-z0-9_-]{4,64}$/;

export function isValidOrderNumber(raw: string): boolean {
  return ORDER_NUMBER_RE.test(normalizeOrderNumber(raw));
}

/** Public site origin used in post-purchase email links (Make.com). */
export function getPublicAppOrigin(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "";
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return "https://enterthevault.co";
}

/** Safe onboarding link — order never includes a raw `#`. */
export function buildOnboardingUrl(orderNumber: string): string {
  const order = normalizeOrderNumber(orderNumber);
  return `${getPublicAppOrigin()}/onboarding?order=${encodeURIComponent(order)}`;
}
