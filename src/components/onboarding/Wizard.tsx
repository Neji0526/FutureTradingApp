"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { JourneySidebar } from "./JourneySidebar";
import { Section } from "./Section";
import { CheckboxField } from "./fields";
import { STEPS } from "./data";
import { IconCheck, IconLock } from "./icons";
import { AccountFields } from "./AccountFields";
import { LegalDocumentModal } from "./LegalDocumentModal";
import { TERMS_AND_PRIVACY, TRADING_RULES } from "./legal-content";
import { USE_MOCK_FEED } from "@/lib/constants";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = Record<string, string>;
type LegalDoc = "agreement" | "rules" | null;

interface Form {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirm: string;
  ageRange: string;
  country: string;
  acceptTerms: boolean;
  acceptRisk: boolean;
}

const EMPTY: Form = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirm: "",
  ageRange: "",
  country: "",
  acceptTerms: false,
  acceptRisk: false,
};

const HEADINGS = [
  { title: "Create your account", sub: "Set up your profile and trading preferences in minutes." },
  { title: "Verify your identity", sub: "Complete KYC so we can activate your account securely." },
  {
    title: "Fund & start trading",
    sub: "Pay your membership fee and receive your account credentials.",
  },
];

/**
 * Three-step purchase-gated registration wizard.
 *
 * Step 1 — Account Setup: account information + legal documents
 * Step 2 — Verification: identity + proof of address (profile fields)
 * Step 3 — Fund & Trade: payment confirmation + launch platform
 */
