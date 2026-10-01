"use client";

import type { ReactNode } from "react";
import { IconCheck, IconChevron } from "./icons";
import { usePresence } from "@/lib/use-presence";

const PANEL_TRANSITION_MS = 300;

/**
 * A collapsible section inside a step.
 *
 * When `alwaysOpen` is set, the form body stays visible so Verification fields
 * are never hidden behind an accordion click.
 */
export function Section({
  index,
  title,
  complete,
  open,
  onToggle,
  alwaysOpen = false,
  children,
}: {
  index: number;
  title: string;
  complete?: boolean;
  open: boolean;
  onToggle: () => void;
  alwaysOpen?: boolean;
  children: ReactNode;
}) {
  const panelId = `onb-panel-${index}`;
  const headerId = `onb-header-${index}`;
  const expanded = alwaysOpen || open;
  const { mounted, shown } = usePresence(expanded, PANEL_TRANSITION_MS);

  return (
    <section
      className={[
        "overflow-hidden rounded-2xl border bg-white transition-colors",
        expanded ? "border-[var(--l-red)]/45" : "border-[var(--l-line)]",
      ].join(" ")}
    >
      <h3>
        <button
          id={headerId}
          type="button"
          onClick={alwaysOpen ? undefined : onToggle}
          aria-expanded={expanded}
          aria-controls={panelId}
          className={[
            "flex w-full items-center gap-3.5 px-5 py-4 text-left sm:px-6 sm:py-5",
            alwaysOpen ? "cursor-default" : "",
          ].join(" ")}
        >
          <span
            className={[
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold",
              complete
                ? "bg-[var(--l-red)] p-1.5 text-white"
                : expanded
                  ? "bg-[var(--l-navy-900)] text-white"
                  : "bg-[var(--l-ink)]/[0.07] text-[var(--l-body)]",
            ].join(" ")}
          >
            {complete ? <IconCheck /> : index}
          </span>

          <span className="flex-1 text-[14.5px] font-bold text-[var(--l-ink)]">{title}</span>

          {complete && (
            <span className="hidden rounded-full bg-[var(--l-red)]/10 px-2.5 py-1 text-[10.5px] font-bold text-[var(--l-red)] sm:block">
              Complete
            </span>
          )}

          {!alwaysOpen && (
            <span
              aria-hidden
              className={[
                "h-4 w-4 shrink-0 text-[var(--l-body)] transition-transform duration-300",
                expanded ? "rotate-180" : "",
              ].join(" ")}
            >
              <IconChevron />
            </span>
          )}
        </button>
      </h3>

      {mounted && (
        <div
          className={[
            "grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
            shown ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          ].join(" ")}
        >
          <div className="min-h-0 overflow-hidden">
            <div
              id={panelId}
              aria-labelledby={headerId}
              className="border-t border-[var(--l-line)] px-5 py-6 sm:px-6"
            >
              {children}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
