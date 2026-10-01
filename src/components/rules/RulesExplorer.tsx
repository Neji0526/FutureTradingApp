"use client";

import { useRef, useState, type ReactNode } from "react";
import { GROUPS, type Group, type Topic } from "./data";
import { GROUP_ICONS, TOPIC_ICONS, IconArrowRight } from "./icons";
import { usePresence } from "@/lib/use-presence";

const PANEL_TRANSITION_MS = 400;

/** One selectable group card. Reads "View rules" until open, then "Close". */
function GroupCard({
  group,
  selected,
  onSelect,
}: {
  group: Group;
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = GROUP_ICONS[group.icon];
  const n = group.topics.length;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-controls="rules-panel"
      className={[
        "group rounded-xl border bg-white p-5 text-left transition-all sm:p-6",
        selected
          ? "border-[var(--l-blue-500)] shadow-[0_10px_30px_-18px_rgba(47,111,208,0.45)]"
          : "border-[var(--l-line)] hover:border-[var(--l-blue-500)]/45 hover:shadow-[0_10px_30px_-18px_rgba(10,35,66,0.3)]",
      ].join(" ")}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-b from-[var(--l-navy-700)] to-[var(--l-navy-800)] p-2.5 text-white">
        <Icon />
      </span>

      <h3 className="mt-4 text-[14px] font-extrabold tracking-[0.04em] text-[var(--l-ink)] uppercase sm:text-[15px]">
        {group.title}
      </h3>

      <p className="mt-1.5 text-[12.5px] text-[var(--l-body)]">
        {n} {n === 1 ? "topic" : "topics"}
      </p>

      <span className="mt-4 inline-flex items-center gap-1.5 text-[10.5px] font-bold tracking-[0.14em] text-[var(--l-blue-500)] uppercase">
        {selected ? "Close" : "View rules"}
        <span className="h-3 w-3 transition-transform group-hover:translate-x-0.5">
          <IconArrowRight />
        </span>
      </span>
    </button>
  );
}

function Bullet({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-3 text-[13.5px] leading-relaxed text-[var(--l-body)]">
      <span
        aria-hidden
        className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--l-blue-500)]"
      />
      <span>{children}</span>
    </li>
  );
}

/** A topic row that expands to reveal its rule text. */
function TopicRow({
  topic,
  open,
  onToggle,
}: {
  topic: Topic;
  open: boolean;
  onToggle: () => void;
}) {
  const { mounted, shown } = usePresence(open, PANEL_TRANSITION_MS);
  const Icon = TOPIC_ICONS[topic.icon];
  const panelId = `topic-${topic.id}`;

  return (
    <li className="overflow-hidden rounded-lg border border-[var(--l-line)] bg-white">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left sm:px-5"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--l-blue-500)]/10 p-1.5 text-[var(--l-blue-500)]">
          <Icon />
        </span>

        <span className="flex-1 text-[14px] font-bold text-[var(--l-ink)] sm:text-[15px]">
          {topic.title}
        </span>

        {/* Plus that becomes a minus when open. */}
        <span aria-hidden className="relative h-4 w-4 shrink-0 text-[var(--l-body)]">
          <span className="absolute top-1/2 left-0 h-[1.5px] w-4 -translate-y-1/2 rounded bg-current" />
          <span
            className={[
              "absolute top-0 left-1/2 h-4 w-[1.5px] -translate-x-1/2 rounded bg-current transition-[opacity,transform] duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
              open ? "rotate-90 opacity-0" : "rotate-0 opacity-100",
            ].join(" ")}
          />
        </span>
      </button>

      {mounted && (
        <div
          className={[
            "grid transition-[grid-template-rows,opacity] duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
            shown ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          ].join(" ")}
        >
          <div className="min-h-0 overflow-hidden">
            <div id={panelId} className="border-t border-[var(--l-line)] px-4 py-5 sm:px-5">
              {topic.body && (
                <p className="text-[13.5px] leading-relaxed text-[var(--l-body)] sm:text-[14.5px]">
                  {topic.body}
                </p>
              )}

              {(topic.facts || topic.points) && (
                <ul className={["space-y-2.5", topic.body ? "mt-4" : ""].join(" ")}>
                  {topic.facts?.map((f) => (
                    <Bullet key={f.label}>
                      <span className="font-semibold text-[var(--l-ink)]">{f.label}:</span>{" "}
                      {f.value}
                    </Bullet>
                  ))}
                  {topic.points?.map((p) => (
                    <Bullet key={p}>{p}</Bullet>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </li>
  );
}

/**
 * Rules browser: pick a group above, then expand the topics that appear below.
 *
 * Only one topic is open at a time: opening a topic closes the previous one,
 * and switching groups collapses everything. Choosing a group moves focus to
 * the panel, so keyboard and screen-reader users are taken to the content
 * they just asked for rather than being left on the card.
 */
export function RulesExplorer() {
  const [selected, setSelected] = useState<string | null>(null);
  const [openTopic, setOpenTopic] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const group = GROUPS.find((g) => g.id === selected) ?? null;

  function choose(id: string) {
    const next = id === selected ? null : id;
    setSelected(next);
    setOpenTopic(null);
    if (next) requestAnimationFrame(() => panelRef.current?.focus());
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        {GROUPS.map((g) => (
          <GroupCard key={g.id} group={g} selected={g.id === selected} onSelect={() => choose(g.id)} />
        ))}
      </div>

      <div
        id="rules-panel"
        ref={panelRef}
        tabIndex={-1}
        aria-live="polite"
        className="mt-6 scroll-mt-24 outline-none sm:mt-8"
      >
        {group ? (
          /* `key` remounts the panel per group so no closing animation from the
             previous group carries over. */
          <section
            key={group.id}
            className="rounded-xl border border-[var(--l-line)] bg-white p-5 sm:p-8"
          >
            <h2 className="text-[clamp(1.2rem,3.2vw,1.6rem)] font-extrabold tracking-[0.02em] text-[var(--l-ink)] uppercase">
              {group.title}
            </h2>

            <ul className="mt-5 space-y-3 sm:mt-6">
              {group.topics.map((t) => (
                <TopicRow
                  key={t.id}
                  topic={t}
                  open={openTopic === t.id}
                  onToggle={() => setOpenTopic((cur) => (cur === t.id ? null : t.id))}
                />
              ))}
            </ul>
          </section>
        ) : (
          <p className="rounded-xl border border-[var(--l-line)] bg-white px-6 py-10 text-center text-[10.5px] font-bold tracking-[0.16em] text-[var(--l-body)]/70 uppercase">
            Select a group above to view its rules
          </p>
        )}
      </div>
    </>
  );
}
