import { NextResponse } from "next/server";
import { getBackendHttpBase } from "@/lib/api-base";
import { isValidOrderNumber, normalizeOrderNumber } from "@/lib/order-number";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COUNTRY_RE = /^[A-Z]{2}$/;

/**
 * Purchase-gated registration complete.
 *
 * Accepts form fields from the onboarding wizard, then forwards the profile to
 * TradingBackend. Document file uploads are not collected in the current flow.
 */
export async function POST(req: Request) {
  const backend = getBackendHttpBase();
  if (!backend) {
    return NextResponse.json({ error: "Purchase backend is not configured." }, { status: 503 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const orderNumber = normalizeOrderNumber(str(form.get("orderNumber")));
  const email = str(form.get("email")).toLowerCase();
  const password = str(form.get("password"));
  const firstName = str(form.get("firstName"));
  const lastName = str(form.get("lastName"));
  const ageRange = str(form.get("ageRange"));
  const country = str(form.get("country")).toUpperCase();
  const acceptTerms = str(form.get("acceptTerms")) === "true";
  const acceptRisk = str(form.get("acceptRisk")) === "true";

  if (!isValidOrderNumber(orderNumber)) {
    return NextResponse.json({ error: "Invalid order number." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }
  if (firstName.length < 2 || lastName.length < 2) {
    return NextResponse.json({ error: "Please enter your full name." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }
  if (!ageRange) return NextResponse.json({ error: "Age range is required." }, { status: 400 });
  if (!COUNTRY_RE.test(country)) {
    return NextResponse.json({ error: "Country is required." }, { status: 400 });
  }
  if (!acceptTerms) {
    return NextResponse.json({ error: "You must accept the terms." }, { status: 400 });
  }
  if (!acceptRisk) {
    return NextResponse.json({ error: "You must confirm the trading rules." }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${backend}/api/onboarding/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        orderNumber,
        email,
        password,
        firstName,
        lastName,
        ageRange,
        country,
        acceptTerms,
        acceptRisk,
      }),
    });
    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, {
      status: upstream.status >= 400 && upstream.status < 600 ? upstream.status : upstream.ok ? 201 : 502,
    });
  } catch {
    return NextResponse.json({ error: "Purchase backend unreachable." }, { status: 502 });
  }
}

function str(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}
