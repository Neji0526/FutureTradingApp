"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

const SCROLL_END_PX = 12;

interface LegalDocumentModalProps {
  open: boolean;
  title: string;
  body: string;
  onClose: () => void;
  onAccept: () => void;
}

/**
 * Full-screen legal modal. Accept stays disabled until the user scrolls the
 * document body to the bottom (or the content fits without scrolling).
 */
export function LegalDocumentModal({
  open,
  title,
  body,
  onClose,
  onAccept,
}: LegalDocumentModalProps) {
  const titleId = useId();
  const bodyRef = useRef<HTMLDivElement>(null);
  const [canAccept, setCanAccept] = useState(false);

  const measureScroll = useCallback(() => {
    const el = bodyRef.current;
    if (!el) return;
    const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
    // Content shorter than the viewport counts as already "read".
    if (el.scrollHeight <= el.clientHeight + SCROLL_END_PX || remaining <= SCROLL_END_PX) {
      setCanAccept(true);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    setCanAccept(false);
    // Next frame so layout has the modal content measured.
    const id = requestAnimationFrame(() => measureScroll());
    return () => cancelAnimationFrame(id);
  }, [open, body, measureScroll]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/45"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-[1] flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-[var(--l-line)] bg-white shadow-2xl sm:rounded-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-[var(--l-line)] px-5 py-4 sm:px-6">
          <h2
            id={titleId}
            className="text-[17px] font-extrabold tracking-[-0.02em] text-[var(--l-ink)]"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-[13px] font-semibold text-[var(--l-body)] hover:bg-[var(--l-paper-2)] hover:text-[var(--l-ink)]"
          >
            Close
          </button>
        </header>

        <div
          ref={bodyRef}
          onScroll={measureScroll}
          className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6"
        >
          <div className="space-y-3 whitespace-pre-wrap text-[13.5px] leading-relaxed text-[var(--l-body)]">
            {body}
          </div>
          {!canAccept && (
            <p className="sticky bottom-0 mt-6 bg-gradient-to-t from-white via-white to-transparent pt-8 pb-1 text-center text-[12px] font-medium text-[var(--l-body)]">
              Scroll to the end to enable Accept
            </p>
          )}
        </div>

        <footer className="flex items-center justify-end gap-3 border-t border-[var(--l-line)] px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[var(--l-line)] px-5 py-2.5 text-[13.5px] font-semibold text-[var(--l-ink)] transition-colors hover:bg-[var(--l-paper-2)]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canAccept}
            onClick={() => {
              if (!canAccept) return;
              onAccept();
            }}
            className="l-cta rounded-lg px-6 py-2.5 text-[13.5px] font-bold disabled:cursor-not-allowed disabled:opacity-40"
          >
            Accept
          </button>
        </footer>
      </div>
    </div>
  );
}
