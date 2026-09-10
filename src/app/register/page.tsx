import { redirect } from "next/navigation";
import { CLICKFUNNELS_CHECKOUT_URL } from "@/lib/constants";

/**
 * Standalone `/register` is retired in the UI.
 *
 * Registration + purchase confirmation happen on `/onboarding?order=…` after
 * ClickFunnels payment. This route stays for bookmarks/old links and sends
 * visitors to checkout (or home if checkout is unset).
 *
 * The previous form lives in `./RegisterForm.tsx` and is intentionally unused.
 */
export default function RegisterPage() {
  redirect(CLICKFUNNELS_CHECKOUT_URL || "/?notice=purchase");
}
