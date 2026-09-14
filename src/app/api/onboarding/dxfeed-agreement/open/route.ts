import { NextResponse } from "next/server";
import { getBackendHttpBase } from "@/lib/api-base";
import { isValidOrderNumber, normalizeOrderNumber } from "@/lib/order-number";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function parseBody(req: Request): Promise<{
  orderNumber: string;
  email: string;
  openTicket: string;
}> {
  const ctype = req.headers.get("content-type") ?? "";
  if (ctype.includes("application/json")) {
    const body = (await req.json().catch(() => ({}))) as {
      orderNumber?: string;
      email?: string;
      openTicket?: string;
    };
    return {
      orderNumber: normalizeOrderNumber(String(body.orderNumber ?? "")),
      email: String(body.email ?? "").trim().toLowerCase(),
      openTicket: String(body.openTicket ?? "").trim(),
    };
  }
  const form = await req.formData();
  return {
    orderNumber: normalizeOrderNumber(String(form.get("orderNumber") ?? "")),
    email: String(form.get("email") ?? "").trim().toLowerCase(),
    openTicket: String(form.get("openTicket") ?? "").trim(),
  };
}

function wantsBrowserRedirect(req: Request): boolean {
  const ctype = req.headers.get("content-type") ?? "";
  const accept = req.headers.get("accept") ?? "";
  if (ctype.includes("application/x-www-form-urlencoded") || ctype.includes("multipart/form-data")) {
    return true;
  }
  // Fetch with Accept: text/html from a full navigation-style open.
  return accept.includes("text/html") && !accept.includes("application/json");
}

/** Proxy → FutureTradingBackend; browser form posts get a 302 (URL not in JSON). */
export async function POST(req: Request) {
  const backend = getBackendHttpBase();
  if (!backend) {
    return NextResponse.json({ error: "Purchase backend is not configured." }, { status: 503 });
  }

  let parsed: { orderNumber: string; email: string; openTicket: string };
  try {
    parsed = await parseBody(req);
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const { orderNumber, email, openTicket } = parsed;
  const asRedirect = wantsBrowserRedirect(req);

  if (!isValidOrderNumber(orderNumber)) {
    return NextResponse.json({ error: "Invalid order number." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }
  if (!openTicket) {
    return NextResponse.json({ error: "Missing open ticket." }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${backend}/api/onboarding/dxfeed-agreement/open`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ orderNumber, email, openTicket }),
    });
    const data = (await upstream.json().catch(() => ({}))) as {
      error?: string;
      redirect?: string;
      code?: string;
    };

    if (upstream.ok && typeof data.redirect === "string" && data.redirect.startsWith("https://")) {
      if (asRedirect) {
        return NextResponse.redirect(data.redirect, 302);
      }
      // JSON clients still get redirect once — prefer form POST from the Wizard.
      return NextResponse.json({ ok: true, redirect: data.redirect, openOnce: true });
    }

    const status =
      upstream.status >= 400 && upstream.status < 600 ? upstream.status : 502;
    if (asRedirect) {
      const back = new URL("/onboarding", req.url);
      back.searchParams.set("order", orderNumber);
      back.searchParams.set("dxOpenErr", "1");
      return NextResponse.redirect(back, 302);
    }
    return NextResponse.json(
      {
        ok: false,
        code: data.code ?? "open_failed",
        error: data.error ?? "Could not open the agreement.",
        openOnce: true,
      },
      { status },
    );
  } catch {
    return NextResponse.json({ error: "Purchase backend unreachable." }, { status: 502 });
  }
}
