import { NextResponse } from "next/server";
import { getBackendHttpBase } from "@/lib/api-base";
import { isValidOrderNumber, normalizeOrderNumber } from "@/lib/order-number";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COUNTRY_RE = /^[A-Z]{2}$/;

/** Proxy → FutureTradingBackend POST /api/onboarding/dxfeed-agreement/reset */
export async function POST(req: Request) {
  const backend = getBackendHttpBase();
  if (!backend) {
    return NextResponse.json({ error: "Purchase backend is not configured." }, { status: 503 });
  }

  let body: {
    orderNumber?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    country?: string;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const orderNumber = normalizeOrderNumber(String(body.orderNumber ?? ""));
  const email = String(body.email ?? "").trim().toLowerCase();
  const firstName = String(body.firstName ?? "").trim();
  const lastName = String(body.lastName ?? "").trim();
  const country = String(body.country ?? "").trim().toUpperCase();

  if (!isValidOrderNumber(orderNumber)) {
    return NextResponse.json({ error: "Invalid order number." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }
  if (firstName.length < 2 || lastName.length < 2) {
    return NextResponse.json({ error: "Please enter your full name first." }, { status: 400 });
  }
  if (!COUNTRY_RE.test(country)) {
    return NextResponse.json({ error: "Country is required." }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${backend}/api/onboarding/dxfeed-agreement/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ orderNumber, email, firstName, lastName, country }),
    });
    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, {
      status: upstream.status >= 400 && upstream.status < 600 ? upstream.status : upstream.ok ? 200 : 502,
    });
  } catch {
    return NextResponse.json({ error: "Purchase backend unreachable." }, { status: 502 });
  }
}
