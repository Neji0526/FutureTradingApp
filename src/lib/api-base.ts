import { WS_URL } from "@/lib/constants";

/** TradingBackend HTTP origin derived from NEXT_PUBLIC_WS_URL (e.g. ws://localhost:8000/ws → http://localhost:8000). */
export function getBackendHttpBase(): string {
  const fromEnv = process.env.TRADING_BACKEND_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (!WS_URL) return "";
  return WS_URL.replace(/^ws/, "http").replace(/\/ws.*$/, "");
}
