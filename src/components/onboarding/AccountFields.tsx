"use client";

import { TextField, SelectField } from "./fields";
import { AGE_RANGES, COUNTRIES } from "./data";

export type AccountFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirm: string;
  ageRange: string;
  country: string;
};

type Props = {
  form: AccountFormValues;
  errors: Record<string, string>;
  onChange: <K extends keyof AccountFormValues>(key: K, value: AccountFormValues[K]) => void;
  /** Image 1 (Proof of Address): age spans full width. Image 2 (Launch): half width. */
  ageFullWidth?: boolean;
  showEmailHint?: boolean;
};

/**
 * Shared registration fields used in Proof of Address and Launch Platform.
 */
export function AccountFields({
  form,
  errors,
  onChange,
  ageFullWidth = false,
  showEmailHint = false,
}: Props) {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
      <TextField
        label="First name"
        required
        autoComplete="given-name"
        placeholder="Enter your first name"
        value={form.firstName}
        error={errors.firstName}
        onChange={(e) => onChange("firstName", e.target.value)}
      />
      <TextField
        label="Last name"
        required
        autoComplete="family-name"
        placeholder="Enter your last name"
        value={form.lastName}
        error={errors.lastName}
        onChange={(e) => onChange("lastName", e.target.value)}
      />
      <TextField
        className="sm:col-span-2"
        label="Email address"
        required
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        hint={showEmailHint ? "Must match the email used for the purchase." : undefined}
        value={form.email}
        error={errors.email}
        onChange={(e) => onChange("email", e.target.value)}
      />
      <TextField
        label="Password"
        required
        type="password"
        autoComplete="new-password"
        placeholder="Create a password"
        value={form.password}
        error={errors.password}
        onChange={(e) => onChange("password", e.target.value)}
      />
      <TextField
        label="Confirm password"
        required
        type="password"
        autoComplete="new-password"
        placeholder="Confirm your password"
        value={form.confirm}
        error={errors.confirm}
        onChange={(e) => onChange("confirm", e.target.value)}
      />
      <SelectField
        className={ageFullWidth ? "sm:col-span-2" : undefined}
        label="Age"
        required
        value={form.ageRange}
        error={errors.ageRange}
        onChange={(e) => onChange("ageRange", e.target.value)}
      >
        <option value="">Select your age range</option>
        {AGE_RANGES.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </SelectField>
      <SelectField
        className="sm:col-span-2"
        label="Country of residence"
        required
        value={form.country}
        error={errors.country}
        onChange={(e) => onChange("country", e.target.value)}
      >
        <option value="">Select your country</option>
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.name}
          </option>
        ))}
      </SelectField>
    </div>
  );
}
