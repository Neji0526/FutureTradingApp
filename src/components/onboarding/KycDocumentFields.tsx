"use client";

import { FileField, SelectField } from "./fields";
import { ADDRESS_PROOF_TYPES, ID_DOCUMENT_TYPES } from "./data";

export type KycDocs = {
  idType: string;
  addressType: string;
  idFile?: File;
  addressFile?: File;
};

type Props = {
  docs: KycDocs;
  errors: Record<string, string>;
  onChange: (patch: Partial<KycDocs>) => void;
  onError: (key: string, message: string) => void;
  /** Which section to render. */
  section: "identity" | "address";
};

/** KYC uploads for the Verification step — identity or proof of address. */
export function KycDocumentFields({ docs, errors, onChange, onError, section }: Props) {
  if (section === "identity") {
    return (
      <div className="space-y-5">
        <p className="text-[13px] leading-relaxed text-[var(--l-body)]">
          Upload a government-issued photo ID. The name should match the account you
          created in the previous step.
        </p>
        <SelectField
          label="Document type"
          required
          value={docs.idType}
          error={errors.idType}
          onChange={(e) => onChange({ idType: e.target.value })}
        >
          <option value="">Select ID type</option>
          {ID_DOCUMENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </SelectField>
        <FileField
          label="Identity document"
          required
          file={docs.idFile}
          error={errors.idFile}
          hint="Clear scan or photo of your passport, licence, or national ID."
          onFile={(file, err) => {
            if (err) {
              onError("idFile", err);
              onChange({ idFile: undefined });
              return;
            }
            onError("idFile", "");
            onChange({ idFile: file });
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-[13px] leading-relaxed text-[var(--l-body)]">
        Upload a recent proof of address (issued within the last 3 months) showing
        your name and residential address.
      </p>
      <SelectField
        label="Document type"
        required
        value={docs.addressType}
        error={errors.addressType}
        onChange={(e) => onChange({ addressType: e.target.value })}
      >
        <option value="">Select proof type</option>
        {ADDRESS_PROOF_TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </SelectField>
      <FileField
        label="Proof of address"
        required
        file={docs.addressFile}
        error={errors.addressFile}
        hint="Bank statement, utility bill, or similar official document."
        onFile={(file, err) => {
          if (err) {
            onError("addressFile", err);
            onChange({ addressFile: undefined });
            return;
          }
          onError("addressFile", "");
          onChange({ addressFile: file });
        }}
      />
    </div>
  );
}
