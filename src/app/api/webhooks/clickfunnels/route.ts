import { NextResponse } from "next/server";
import { MAKE_WEBHOOK_URL } from "@/lib/constants";
import { getBackendHttpBase } from "@/lib/api-base";

export const runtime = "nodejs";

/**
 * ClickFunnels purchase webhook.
 *
 * 1. Persist the purchase on TradingBackend (email + order number) — the only
 *    way a purchase is ever recorded.
 * 2. Forward the same event to Make.com for the onboarding email automation.
 *
 * Point ClickFunnels at: POST /api/webhooks/clickfunnels
 */
export async function POST(req: Request) {
  const expected = process.env.CLICKFUNNELS_WEBHOOK_SECRET?.trim();
  if (expected) {
    const header = req.headers.get("x-webhook-secret");
    const query = new URL(req.url).searchParams.get("secret");
    if (header !== expected && query !== expected) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
  }

  let payload: unknown;
  const contentType = req.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("application/json")) {
      payload = await req.json();
    } else if (
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data")
    ) {
      const form = await req.formData();
      payload = Object.fromEntries(form.entries());
    } else {
      const text = (await req.text()).trim();
      if (!text) payload = {};
      else {
        try {
          payload = JSON.parse(text);
        } catch {
          payload = { raw: text };
        }
      }
    }
  } catch {
    return NextResponse.json({ error: "Invalid webhook body." }, { status: 400 });
  }

  const backendBase = getBackendHttpBase();
  if (!backendBase) {
    console.error("[clickfunnels-webhook] NEXT_PUBLIC_WS_URL / backend not configured");
    return NextResponse.json({ error: "Purchase backend is not configured." }, { status: 503 });
  }

  // 1) Record purchase in our database (source of truth).
  let recorded: unknown = null;
  try {
    const persist = await fetch(`${backendBase}/api/webhooks/clickfunnels`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(expected ? { "x-webhook-secret": expected } : {}),
      },
      body: JSON.stringify(payload),
    });
    const persistBody = await persist.json().catch(() => ({}));
    if (!persist.ok) {
      console.error("[clickfunnels-webhook] backend rejected purchase", persist.status, persistBody);
      return NextResponse.json(
        { error: "Failed to record purchase.", detail: persistBody },
        { status: persist.status >= 400 && persist.status < 600 ? persist.status : 502 },
      );
    }
    recorded = persistBody;
  } catch (err) {
    console.error("[clickfunnels-webhook] backend unreachable", err);
    return NextResponse.json({ error: "Purchase backend unreachable." }, { status: 502 });
  }

  // 2) Notify Make.com (non-fatal if Make is down — purchase is already saved).
  let makeOk = false;
  if (MAKE_WEBHOOK_URL) {
    const recordedPurchase = asRecord(asRecord(recorded)?.purchase);
    const orderNumber =
      str(recordedPurchase?.orderNumber) ||
      str(asRecord(payload)?.order_number) ||
      str(asRecord(payload)?.orderNumber) ||
      str(asRecord(asRecord(payload)?.order)?.order_number) ||
      str(asRecord(asRecord(payload)?.contact)?.id) ||
      str(asRecord(payload)?.id);
    const email =
      str(recordedPurchase?.email) ||
      str(asRecord(payload)?.email) ||
      str(asRecord(asRecord(payload)?.contact)?.email);
    const contact = asRecord(asRecord(payload)?.contact) ?? {};
    const contactName =
      str(contact.name) ||
      [str(contact.first_name), str(contact.last_name)].filter(Boolean).join(" ") ||
      str(asRecord(payload)?.name);

    try {
      const upstream = await fetch(MAKE_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          source: "clickfunnels",
          receivedAt: new Date().toISOString(),
          // Top-level fields Make can map without digging into nested CF shapes.
          orderNumber,
          order_number: orderNumber,
          email,
          Email: email,
          name: contactName,
          Name: contactName,
          status: str(asRecord(payload)?.status) || "paid",
          contact: {
            ...contact,
            name: str(contact.name) || contactName,
            first_name: str(contact.first_name) || str(asRecord(payload)?.first_name),
            last_name: str(contact.last_name) || str(asRecord(payload)?.last_name),
            email: str(contact.email) || email,
            Email: str(contact.email) || email,
          },
          data: payload,
          recorded,
        }),
      });
      makeOk = upstream.ok;
      if (!upstream.ok) {
        const t = await upstream.text();
        console.error("[clickfunnels-webhook] Make.com rejected", upstream.status, t.slice(0, 500));
      }
    } catch (err) {
      console.error("[clickfunnels-webhook] Make.com unreachable", err);
    }
  }

  return NextResponse.json({ ok: true, recorded, makeOk });
}

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function str(v: unknown): string {
  if (typeof v === "string" && v.trim()) return v.trim();
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return "";
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "clickfunnels-webhook",
    backendConfigured: Boolean(getBackendHttpBase()),
    makeConfigured: Boolean(MAKE_WEBHOOK_URL),
  });
}
