"use client";

import { useCallback, useEffect, useState } from "react";
import { getAuthToken } from "@/store/auth-store";
import { WS_URL, USE_MOCK_FEED } from "@/lib/constants";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const API_BASE = WS_URL ? WS_URL.replace(/^ws/, "http").replace(/\/ws.*$/, "") : "";

type PlatformAccess = {
  ok?: boolean;
  ready?: boolean;
  platform?: string;
  downloadLink?: string | null;
  loginUrl?: string | null;
  username?: string | null;
  connectionServer?: string | null;
  note?: string;
  error?: string;
};

async function fetchPlatformAccess(): Promise<PlatformAccess | null> {
  const token = getAuthToken();
  if (!API_BASE || !token || USE_MOCK_FEED) return null;
  const res = await fetch(`${API_BASE}/api/platform-access`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  const data = (await res.json().catch(() => ({}))) as PlatformAccess;
  if (!res.ok) return { ready: false, error: data.error ?? "Could not load platform access." };
  return data;
}

/** Compact Deepchart download + one-time login (dashboard bottom-right). */
export function PlatformAccessCard() {
  const [access, setAccess] = useState<PlatformAccess | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginBusy, setLoginBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPlatformAccess();
      setAccess(data);
      if (data?.error) setError(data.error);
    } catch {
      setError("Could not reach platform access.");
      setAccess(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openOneTimeLogin = async () => {
    setLoginBusy(true);
    setError(null);
    try {
      const fresh = await fetchPlatformAccess();
      const url = fresh?.loginUrl?.trim();
      if (!url) {
        setError("Login link unavailable. Try again shortly.");
        if (fresh) setAccess(fresh);
        return;
      }
      setAccess(fresh);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      setError("Could not create login link.");
    } finally {
      setLoginBusy(false);
    }
  };

  const platform = access?.platform ?? "Deepchart";
  const downloadLink = access?.downloadLink?.trim() || "";
  const showCard = !USE_MOCK_FEED && API_BASE;

  if (!showCard) return null;

  return (
    <Card className="overflow-hidden">
      <CardBody className="space-y-3 p-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground">{platform}</h3>
          <p className="mt-0.5 text-xs text-muted">Download app · one-time sign-in</p>
          {access?.connectionServer ? (
            <p className="mt-1 text-[11px] text-muted truncate">
              Server · {access.connectionServer}
            </p>
          ) : null}
          {error ? <p className="mt-1 text-[11px] text-short">{error}</p> : null}
          {!loading && access && !access.ready && !error ? (
            <p className="mt-1 text-[11px] text-muted">Available after market data agreement.</p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {downloadLink ? (
            <a href={downloadLink} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1">
              <Button variant="secondary" size="sm" className="w-full" disabled={loading}>
                Download
              </Button>
            </a>
          ) : (
            <Button variant="secondary" size="sm" className="min-w-0 flex-1" disabled loading={loading}>
              Download
            </Button>
          )}
          <Button
            size="sm"
            className="min-w-0 flex-1"
            onClick={() => void openOneTimeLogin()}
            disabled={loading}
            loading={loginBusy}
          >
            One-time login
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