export function Wizard({ orderNumber }: { orderNumber: string }) {
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(1);
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [legalDoc, setLegalDoc] = useState<LegalDoc>(null);
  /** Step 3: user must open Launch Platform before Complete onboarding is enabled. */
  const [launchReviewed, setLaunchReviewed] = useState(false);
  const [identityReviewed, setIdentityReviewed] = useState(false);
  const [addressReviewed, setAddressReviewed] = useState(false);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => (e[k] ? { ...e, [k]: "" } : e));
  };

  const accountComplete = Boolean(
    form.firstName.trim().length >= 2 &&
      form.lastName.trim().length >= 2 &&
      EMAIL_RE.test(form.email) &&
      form.password.length >= 8 &&
      form.password === form.confirm &&
      form.ageRange &&
      form.country,
  );

  const complete: Record<string, boolean> = {
    account: accountComplete,
    documents: form.acceptTerms && form.acceptRisk,
    identity: accountComplete && identityReviewed,
    address: accountComplete && addressReviewed,
    payment: true,
    launch: accountComplete && launchReviewed,
  };

  function validateAccountFields(e: Errors) {
    if (form.firstName.trim().length < 2) e.firstName = "Enter your first name.";
    if (form.lastName.trim().length < 2) e.lastName = "Enter your last name.";
    if (!EMAIL_RE.test(form.email.trim())) e.email = "Enter a valid email address.";
    if (form.password.length < 8) e.password = "Use at least 8 characters.";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match.";
    if (!form.ageRange) e.ageRange = "Select your age range.";
    if (!form.country) e.country = "Select your country.";
  }

  function validate(): boolean {
    const e: Errors = {};

    if (step === 0) {
      validateAccountFields(e);
      if (!form.acceptTerms) e.acceptTerms = "You must accept the user agreement to continue.";
      if (!form.acceptRisk) e.acceptRisk = "You must confirm the trading rules to continue.";
    }

    if (step === 1) {
      validateAccountFields(e);
      if (!identityReviewed) e.identity = "Open Identity Documents and confirm your details.";
      if (!addressReviewed) e.address = "Open Proof of Address and confirm your details.";
    }

    if (step === 2) {
      validateAccountFields(e);
      if (!launchReviewed) e.launch = "Open Launch Platform and confirm your details.";
    }

    setErrors(e);

    if (Object.keys(e).length) {
      if (step === 0) {
        const docsOnly =
          (e.acceptTerms || e.acceptRisk) &&
          !e.firstName &&
          !e.lastName &&
          !e.email &&
          !e.password &&
          !e.confirm &&
          !e.ageRange &&
          !e.country;
        setOpen(docsOnly ? 2 : 1);
      } else if (step === 1) {
        setOpen(e.identity && !e.firstName ? 1 : e.address && !e.identity ? 2 : 1);
      } else {
        setOpen(2);
      }
      return false;
    }
    return true;
  }

  async function next() {
    if (!validate()) return;
    if (step !== STEPS.length - 1) {
      setStep((s) => s + 1);
      setOpen(1);
      return;
    }

    setSubmitError(null);
    setSubmitting(true);

    if (USE_MOCK_FEED) {
      setSubmitting(false);
      setDone(true);
      return;
    }

    try {
      const body = new FormData();
      body.set("orderNumber", orderNumber);
      body.set("email", form.email.trim());
      body.set("password", form.password);
      body.set("firstName", form.firstName.trim());
      body.set("lastName", form.lastName.trim());
      body.set("ageRange", form.ageRange);
      body.set("country", form.country);
      body.set("acceptTerms", String(form.acceptTerms));
      body.set("acceptRisk", String(form.acceptRisk));

      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        body,
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        if (res.status === 404) {
          setSubmitError(data.error ?? "Purchase not found. Please purchase a subscription.");
        } else {
          setSubmitError(data.error ?? "Could not complete onboarding.");
        }
        setSubmitting(false);
        return;
      }

      setDone(true);
    } catch {
      setSubmitError("Could not reach the server. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function back() {
    setErrors({});
    setStep((s) => Math.max(0, s - 1));
    setOpen(1);
  }

  const toggle = (n: number) => {
    if (step === 1 && n === 1) setIdentityReviewed(true);
    if (step === 1 && n === 2) setAddressReviewed(true);
    if (step === 2 && n === 2) setLaunchReviewed(true);
    setOpen((o) => (o === n ? 0 : n));
  };

  const canSubmitFinal = step !== STEPS.length - 1 || complete.launch;

  if (done) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--l-red)] p-4 text-white">
          <IconCheck />
        </span>
        <h1 className="mt-6 text-[clamp(1.6rem,4vw,2.2rem)] font-extrabold tracking-[-0.02em] text-[var(--l-ink)]">
          You&rsquo;re all set
        </h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-[var(--l-body)]">
          Order <span className="nums font-semibold text-[var(--l-ink)]">{orderNumber}</span> has been
          redeemed. Sign in with{" "}
          <span className="font-semibold text-[var(--l-ink)]">{form.email}</span>.
        </p>
        <Link
          href="/login"
          className="l-cta mt-8 inline-block rounded-xl px-7 py-3.5 text-[14px] font-bold"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  const heading = HEADINGS[step];

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr] lg:gap-12">
      <div className="lg:sticky lg:top-24 lg:self-start">
        <JourneySidebar
          current={step}
          onSelect={(index) => {
            if (index === step) return;
            setErrors({});
            setSubmitError(null);
            setStep(index);
            setOpen(1);
          }}
        />
      </div>

      <div>
        <p className="l-serif text-[15px] text-[var(--l-body)]">
          Step {step + 1} of {STEPS.length}
        </p>
        <h1 className="mt-1.5 text-[clamp(1.6rem,4vw,2.2rem)] leading-tight font-extrabold tracking-[-0.025em] text-[var(--l-ink)]">
          {heading.title}
        </h1>
        <p className="mt-2 text-[14px] text-[var(--l-body)]">{heading.sub}</p>

        <div className="mt-7 space-y-4">
          {step === 0 && (
            <>
              <Section
                index={1}
                title="Account information"
                complete={complete.account}
                open={open === 1}
                onToggle={() => toggle(1)}
              >
                <AccountFields form={form} errors={errors} onChange={set} ageFullWidth showEmailHint />
              </Section>

              <Section
                index={2}
                title="Documents"
                complete={complete.documents}
                open={open === 2}
                onToggle={() => toggle(2)}
              >
                <div className="space-y-4">
                  <ConsentBox error={errors.acceptTerms}>
                    <CheckboxField
                      checked={form.acceptTerms}
                      error={errors.acceptTerms}
                      onChange={(v) => {
                        if (!v) {
                          set("acceptTerms", false);
                          return;
                        }
                        if (!form.acceptTerms) {
                          setLegalDoc("agreement");
                          return;
                        }
                        set("acceptTerms", true);
                      }}
                      label={
                        <>
                          <span className="font-semibold text-[var(--l-ink)]">
                            User agreement
                            <span className="ml-1 text-[var(--l-red)]" aria-hidden>
                              *
                            </span>
                          </span>
                          <span className="mt-0.5 block text-[12.5px] text-[var(--l-body)]">
                            Click to read and confirm the{" "}
                            <button
                              type="button"
                              className="font-semibold text-[var(--l-ink)] underline decoration-[var(--l-line)] underline-offset-2 hover:decoration-[var(--l-ink)]"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setLegalDoc("agreement");
                              }}
                            >
                              user agreement
                            </button>
                            .
                          </span>
                        </>
                      }
                    />
                  </ConsentBox>

                  <ConsentBox error={errors.acceptRisk}>
                    <CheckboxField
                      checked={form.acceptRisk}
                      error={errors.acceptRisk}
                      onChange={(v) => {
                        if (!v) {
                          set("acceptRisk", false);
                          return;
                        }
                        if (!form.acceptRisk) {
                          setLegalDoc("rules");
                          return;
                        }
                        set("acceptRisk", true);
                      }}
                      label={
                        <>
                          <span className="font-semibold text-[var(--l-ink)]">
                            Trading rules
                            <span className="ml-1 text-[var(--l-red)]" aria-hidden>
                              *
                            </span>
                          </span>
                          <span className="mt-0.5 block text-[12.5px] text-[var(--l-body)]">
                            Click to confirm{" "}
                            <button
                              type="button"
                              className="font-semibold text-[var(--l-ink)] underline decoration-[var(--l-line)] underline-offset-2 hover:decoration-[var(--l-ink)]"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setLegalDoc("rules");
                              }}
                            >
                              the trading rules
                            </button>
                            .
                          </span>
                        </>
                      }
                    />
                  </ConsentBox>
                </div>
              </Section>
            </>
          )}

          {step === 1 && (
            <>
              <Section
                index={1}
                title="Identity Documents"
                complete={complete.identity}
                open={open === 1}
                onToggle={() => toggle(1)}
              >
                <AccountFields form={form} errors={errors} onChange={set} />
                {errors.identity && (
                  <p className="mt-4 text-[13.5px] font-medium text-[var(--l-red)]" role="alert">
                    {errors.identity}
                  </p>
                )}
              </Section>

              <Section
                index={2}
                title="Proof of Address"
                complete={complete.address}
                open={open === 2}
                onToggle={() => toggle(2)}
              >
                <AccountFields form={form} errors={errors} onChange={set} ageFullWidth />
                {errors.address && (
                  <p className="mt-4 text-[13.5px] font-medium text-[var(--l-red)]" role="alert">
                    {errors.address}
                  </p>
                )}
              </Section>
            </>
          )}

          {step === 2 && (
            <>
              <Section index={1} title="Payment" complete open={open === 1} onToggle={() => toggle(1)}>
                <div className="rounded-xl border border-[var(--l-line)] bg-[var(--l-paper-2)] p-5">
                  <p className="flex items-center gap-2 text-[12px] font-bold tracking-[0.1em] text-[var(--l-body)] uppercase">
                    <span className="h-3.5 w-3.5 text-[var(--l-blue-500)]">
                      <IconLock />
                    </span>
                    Purchase confirmed
                  </p>

                  <dl className="mt-4 space-y-3">
                    {(
                      [
                        ["Order number", orderNumber],
                        ["Billed to", form.email || "—"],
                        ["Status", "Paid"],
                      ] as const
                    ).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between gap-4">
                        <dt className="text-[13px] text-[var(--l-body)]">{k}</dt>
                        <dd className="nums text-[13px] font-bold text-[var(--l-ink)]">{v}</dd>
                      </div>
                    ))}
                  </dl>

                  <p className="mt-4 border-t border-[var(--l-line)] pt-4 text-[12.5px] leading-relaxed text-[var(--l-body)]">
                    Your membership fee was taken at checkout. Nothing further is charged here.
                  </p>
                </div>
              </Section>

              <Section
                index={2}
                title="Launch Platform"
                complete={complete.launch}
                open={open === 2}
                onToggle={() => toggle(2)}
              >
                <AccountFields form={form} errors={errors} onChange={set} ageFullWidth showEmailHint />
                {errors.launch && (
                  <p className="mt-4 text-[13.5px] font-medium text-[var(--l-red)]" role="alert">
                    {errors.launch}
                  </p>
                )}
              </Section>
            </>
          )}
        </div>

        {submitError && (
          <p className="mt-4 text-[13.5px] font-medium text-[var(--l-red)]" role="alert">
            {submitError}
          </p>
        )}

        <div className="mt-8 flex items-center justify-between gap-4 border-t border-[var(--l-line)] pt-7">
          <button
            type="button"
            onClick={back}
            disabled={step === 0 || submitting}
            className="rounded-lg border border-[var(--l-line)] px-5 py-2.5 text-[13.5px] font-semibold text-[var(--l-ink)] transition-colors hover:bg-[var(--l-paper-2)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Back
          </button>

          <button
            type="button"
            onClick={() => void next()}
            disabled={submitting || !canSubmitFinal}
            className="l-cta rounded-lg px-6 py-2.5 text-[13.5px] font-bold disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting
              ? "Working…"
              : step === STEPS.length - 1
                ? "Complete onboarding"
                : "Continue"}
          </button>
        </div>
      </div>

      <LegalDocumentModal
        open={legalDoc === "agreement"}
        title="User agreement"
        body={TERMS_AND_PRIVACY}
        onClose={() => setLegalDoc(null)}
        onAccept={() => {
          set("acceptTerms", true);
          setErrors((e) => (e.acceptTerms ? { ...e, acceptTerms: "" } : e));
          setLegalDoc(null);
        }}
      />

      <LegalDocumentModal
        open={legalDoc === "rules"}
        title="Trading rules"
        body={TRADING_RULES}
        onClose={() => setLegalDoc(null)}
        onAccept={() => {
          set("acceptRisk", true);
          setErrors((e) => (e.acceptRisk ? { ...e, acceptRisk: "" } : e));
          setLegalDoc(null);
        }}
      />
    </div>
  );
}

function ConsentBox({ children, error }: { children: ReactNode; error?: string }) {
  return (
    <div
      className={[
        "rounded-xl border px-4 py-3.5",
        error
          ? "border-[var(--l-red)]/40 bg-[var(--l-red)]/[0.03]"
          : "border-[var(--l-line)] bg-[#eef2f8]/70",
      ].join(" ")}
    >
      {children}
    </div>
  );
}
