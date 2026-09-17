"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAdminStore } from "@/store/admin-store";
import { getWsClient } from "@/lib/ws-client";
import { USE_MOCK_FEED } from "@/lib/constants";
import type { OverallAnalytics } from "@/lib/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Stat } from "@/components/ui/Stat";
import { phaseColor } from "@/components/admin/PhaseBadge";
import { BarChart, DonutChart, LineChart } from "@/components/admin/charts";
import { formatCurrency, formatDateTime, cn } from "@/lib/utils";

const money = (v: number) => formatCurrency(v);

/**
 * Admin home at `/admin` — KPI strip + line/pie charts focused on live book risk.
 * Reuses the analytics API when available; falls back to CRM datasets in demo mode.
 */
export default function AdminDashboardPage() {
  const traders = useAdminStore((s) => s.traders);
  const accounts = useAdminStore((s) => s.accounts);
  const violations = useAdminStore((s) => s.violations);
  const activity = useAdminStore((s) => s.activity);
  const getAnalyticsOverall = useAdminStore((s) => s.getAnalyticsOverall);
  const getPendingReviews = useAdminStore((s) => s.getPendingReviews);
  const getAllPositions = useAdminStore((s) => s.getAllPositions);

  const [analytics, setAnalytics] = useState<OverallAnalytics | null>(null);
  const [pendingReviews, setPendingReviews] = useState(0);
  const [openPositions, setOpenPositions] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    const [overall, reviews, positions] = await Promise.all([
      getAnalyticsOverall(),
      getPendingReviews(),
      getAllPositions(),
    ]);
    setAnalytics(overall);
    setPendingReviews(reviews.length);
    setOpenPositions(positions.open.length);
    if (!silent) setLoading(false);
  }, [getAnalyticsOverall, getPendingReviews, getAllPositions]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (USE_MOCK_FEED) return;
    return getWsClient().onMessage((m) => {
      if (m.type === "admin_update") void load({ silent: true });
    });
  }, [load]);

  const kpis = useMemo(() => {
    const active = traders.filter((t) => t.status === "active").length;
    const suspended = traders.filter((t) => t.status === "suspended" || t.status === "closed").length;
    const totalEquity = traders.reduce((a, t) => a + (t.equity || 0), 0);
    const pnl30d = traders.reduce((a, t) => a + (t.pnl30d || 0), 0);
    const phaseCounts = [1, 2, 3, 4].map((p) => ({
      label: `Phase ${p}`,
      value: traders.filter((t) => (t.riskPhase ?? 1) === p).length,
    }));
    const statusCounts = [
      { label: "Active", value: traders.filter((t) => t.status === "active").length },
      { label: "Pending", value: traders.filter((t) => t.status === "pending").length },
      { label: "Suspended", value: traders.filter((t) => t.status === "suspended").length },
      { label: "Closed", value: traders.filter((t) => t.status === "closed").length },
    ].filter((d) => d.value > 0);
    const accountStatus = [
      { label: "Active", value: accounts.filter((a) => a.status === "active").length },
      { label: "Other", value: accounts.filter((a) => a.status !== "active").length },
    ].filter((d) => d.value > 0);

    // Activity sparkline: count events per day (last 14 calendar days).
    const days: { label: string; value: number }[] = [];
    const now = Date.now();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now - i * 86_400_000);
      const key = d.toISOString().slice(0, 10);
      const label = `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
      const value = activity.filter((e) => new Date(e.ts).toISOString().slice(0, 10) === key).length;
      days.push({ label, value });
    }

    return {
      active,
      suspended,
      totalEquity,
      pnl30d,
      phaseCounts,
      statusCounts,
      accountStatus,
      activityCurve: days,
      recentViolations: [...violations].sort((a, b) => b.ts - a.ts).slice(0, 6),
      recentActivity: [...activity].sort((a, b) => b.ts - a.ts).slice(0, 8),
      topTraders: [...traders].sort((a, b) => b.equity - a.equity).slice(0, 6),
    };
  }, [traders, accounts, violations, activity]);

  const shadowCurve = analytics?.shadowPnlCurve.map((d) => ({ label: d.day, value: d.value })) ?? [];
  const instruments = analytics?.mostTradedInstruments.map((i) => ({ label: i.symbol, value: i.n })) ?? [];
  const phasePnl = analytics?.byPhase.map((b, i) => ({
    label: b.label,
    value: b.avgPnl,
    sub: `n=${b.n}`,
    color: phaseColor(i + 1),
  })) ?? [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Dashboard"
        subtitle="Live overview of traders, risk phases, positions and book P&L."
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-6">
        <Stat label="Traders" value={traders.length} hint={`${kpis.active} active`} />
        <Stat label="Accounts" value={accounts.length} />
        <Stat label="Open positions" value={openPositions} />
        <Stat
          label="Pending reviews"
          value={pendingReviews}
          tone={pendingReviews > 0 ? "short" : "neutral"}
        />
        <Stat
          label="Book equity"
          value={money(kpis.totalEquity)}
          tone={kpis.totalEquity >= 0 ? "long" : "short"}
        />
        <Stat
          label="30d P&L"
          value={money(kpis.pnl30d)}
          tone={kpis.pnl30d >= 0 ? "long" : "short"}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <QuickLink href="/admin/traders" label="Traders" detail={`${kpis.active} active · ${kpis.suspended} held`} />
        <QuickLink href="/admin/reviews" label="Reviews" detail={`${pendingReviews} awaiting decision`} />
        <QuickLink href="/admin/positions" label="Positions" detail={`${openPositions} open`} />
        <QuickLink href="/admin/analytics" label="Deep analytics" detail="Phases · win rate · shadow P&L" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Section
          title="Shadow book P&L"
          hint="Cumulative P&L if we took the opposite side of every closed trade."
        >
          {shadowCurve.length > 1 ? (
            <LineChart data={shadowCurve} format={money} color="#f0b90b" height={200} />
          ) : kpis.activityCurve.some((d) => d.value > 0) ? (
            <LineChart data={kpis.activityCurve} format={(v) => String(v)} color="#3b82f6" height={200} />
          ) : (
            <EmptyChart loading={loading}>No time-series yet</EmptyChart>
          )}
          {!analytics && shadowCurve.length === 0 && (
            <p className="mt-2 text-[11px] text-muted">Showing CRM activity volume (last 14 days).</p>
          )}
        </Section>

        <Section title="Trader status mix" hint="Headcount by account status.">
          {kpis.statusCounts.length ? (
            <DonutChart data={kpis.statusCounts} size={170} />
          ) : (
            <EmptyChart loading={loading}>No traders</EmptyChart>
          )}
        </Section>

        <Section title="Risk-phase distribution" hint="Behavioural phase across all traders.">
          {kpis.phaseCounts.some((d) => d.value > 0) ? (
            <DonutChart
              data={kpis.phaseCounts.map((d, i) => ({
                ...d,
                // DonutChart uses palette; labels carry phase for legend clarity.
              }))}
              size={170}
            />
          ) : (
            <EmptyChart loading={loading}>No phase data</EmptyChart>
          )}
        </Section>

        <Section title="Most traded instruments" hint="Closed-trade count by symbol.">
          {instruments.length ? (
            <DonutChart data={instruments} size={170} />
          ) : kpis.accountStatus.length ? (
            <DonutChart data={kpis.accountStatus} size={170} />
          ) : (
            <EmptyChart loading={loading}>No instrument volume yet</EmptyChart>
          )}
        </Section>

        <Section
          title="Average P&L by risk phase"
          hint="Mean realized P&L of trades opened in each phase."
          className="lg:col-span-2"
        >
          {phasePnl.length ? (
            <BarChart data={phasePnl} format={money} height={190} />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {kpis.phaseCounts.map((d, i) => (
                <div key={d.label} className="rounded-lg border border-border bg-surface-2 px-3 py-3">
                  <div className="flex items-center gap-2 text-[11px] text-muted">
                    <span className="h-2 w-2 rounded-full" style={{ background: phaseColor(i + 1) }} />
                    {d.label}
                  </div>
                  <div className="mt-1 text-lg font-semibold tabular-nums text-foreground">{d.value}</div>
                  <div className="text-[10px] text-muted-2">traders</div>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="text-sm font-medium text-foreground">Top traders by equity</div>
            <Link href="/admin/traders" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="px-4 py-2 font-medium">Trader</th>
                <th className="px-4 py-2 font-medium">Phase</th>
                <th className="px-4 py-2 text-right font-medium">Equity</th>
                <th className="px-4 py-2 text-right font-medium">30d P&L</th>
              </tr>
            </thead>
            <tbody>
              {kpis.topTraders.map((t) => (
                <tr key={t.id} className="border-b border-border/60 hover:bg-surface-2">
                  <td className="px-4 py-2.5">
                    <Link href={`/admin/traders/${t.id}`} className="font-medium text-foreground hover:underline">
                      {t.name}
                    </Link>
                    <div className="text-[11px] text-muted">{t.email}</div>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted">P{t.riskPhase ?? 1}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{money(t.equity)}</td>
                  <td className={cn("px-4 py-2.5 text-right tabular-nums", t.pnl30d >= 0 ? "text-long" : "text-short")}>
                    {money(t.pnl30d)}
                  </td>
                </tr>
              ))}
              {kpis.topTraders.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-sm text-muted">No traders yet.</td></tr>
              )}
            </tbody>
          </table>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="text-sm font-medium text-foreground">Recent violations</div>
            <Link href="/admin/violations" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <ul className="divide-y divide-border/60">
            {kpis.recentViolations.map((v) => (
              <li key={v.id} className="flex items-start justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <Link href={`/admin/traders/${v.traderId}`} className="text-sm font-medium text-foreground hover:underline">
                    {v.traderName}
                  </Link>
                  <div className="truncate text-xs text-muted">
                    {v.type} · {v.action}{v.detail ? ` · ${v.detail}` : ""}
                  </div>
                </div>
                <div className="shrink-0 text-[11px] text-muted-2">{formatDateTime(v.ts)}</div>
              </li>
            ))}
            {kpis.recentViolations.length === 0 && (
              <li className="px-4 py-10 text-center text-sm text-muted">No violations recorded.</li>
            )}
          </ul>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="text-sm font-medium text-foreground">Recent activity</div>
          <Link href="/admin/activity" className="text-xs text-primary hover:underline">View all</Link>
        </div>
        <ul className="divide-y divide-border/60">
          {kpis.recentActivity.map((e) => (
            <li key={e.id} className="flex items-start justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <div className="text-sm text-foreground">{e.action}</div>
                <div className="text-[11px] text-muted">
                  {e.actor} · {e.target}{e.detail ? ` · ${e.detail}` : ""}
                </div>
              </div>
              <div className="shrink-0 text-[11px] text-muted-2">{formatDateTime(e.ts)}</div>
            </li>
          ))}
          {kpis.recentActivity.length === 0 && (
            <li className="px-4 py-10 text-center text-sm text-muted">No activity yet.</li>
          )}
        </ul>
      </Card>
    </div>
  );
}

function Section({
  title,
  hint,
  children,
  className,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("p-4", className)}>
      <div className="mb-3">
        <div className="text-sm font-medium text-foreground">{title}</div>
        {hint && <div className="text-xs text-muted">{hint}</div>}
      </div>
      {children}
    </Card>
  );
}

function QuickLink({ href, label, detail }: { href: string; label: string; detail: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-border bg-surface p-3 transition-colors hover:border-primary/40 hover:bg-surface-2"
    >
      <div className="text-sm font-semibold text-foreground">{label}</div>
      <div className="mt-0.5 text-[11px] text-muted">{detail}</div>
    </Link>
  );
}

function EmptyChart({ children, loading }: { children: React.ReactNode; loading?: boolean }) {
  return (
    <div className="flex h-[170px] items-center justify-center text-sm text-muted">
      {loading ? "Loading…" : children}
    </div>
  );
}
