"use client";

import { useEffect, useState } from "react";
import { useAdminStore } from "@/store/admin-store";
import type { RuleTemplate } from "@/lib/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Stat } from "@/components/ui/Stat";
import { cn, formatDateTime } from "@/lib/utils";


const PHASE_ORDER = ["Challenge Phase 1", "Challenge Phase 2", "Funded", "dxFeed"];


function formatAccountSize(n: number): string {
  if (n >= 1_000_000) return `$${n / 1_000_000}M`;
  if (n >= 1_000) return `$${n / 1_000}K`;
  return `$${n}`;
}

function money(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

/**
 * Read-only view of evaluation rule templates.
 * Limits are owned by Volumetrica / dxFeed Trading Rules and sync into the DB
 * via webhook — edits are not allowed from this CRM page.
 */
export default function RulesPage() {
  const getRuleTemplates = useAdminStore((s) => s.getRuleTemplates);
  const [templates, setTemplates] = useState<RuleTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void getRuleTemplates().then((data) => {
      setTemplates(data);
      setLoading(false);
    });
  }, [getRuleTemplates]);

  // Group by phase; include any extra phases from newly synced dxFeed rules.
  const phaseKeys = [
    ...PHASE_ORDER.filter((p) => templates.some((t) => t.phase === p)),
    ...Array.from(new Set(templates.map((t) => t.phase))).filter((p) => !PHASE_ORDER.includes(p)),
  ];
  const grouped = phaseKeys.map((phase) => ({
    phase,
    items: templates.filter((t) => t.phase === phase),
  }));

  const dxSynced = templates.filter((t) => t.source === "dxfeed").length;

  return (
    <div>
      <PageHeader
        title="Evaluation Rules"
        subtitle="Live tier limits from dxFeed / Volumetrica. View only — edit rules in Volumetrica Admin; they sync here automatically."
      />

      <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Account tiers" value={templates.length} />
        <Stat label="Challenge phases" value={2} />
        <Stat label="Funded tiers" value={templates.filter((t) => t.phase === "Funded").length} />
        <Stat
          label="Source"
          value={dxSynced > 0 ? `dxFeed (${dxSynced})` : "Awaiting sync"}
          tone={dxSynced > 0 ? "long" : "neutral"}
        />
      </div>

      <Card className="mb-4 border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted">
        Change Max DD, Daily DD, Profit Target, Universe, etc. in{" "}
        <span className="font-medium text-foreground">Volumetrica → Trading rules</span>
        {" "}(e.g. <code className="text-xs">PRIME_50K_EVAL</code>). Webhooks update{" "}
        <code className="text-xs">RuleTemplate</code> and cascade to every linked trader account.
        Enforcement stays on Vault OrderEngine / RiskEngine.
      </Card>

      {loading ? (
        <Card className="px-4 py-12 text-center text-sm text-muted">Loading templates…</Card>
      ) : (
        <div className="space-y-4">
          {grouped.map(({ phase, items }) => (
            <section key={phase}>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">{phase}</h2>
              <Card className="overflow-hidden divide-y divide-border">
                {items.length === 0 && (
                  <p className="px-4 py-6 text-sm text-muted-2">No templates for this phase.</p>
                )}
                {items.map((tpl) => (
                  <TemplateRow key={tpl.id} template={tpl} />
                ))}
              </Card>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function TemplateRow({ template }: { template: RuleTemplate }) {
  const [expanded, setExpanded] = useState(false);
  const fromDx = template.source === "dxfeed";

  return (
    <div>
      <button
        type="button"
        className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-surface-2"
        onClick={() => setExpanded((e) => !e)}
      >
        <span className={cn("text-xs transition-transform", expanded ? "rotate-90" : "")}>▶</span>
        <span className="font-semibold text-foreground">
          {template.id.startsWith("PRIME_") || template.id.includes("_")
            ? template.id
            : formatAccountSize(template.accountSize)}
        </span>
        <span className="hidden text-sm text-muted sm:inline">{formatAccountSize(template.accountSize)}</span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            fromDx ? "bg-long/15 text-long" : "bg-surface-3 text-muted",
          )}
        >
          {fromDx ? "dxFeed" : "seed"}
        </span>
        {template.externalReference && (
          <span className="hidden font-mono text-[11px] text-muted sm:inline">{template.externalReference}</span>
        )}
        <span className="ml-auto text-xs text-muted-2">{expanded ? "Hide" : "View limits"}</span>
      </button>

      {expanded && (
        <div className="border-t border-border/60 bg-surface-2/40 px-4 pb-4 pt-3">
          <p className="mb-3 text-xs text-muted">
            {template.label}
            {template.syncedAt
              ? ` · last synced ${formatDateTime(template.syncedAt)}`
              : " · not yet synced from dxFeed"}
          </p>

          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-2">Risk limits</h3>
          <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Fact label="Max daily loss" value={money(template.maxDailyLoss)} />
            <Fact label="Drawdown limit" value={money(template.maxDrawdown)} />
            <Fact label="Max risk / trade" value={template.maxRiskPerTrade > 0 ? money(template.maxRiskPerTrade) : "Off"} />
            <Fact label="Max position (mini-eq)" value={String(template.maxPositionUnits || template.maxContracts)} />
            <Fact label="Drawdown type" value={template.drawdownType === "EOD" ? "End-of-day" : "Intraday trailing"} />
          </div>

          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-2">Profit &amp; advancement</h3>
          <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Fact label="Profit target" value={template.profitTarget > 0 ? money(template.profitTarget) : "None"} />
            <Fact label="Min trading days" value={String(template.minTradingDays)} />
            <Fact label="Max daily contribution" value={`${template.maxDailyProfitPct}%`} />
            <Fact label="Max contracts (legacy)" value={String(template.maxContracts)} />
          </div>

          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-2">Hold &amp; prohibitions</h3>
          <div className="mb-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Fact label="Min hold (sec)" value={String(template.minHoldTimeSecs)} />
            <Fact label="SL + TP required" value={template.stopLossRequired ? "Yes" : "No"} />
            <Fact label="Overnight holds" value={template.overnightHoldsProhibited ? "Banned" : "Allowed"} />
            <Fact label="Weekend holds" value={template.weekendHoldsProhibited ? "Banned" : "Allowed"} />
          </div>

          <p className="mt-3 text-[11px] text-muted-2">
            Instruments:{" "}
            {template.allowedInstruments.length === 0
              ? "All allowed"
              : template.allowedInstruments.join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2">
      <div className="text-[11px] text-muted">{label}</div>
      <div className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">{value}</div>
    </div>
  );
}
