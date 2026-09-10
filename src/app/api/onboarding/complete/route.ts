import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getBackendHttpBase } from "@/lib/api-base";

export const runtime = "nodejs";

const ORDER_RE = /^[A-Za-z0-9_-]{4,64}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COUNTRY_RE = /^[A-Z]{2}$/;
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME = new Set(["image/png", "image/jpeg", "application/pdf"]);

/**
 * Purchase-gated registration complete.
 *
 * Accepts multipart form fields + KYC files, stores documents under the backend
 * uploads directory, then forwards the full profile to TradingBackend.
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

  const orderNumber = str(form.get("orderNumber"));
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
  const idFile = form.get("idFile");
  const addressFile = form.get("addressFile");

  if (!ORDER_RE.test(orderNumber)) {
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
    return NextResponse.json({ error: "You must acknowledge the risk disclosure." }, { status: 400 });
  }
  if (!idType) {
    return NextResponse.json({ error: "Identity document type is required." }, { status: 400 });
  }
  if (!addressType) {
    return NextResponse.json({ error: "Address document type is required." }, { status: 400 });
  }
  if (!(idFile instanceof File)) {
    return NextResponse.json({ error: "Identity document upload is required." }, { status: 400 });
  }
  if (!(addressFile instanceof File)) {
    return NextResponse.json({ error: "Proof of address upload is required." }, { status: 400 });
  }

  let idDocument;
  let addressDocument;
  try {
    idDocument = await persistUpload(orderNumber, "id", idFile);
    addressDocument = await persistUpload(orderNumber, "address", addressFile);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not save uploaded files.";
    return NextResponse.json({ error: message }, { status: 400 });
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

function str(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}

async function persistUpload(
  orderNumber: string,
  kind: "id" | "address",
  file: File,
): Promise<{ fileName: string; storedPath: string; mimeType: string; size: number }> {
  const mimeType = (file.type || "").toLowerCase();
  if (!ALLOWED_MIME.has(mimeType)) {
    throw new Error("Documents must be PNG, JPG, or PDF.");
  }
  if (file.size <= 0 || file.size > MAX_BYTES) {
    throw new Error("Each document must be under 10 MB.");
  }

  const ext =
    mimeType === "application/pdf" ? "pdf" : mimeType === "image/png" ? "png" : "jpg";
  const safeOrder = orderNumber.replace(/[^A-Za-z0-9_-]/g, "_");
  const storedName = `${kind}-${Date.now()}.${ext}`;
  const dir = path.join(process.cwd(), "..", "FutureTradingBackend", "uploads", "kyc", safeOrder);
  await mkdir(dir, { recursive: true });
  const absPath = path.join(dir, storedName);
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(absPath, buf);

  // Persist a stable relative path from the backend package root.
  const storedPath = path.posix.join("uploads", "kyc", safeOrder, storedName);
  return {
    fileName: file.name || storedName,
    storedPath,
    mimeType,
    size: file.size,
  };
}
