"use client";

import { useCallback, useEffect, useState } from "react";
import { getAuthToken } from "@/store/auth-store";
import { WS_URL, USE_MOCK_FEED } from "@/lib/constants";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
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
      // Always mint a fresh SSO link — LoginUrl is short-lived.
      const fresh = await fetchPlatformAccess();
      const url = fresh?.loginUrl?.trim();
      if (!url) {
        setError("One-time login is not available yet. Try again in a moment.");
        if (fresh) setAccess(fresh);
        return;
      }
      setAccess(fresh);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      setError("Could not create a one-time login link.");
    } finally {
      setLoginBusy(false);
    }
  };

  const platform = access?.platform ?? "Deepchart";
  const downloadLink = access?.downloadLink?.trim() || "";
  const showCard = !USE_MOCK_FEED && API_BASE;

  if (!showCard) return null;

  return (
    <Card className="mt-4 overflow-hidden">
      <CardHeader
        title={`${platform} platform`}
        subtitle="Download the desktop app, then use a one-time link to sign in."
      />
      <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-sm text-foreground">
            Install {platform} on your computer, then open the one-time login to access your license.
          </p>
          {access?.username ? (
            <p className="text-xs text-muted truncate">
              Platform user · <span className="text-foreground/80">{access.username}</span>
            </p>
          ) : null}
          {access?.connectionServer ? (
            <p className="text-xs text-muted">
              dxFeed connection server ·{" "}
              <span className="font-medium text-foreground/80">{access.connectionServer}</span>
            </p>
          ) : null}
          {error ? <p className="text-xs text-short">{error}</p> : null}
          {!loading && access && !access.ready && !error ? (
            <p className="text-xs text-muted">
              Platform access will appear here after your market data agreement is complete.
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {downloadLink ? (
            <a href={downloadLink} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" disabled={loading}>
                Download {platform}
              </Button>
            </a>
          ) : (
            <Button variant="secondary" disabled loading={loading}>
              Download {platform}
            </Button>
          )}
          <Button
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
