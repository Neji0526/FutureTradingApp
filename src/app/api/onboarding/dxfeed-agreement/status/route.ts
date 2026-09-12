import { NextResponse } from "next/server";
import { getBackendHttpBase } from "@/lib/api-base";
import { isValidOrderNumber, normalizeOrderNumber } from "@/lib/order-number";

export const runtime = "nodejs";

/** Proxy → FutureTradingBackend POST /api/onboarding/dxfeed-agreement/status */
export async function POST(req: Request) {
  const backend = getBackendHttpBase();
  if (!backend) {
    return NextResponse.json({ error: "Purchase backend is not configured." }, { status: 503 });
  }

  let body: { orderNumber?: string; email?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const orderNumber = normalizeOrderNumber(String(body.orderNumber ?? ""));
  const email = String(body.email ?? "").trim().toLowerCase();

  if (!isValidOrderNumber(orderNumber)) {
    return NextResponse.json({ error: "Invalid order number." }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${backend}/api/onboarding/dxfeed-agreement/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ orderNumber, email: email || undefined }),
    });
    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, {
      status: upstream.status >= 400 && upstream.status < 600 ? upstream.status : upstream.ok ? 200 : 502,
    });
  } catch {
    return NextResponse.json({ error: "Purchase backend unreachable." }, { status: 502 });
  }
}
