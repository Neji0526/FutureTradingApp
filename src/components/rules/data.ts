import type { GroupIcon, TopicIcon } from "./icons";

/**
 * Rules content.
 *
 * Figures match the Vault Trading Rules doc and seeded RuleTemplate rows.
 * Live per-account limits come from Rule rows cascaded when dxFeed Admin
 * syncs Trading Rules via webhook (FutureTradingBackend).
 */

export interface Fact {
  label: string;
  value: string;
}

export interface Topic {
  id: string;
  title: string;
  icon: TopicIcon;
  body: string;
  facts?: Fact[];
  /** Extra bullet points shown under the body. */
  points?: string[];
}

export interface Group {
  id: string;
  title: string;
  icon: GroupIcon;
  topics: Topic[];
}

export const GROUPS: Group[] = [
  {
    id: "before-you-start",
    title: "Before you start",
    icon: "book",
    topics: [
      {
        id: "overview",
        title: "Overview",
        icon: "doc",
        body:
          "The Vault funds futures traders. You buy one evaluation, prove you can trade within a fixed set of limits, and we put our capital behind you. There is no subscription, no profit split, and no cap on how many times you may try.",
        points: [
          "Buy an evaluation once — resets after that are free and unlimited.",
          "Clear two phases without breaking a limit.",
          "Trade a funded account and keep 100% of what you make.",
          "Every 10% doubles your allocation, up to $1,000,000.",
        ],
      },
      {
        id: "definitions",
        title: "Definitions & How Everything Is Calculated",
        icon: "calculator",
        body:
          "Every limit below is derived from your starting balance, never from your current equity. Drawing down does not lower your target, and profit does not raise it. Read this section first — most disputes come from assuming a different basis.",
        facts: [
          { label: "Starting balance", value: "The account size you bought" },
          { label: "Equity", value: "Balance plus open position P&L" },
          { label: "Profit target", value: "% of starting balance" },
          { label: "Daily loss", value: "Measured from the session open" },
          { label: "Trading day", value: "A day on which a position was opened" },
        ],
      },
      {
        id: "eligibility",
        title: "Eligibility & Account Ownership",
        icon: "userCheck",
        body:
          "Accounts are personal. The person who passes the evaluation must be the person who trades the funded account, and identity is verified before funding is released.",
        facts: [
          { label: "Minimum age", value: "18" },
          { label: "Accounts per purchase", value: "1" },
          { label: "Verification", value: "Photo ID + proof of address" },
        ],
        points: [
          "One account per person. Multiple accounts held by one trader are closed.",
          "Accounts may not be sold, shared, transferred or traded by anyone else.",
          "The registration email must match the email that made the purchase.",
        ],
      },
    ],
  },

  {
    id: "trading-rules",
    title: "Trading rules",
    icon: "scales",
    topics: [
      {
        id: "evaluation",
        title: "Evaluation: 2-Step Challenge",
        icon: "shieldCheck",
        body:
          "Two phases, both measured against your starting balance. Passing Phase 1 does not relax the rules — Phase 2 asks for more profit against a tighter drawdown. There is no time limit on either phase.",
        facts: [
          { label: "Phase 1 target", value: "$1,500 (3%) on $50K" },
          { label: "Phase 2 target", value: "$3,000 (6%) on $50K" },
          { label: "Minimum winning days", value: "5 per phase" },
          { label: "Max single-day profit", value: "30% of target" },
          { label: "Time limit", value: "None" },
        ],
      },
      {
        id: "drawdown",
        title: "Drawdown & Risk Limits",
        icon: "alert",
        body:
          "During an evaluation the drawdown trails your highest equity intraday: it rises with your gains and never falls back. On a funded account it becomes an end-of-day floor at 3% of starting balance, recalculated once at the session close.",
        facts: [
          { label: "Phase 1 drawdown", value: "$2,000 — intraday trailing" },
          { label: "Phase 2 drawdown", value: "$1,500 — intraday trailing" },
          { label: "Funded drawdown", value: "3% — end-of-day trailing" },
          { label: "Daily loss (eval $50K)", value: "$1,000" },
          { label: "Daily loss (funded)", value: "2% of starting balance" },
          { label: "Max risk / trade (eval)", value: "1% ($500 on $50K)" },
          { label: "Max risk / trade (funded)", value: "0.5% of starting balance" },
          { label: "Minimum hold", value: "30 seconds" },
        ],
        points: [
          "A stop-loss is required on every order; orders without one are rejected.",
          "Breaching the maximum drawdown ends the evaluation.",
          "Reaching the daily loss limit ends the session only — the account survives on evaluation.",
        ],
      },
      {
        id: "instruments",
        title: "Instruments & Trading Hours",
        icon: "globe",
        body:
          "CME futures only, priced from a live Databento feed. You may trade the full session, but every position must be closed before it ends — the platform flattens anything still open.",
        facts: [
          { label: "Equity index", value: "ES · NQ · YM · 6E (+ Micros)" },
          { label: "Energy", value: "CL (+ MCL)" },
          { label: "Metals", value: "GC (+ MGC)" },
          { label: "Rates", value: "ZB" },
          { label: "Overnight holds", value: "Not permitted" },
          { label: "Weekend holds", value: "Not permitted" },
          { label: "Session flatten", value: "4:59pm ET" },
        ],
      },
      {
        id: "funded-rules",
        title: "Funded Account Rules",
        icon: "wallet",
        body:
          "Once funded, payout triggers when cumulative profit reaches 10% of starting balance, with consistency and qualifying-day requirements. The drawdown switches to an end-of-day floor and contract ceilings scale with the tier.",
        facts: [
          { label: "Payout target", value: "10% of starting balance" },
          { label: "Qualifying days", value: "15 at ≥ 0.6% of balance" },
          { label: "Consistency", value: "No day > 20% of total profit" },
          { label: "$50K contracts", value: "5 minis / 50 micros" },
          { label: "$1M contracts", value: "30 minis / 300 micros" },
        ],
      },
      {
        id: "manual-execution",
        title: "Manual Execution",
        icon: "monitor",
        body:
          "Every order must be entered by you, deliberately, for that order. You personally submit and confirm each open, modify, or close. Tools that only alert or chart are fine — tools that place orders for you are not.",
        points: [
          "Allowed: alerts and signals that do not place orders; native stop-loss / take-profit you set yourself; charting and journalling tools.",
          "Not allowed: bots, scripts, macros, expert advisors, or any system that submits orders without your real-time decision.",
          "Not allowed: copy trading, mirroring, or signal replication into or out of your account.",
          "Not allowed: anyone else placing or deciding orders in your account.",
        ],
      },
      {
        id: "prohibited",
        title: "Prohibited Practices",
        icon: "ban",
        body:
          "These limits assume you take genuine market risk. The following exploit the program rather than pass it, and can void profits or close the account.",
        points: [
          "News trading inside 2 minutes before / 5 minutes after major releases.",
          "Overnight holds, weekend holds, martingale and averaging down.",
          "Latency arbitrage, or trading that depends on feed errors, pricing anomalies, or platform defects.",
          "Copy trading, mirroring, or coordinating positions across accounts.",
          "Spoofing, wash trading, or trading on behalf of third parties.",
          "Sharing, selling, or letting someone else trade your account.",
        ],
      },
    ],
  },

  {
    id: "getting-paid",
    title: "Getting paid",
    icon: "card",
    topics: [
      {
        id: "scaling",
        title: "Scaling Plan",
        icon: "trendUp",
        body:
          "Each time you reach the 10% target on a funded account your allocation doubles. There is no application, no interview and no renegotiation — it happens on the payout.",
        facts: [
          { label: "Step 1", value: "$50,000" },
          { label: "Step 2", value: "$100,000" },
          { label: "Step 3", value: "$250,000" },
          { label: "Step 4", value: "$500,000" },
          { label: "Maximum", value: "$1,000,000" },
        ],
      },
      {
        id: "payouts",
        title: "Payouts & Profit Split",
        icon: "banknote",
        body:
          "You keep everything you make. We do not take a percentage, and we do not charge for withdrawing. Request from your account page once you have hit the target and met the minimum trading days.",
        facts: [
          { label: "Your share", value: "100%" },
          { label: "Processing time", value: "Within 24 hours" },
          { label: "Minimum tenure", value: "None" },
          { label: "Withdrawal fee", value: "None" },
        ],
      },
    ],
  },

  {
    id: "enforcement",
    title: "Enforcement & operations",
    icon: "shield",
    topics: [
      {
        id: "breach",
        title: "Breach System & Enforcement",
        icon: "shield",
        body:
          "Limits are enforced by the platform, not reviewed afterwards. Contract ceilings, risk per position and the stop-loss requirement are checked before an order leaves the ticket, so a non-compliant order is rejected rather than filled and unwound later.",
        facts: [
          { label: "Soft block (no breach)", value: "Max risk, size, missing SL, news window" },
          { label: "Hard breach", value: "Drawdown, daily loss, behavioural rules" },
          { label: "Single-day cap (eval)", value: "30% of profit target" },
          { label: "Consistency (funded)", value: "20% of total profit" },
        ],
        points: [
          "A hard breach ends the account immediately; profits are forfeited.",
          "Soft blocks reject the order at entry — no breach is recorded.",
          "You are always told which rule was hit and the figure that triggered it.",
        ],
      },
      {
        id: "resets",
        title: "Resets, Retries & Subscription",
        icon: "refresh",
        body:
          "We do not make money from selling you another attempt, so resets are free and unlimited while subscribed, with a 48-hour gate between resets. There is no monthly fee and nothing recurring to cancel.",
        facts: [
          { label: "Evaluation fee", value: "One-time" },
          { label: "Resets", value: "Unlimited, free (48h gate)" },
          { label: "Subscription", value: "None" },
        ],
      },
      {
        id: "inactivity",
        title: "Account Inactivity & Closure",
        icon: "userX",
        body:
          "Accounts are expected to be traded. An account with no activity for an extended period is closed to free the allocation, and you are notified before that happens.",
        facts: [
          { label: "Inactivity window", value: "30 days without a trade" },
          { label: "Notice", value: "Emailed before closure" },
          { label: "Pending payouts", value: "Always paid before closure" },
        ],
      },
      {
        id: "platform",
        title: "Platform, Data & Execution",
        icon: "monitor",
        body:
          "Trading runs through our web terminal on live market data. If the platform or the feed fails during a session, affected trades are reviewed and any rule breach caused by the outage is reversed.",
        facts: [
          { label: "Platform", value: "Web terminal" },
          { label: "Market data", value: "Live feed" },
          { label: "Outage breaches", value: "Reviewed and reversed" },
        ],
      },
      {
        id: "support",
        title: "Support & Disputes",
        icon: "headset",
        body:
          "If you believe a fill, a breach or a payout was handled incorrectly, raise it and we will review the underlying tick data with you. Decisions are explained with the figures behind them.",
        facts: [
          { label: "First response", value: "Within one business day" },
          { label: "Trade review", value: "Against recorded tick data" },
          { label: "Escalation", value: "To the risk desk" },
        ],
      },
      {
        id: "amendments",
        title: "Amendments & Version History",
        icon: "history",
        body:
          "Rules change as the product matures. Changes are versioned and dated, and anything that tightens a limit takes effect only for accounts opened after it — an account already in progress finishes under the rules it started on.",
        facts: [
          { label: "Notice period", value: "14 days for tightened limits" },
          { label: "In-progress accounts", value: "Finish on their original rules" },
          { label: "History", value: "Published with each change" },
        ],
      },
    ],
  },
];
