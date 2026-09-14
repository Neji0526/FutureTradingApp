import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getBackendHttpBase } from "@/lib/api-base";
import { isValidOrderNumber, normalizeOrderNumber } from "@/lib/order-number";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COUNTRY_RE = /^[A-Z]{2}$/;
const ALLOWED_MIME = new Set(["image/png", "image/jpeg", "application/pdf"]);
const MAX_BYTES = 10 * 1024 * 1024;

/**
 * Purchase-gated registration complete.
 * Accepts wizard fields + KYC files, stores uploads locally, forwards profile to TradingBackend.
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
  const idType = str(form.get("idType"));
  const addressType = str(form.get("addressType"));

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
  if (!idType) return NextResponse.json({ error: "Identity document type is required." }, { status: 400 });
  if (!addressType) {
    return NextResponse.json({ error: "Proof of address type is required." }, { status: 400 });
  }

  let idDocument: DocMeta;
  let addressDocument: DocMeta;
  try {
    idDocument = await saveUpload(form.get("idFile"), orderNumber, "id");
    addressDocument = await saveUpload(form.get("addressFile"), orderNumber, "address");
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not save documents." },
      { status: 400 },
    );
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
        idType,
        addressType,
        idDocument,
        addressDocument,
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

type DocMeta = {
  fileName: string;
  storedPath: string;
  mimeType: string;
  size: number;
};

async function saveUpload(
  entry: FormDataEntryValue | null,
  orderNumber: string,
  kind: "id" | "address",
): Promise<DocMeta> {
  if (!(entry instanceof File) || entry.size <= 0) {
    throw new Error(kind === "id" ? "Identity document is required." : "Proof of address is required.");
  }
  const mime = (entry.type || "").toLowerCase();
  if (!ALLOWED_MIME.has(mime)) {
    throw new Error("Documents must be PNG, JPG, or PDF.");
  }
  if (entry.size > MAX_BYTES) {
    throw new Error("Each document must be under 10 MB.");
  }

  const safeOrder = orderNumber.replace(/[^a-zA-Z0-9_-]/g, "_");
  const ext =
    mime === "application/pdf" ? "pdf" : mime === "image/png" ? "png" : "jpg";
  const fileName = entry.name?.trim() || `${kind}.${ext}`;
  const storedName = `${kind}-${Date.now()}.${ext}`;
  const dir = path.join(process.cwd(), "uploads", "onboarding", safeOrder);
  await mkdir(dir, { recursive: true });
  const storedPath = path.join(dir, storedName);
  const buf = Buffer.from(await entry.arrayBuffer());
  await writeFile(storedPath, buf);

  return {
    fileName,
    storedPath,
    mimeType: mime,
    size: buf.length,
  };
}

function str(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}
