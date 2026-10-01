import type { GroupIcon, TopicIcon } from "./icons";

/**
 * Rules content.
 *
 * Figures match dxFeed PRIME_50K_* RuleTemplate rows.
 * Live per-account limits come from Rule rows cascaded when
 * FutureTradingBackend syncs Volumetrica Trading Rules via REST (V2 List).
 */

export interface Fact {
  label: string;
  value: string;
}

export interface Topic {
  id: string;
  title: string;
  icon: TopicIcon;
  body?: string;
  facts?: Fact[];
  /** Bullet points shown under the body (or on their own when there is none). */
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
        points: [
          "The Vault is operated by Nextgen Solutions Management FZCO (IFZA licence, registration number 42451), Dubai, United Arab Emirates.",
          "All trading in the program is simulated. No order you place is routed to a live market, you never deposit trading capital, and the Company does not hold client money.",
          "These Trading Rules form part of the User Agreement, together with the Risk Disclosure, Privacy Policy, Payout Policy and Website Terms of Use.",
          "You hold one single account that moves through two stages: the qualification stage (the 2-step challenge) and the funded stage, which is eligible for payouts.",
          "Amounts you pay are subscription fees for access to the services, not deposits, margin or capital. They are non-refundable except where the law requires otherwise.",
          "You are responsible for keeping up to date with the current version of these rules. If anything is unclear, contact support before placing your first trade.",
        ],
      },
      {
        id: "definitions",
        title: "Definitions & How Everything Is Calculated",
        icon: "calculator",
        points: [
          "Profit target: a percentage of the starting account balance ($1,500 / 3% in Phase 1, $3,000 / 6% in Phase 2 on a $50K account).",
          "Trailing drawdown (evaluation): measured intraday — $2,000 in Phase 1 and $1,500 in Phase 2.",
          "EOD trailing drawdown (funded): 3% of max balance, measured against the highest end-of-day balance achieved.",
          "Daily loss limit: $1,000 in the evaluation; 2% of the starting balance on funded accounts. It resets at the start of each trading day.",
          "Max risk per trade: $500 (1%) in the evaluation; 0.5% of the starting balance on funded accounts, including all correlated positions combined.",
          "Two-violation rule: exceeding the daily loss limit or the max risk per trade a second time (2x) is a hard breach and fails the challenge.",
          "Max single-day profit contribution: 30% of the phase target in the evaluation ($450 / $900); on funded accounts, no single day may contribute more than 20% of the total profit toward a payout.",
          "Qualifying day: a trading day with net realised profit at or above the tier minimum ($300 / $600 / $1,500 / $3,000 / $6,000). Qualifying days are counted independently of cumulative profit — reaching the profit target does not waive the qualifying-day requirement.",
          "All values are displayed in USD unless otherwise stated.",
        ],
      },
      {
        id: "eligibility",
        title: "Eligibility & Account Ownership",
        icon: "userCheck",
        points: [
          "You must be at least 18 years old, or older where your jurisdiction sets a higher age for entering a binding contract.",
          "You must not have been convicted of any offence involving fraud, dishonesty, theft, money laundering or dealings in financial instruments, and must not be subject to disciplinary or enforcement action by a financial regulator.",
          "You must not be located in, resident in, or a national of a comprehensively sanctioned country, and must not appear on any sanctions or restricted party list.",
          "One account per user. You may not hold or control a second account in your own name, through an entity, or through another person. Accounts may be linked by name, address, payment method, IP address, device fingerprint, banking details or trading pattern.",
          "You must register with your own legal name and accurate details, and keep them current within 7 days of any change. Entity registrations must nominate one natural person holding at least 80% of the shares.",
          "Accounts, balances, positions and history are the property of the Company. Credentials may not be shared, sold, lent or transferred, and you are responsible for everything that happens in your account.",
          "The Company may verify your identity, address, source of funds and payment methods at any time, and may suspend the account or withhold a payout while verification is outstanding.",
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
        points: [
          "Phase 1 ($50K): profit target $1,500 (3%), trailing drawdown $2,000 intraday, daily loss limit $1,000.",
          "Phase 2 ($50K): profit target $3,000 (6%), trailing drawdown $1,500 intraday, daily loss limit $1,000.",
          "Minimum trading days: 5 in each phase.",
          "Max single-day profit contribution: 30% of the target — $450 in Phase 1, $900 in Phase 2.",
          "Max position size: 3 minis / 30 micros in total, in both phases.",
          "Max risk per trade: $500 (1%). Minimum hold time: 30 seconds. A stop loss is required on all orders.",
          "Prohibited in both phases: overnight holds, weekend holds, news trading (2 minutes before / 5 minutes after major releases), copy trading, automated systems, martingale and averaging down.",
          "Every order must be entered manually. Alerts, signals, charting and platform-native stop-loss/take-profit orders are permitted; automated or semi-automated order entry is not.",
        ],
      },
      {
        id: "drawdown",
        title: "Drawdown & Risk Limits",
        icon: "alert",
        points: [
          "Evaluation: trailing drawdown of $2,000 intraday in Phase 1 and $1,500 intraday in Phase 2, with a $1,000 daily loss limit in both phases.",
          "Funded accounts: EOD trailing drawdown of 3% of max balance and a daily loss limit of 2%.",
          "Funded drawdown by tier — $50K: $1,500 · $100K: $3,000 · $250K: $7,500 · $500K: $15,000 · $1M: $30,000.",
          "Funded daily loss by tier — $50K: $1,000 · $100K: $2,000 · $250K: $5,000 · $500K: $10,000 · $1M: $20,000.",
          "Max risk per trade: $500 (1%) in the evaluation, 0.5% of the starting balance on funded accounts. By tier: $250 / $500 / $1,250 / $2,500 / $5,000.",
          "Two-violation rule: a second breach (2x) of the daily loss limit or the max risk per trade becomes a hard breach and fails the account.",
          "On funded accounts, position size variance is capped at 3x the previous session, and a stop loss is required on every order.",
          "Breaching the drawdown is a hard breach and closes the account immediately.",
        ],
      },
      {
        id: "instruments",
        title: "Instruments & Trading Hours",
        icon: "globe",
        points: [
          "Tradable instruments: ES/MES, NQ/MNQ, GC/MGC, CL/MCL, YM/MYM, 6E/M6E and ZB. No other instruments may be traded.",
          "Max position size in the evaluation: 3 minis / 30 micros in total.",
          "Max position size on funded accounts — $50K: 5 minis / 50 micros · $100K: 8 / 80 · $250K: 15 / 150 · $500K: 20 / 200 · $1M: 30 / 300.",
          "No overnight holds and no weekend holds. On funded accounts, any position not closed by 4:55pm ET is auto-closed.",
          "News trading is prohibited from 2 minutes before until 5 minutes after major releases. Orders placed inside a news window are blocked at entry.",
        ],
      },
      {
        id: "funded-rules",
        title: "Funded Account Rules",
        icon: "wallet",
        points: [
          "EOD trailing drawdown of 3% of max balance, a daily loss limit of 2%, and max risk per trade of 0.5%.",
          "Position size variance is capped at 3x the previous session, and a stop loss is required on every order.",
          "The same behavioural prohibitions as the evaluation apply, plus spoofing and wash trading, coordinated trading across accounts, and trading on behalf of third parties.",
          "Positions not closed by 4:55pm ET are auto-closed automatically.",
          "Payout target by tier — $50K: $5,000 · $100K: $10,000 · $250K: $25,000 · $500K: $50,000 · $1M: $100,000.",
          "A funded account that breaches a funded-stage limit reverts to the qualification stage in accordance with these rules.",
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
        points: [
          "Overnight holds, weekend holds and news trading (2 minutes before / 5 minutes after major releases).",
          "Copy trading, mirroring, signal replication, automated or semi-automated order entry, martingale and averaging down.",
          "On funded accounts also: spoofing, wash trading, coordinated trading across accounts, and trading on behalf of third parties.",
          "Holding or controlling more than one account, sharing or selling account access, or trading another person's account.",
          "Using a payment method that is not your own, requesting a payout to an account not in your name, or initiating a chargeback in bad faith.",
          "Using a VPN, proxy, virtual machine or remote desktop to conceal your identity, device or location, or to evade any restriction.",
          "Exploiting errors, latency, pricing anomalies, platform defects or data feed failures, or tampering with the platform, trade records or communications.",
          "Submitting false or misleading information, or using the services in a way that seeks to game or undermine the purpose of the program.",
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
        points: [
          "The ladder runs $50K → $100K → $250K → $500K → $1M, then a fresh 10% cycle at $1M.",
          "When a payout triggers, the full 10% is paid, the account closes, and the next tier opens immediately.",
          "Your balance can never drop below the starting balance after a payout.",
          "Risk parameters scale with the tier: drawdown, daily loss, position size, max risk per trade and payout target all move to the new tier's values.",
          "Your account remains a single account at every level of the ladder. Advancing does not create an additional account.",
        ],
      },
      {
        id: "payouts",
        title: "Payouts & Profit Split",
        icon: "banknote",
        points: [
          "A payout triggers when all of these conditions are met at the same time:",
          "Cumulative profit reaches 10% of the starting balance;",
          "No single day contributed more than 20% of total profit;",
          "15 qualifying days at or above the tier minimum ($300 / $600 / $1,500 / $3,000 / $6,000);",
          "No active hard breach; and every counted trade had a stop loss at entry.",
          "A qualifying day is assessed independently of cumulative profit — qualifying days are counted regardless of the account's total P&L, and reaching the profit target does not waive the qualifying-day requirement.",
          "On trigger, the full 10% is paid automatically the same day, the account closes and the next tier opens immediately.",
          "The standard profit split is 100% of eligible profit — you keep everything you make.",
          "Payouts are conditional on your account being in good standing, completed identity verification, payment to an account in your own name, and all subscription fees for the relevant period being paid with no chargeback.",
          "The Company may withhold, reduce, delay or forfeit a payout where it reasonably suspects a breach, verification is incomplete, an audit is outstanding, a chargeback has been initiated, or the law requires it.",
          "Payouts are personal to you and are not transferable or assignable.",
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
        points: [
          "Blocked at order entry, with no breach recorded: max risk per trade, max position size, missing stop loss, and orders inside a news window. The platform suggests the compliant micro size with one-click accept.",
          "Hard breach, immediate: drawdown and every behavioural rule. The daily loss limit and max risk per trade become a hard breach after two violations (2x).",
          "On a hard breach the account is permanently closed, 100% of profits are forfeited, fees are non-refundable, and you may start a new evaluation.",
          "For breaches of the User Agreement the Company may also withhold or forfeit unpaid payouts, require repayment of payouts already made, remove simulated profits or trading days, restrict position size or instruments, suspend or close the account, ban you permanently, or refer the matter to law enforcement.",
          "The Company acts proportionately and, where practicable, will tell you which rule it considers breached and give you a chance to respond — unless it reasonably suspects fraud or immediate action is needed.",
          "The Company may audit your account at any time and require written explanations, screenshots, screen recordings, your platform configuration or an observed live session. You must respond within 72 hours.",
        ],
      },
      {
        id: "resets",
        title: "Resets, Retries & Subscription",
        icon: "refresh",
        points: [
          "Unlimited free resets while your subscription is active, with a 48-hour gate between resets.",
          "A reset returns your account to the starting balance and rules without changing your account size, and no progress carries over from the previous attempt.",
          "Breaching a qualification-stage limit resets the account — you attempt qualification again without opening a new account and without any fee beyond your ongoing subscription.",
          "Access is provided on a subscription basis and renews automatically each billing period at the rate agreed at purchase until you cancel.",
          "All fees are non-refundable and are not prorated. No refund is due because you did not trade, traded poorly, breached the rules, cancelled mid-period, or were dissatisfied.",
          "You may cancel at any time in your dashboard; cancellation takes effect at the end of the current billing period and the account cannot be reinstated afterwards.",
          "You may only pay from a card or bank account in your own name. Payment from a source that is not yours may lead to forfeiture of payouts, account closure and a permanent ban.",
        ],
      },
      {
        id: "inactivity",
        title: "Account Inactivity & Closure",
        icon: "userX",
        points: [
          "A funded account is inactive if, in any rolling 30-day period, it does not record at least two trading days with simulated profit of at least USD 50.",
          "An inactive account may be returned to the qualification stage or closed on 14 days' notice.",
          "Where an inactive account is closed, any unpaid payout that had already met all conditions at the date of the notice remains payable; any other pending amount is forfeited.",
          "You may terminate at any time by cancelling your subscription and ceasing to use the services.",
          "The Company may close an account immediately for material breach or suspected fraud, or on 30 days' notice for any other reason, and may suspend an account while an audit, verification or chargeback is unresolved.",
          "Closure decisions are communicated via email and dashboard notification.",
        ],
      },
      {
        id: "platform",
        title: "Platform, Data & Execution",
        icon: "monitor",
        points: [
          "All activity takes place in a simulated environment; no order is routed to live markets and no trade is executed against live market liquidity.",
          "Simulated trading carries no financial risk and may not reflect the liquidity, slippage, fill quality or execution costs of live markets.",
          "The services are provided \"as is\" and \"as available\". The Company does not warrant that they will be uninterrupted or error-free, or that third-party data or platforms will be accurate or available.",
          "Traders are responsible for verifying fills and reporting execution issues promptly, and must retain their own trade records for at least 90 days without alteration.",
          "The Company is not liable for delay, failure or interruption caused by technical malfunction, outage, connectivity failure, maintenance or third-party provider failure.",
          "All data generated by your use of the program belongs to the Company and may be used for risk management, product development, research and analytics.",
        ],
      },
      {
        id: "support",
        title: "Support & Disputes",
        icon: "headset",
        points: [
          "For rule clarifications, contact our support team through your dashboard or at support@enterthevault.co.",
          "Where the Company withholds a payout or takes enforcement action, it will tell you why and what is required to resolve the position, unless prohibited or where it reasonably suspects fraud.",
          "Disputes must first be raised with support and escalated through the Company's escalation process before any formal proceedings.",
          "This Agreement is governed by the laws of the United Arab Emirates as applied in the Emirate of Dubai.",
          "Initiating a chargeback or payment dispute in respect of amounts properly owed is a material breach and may lead to suspension, invoicing for the disputed amount and related costs, and reversal of related payouts.",
        ],
      },
      {
        id: "amendments",
        title: "Amendments & Version History",
        icon: "history",
        points: [
          "The Company may amend these Trading Rules. Amendments take effect when published, unless stated otherwise.",
          "Where an amendment materially disadvantages existing users, at least 14 days' notice is given before it takes effect, unless a shorter period is needed to protect the integrity of the program or comply with law.",
          "Material changes to the User Agreement take effect 14 days after notice; other changes take effect on publication.",
          "Notice of material changes is given by email or through your dashboard. Continued use after the effective date constitutes acceptance.",
          "You are responsible for knowing the current rules. The current version is always available on this page.",
          "User Agreement last updated: 31 July 2026.",
        ],
      },
    ],
  },
];
