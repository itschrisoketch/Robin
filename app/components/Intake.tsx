"use client";

import { useState } from "react";
import {
  PERSONAS,
  type Persona,
  type Profile,
  LANGUAGE_OPTIONS,
  INTEREST_OPTIONS,
} from "@/app/lib/personas";
import { ArrowUp } from "@/app/components/icons";

/* ── Quick-start chips — the obvious "I'm one of these" path ─ */
export function PersonaChips({
  active,
  busy,
  onPick,
}: {
  active: Persona["id"] | null;
  busy: boolean;
  onPick: (p: Persona) => void;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {PERSONAS.map((p) => {
        const selected = active === p.id;
        return (
          <button
            key={p.id}
            onClick={() => onPick(p)}
            disabled={busy}
            className={[
              "rounded-full border px-3.5 py-1.5 text-[0.82rem] font-medium transition-all duration-200",
              "disabled:cursor-not-allowed disabled:opacity-50",
              selected
                ? "border-robin bg-robin-tint text-robin-deep"
                : "border-hairline bg-paper-raised text-ink-soft hover:border-robin/50 hover:text-ink",
            ].join(" ")}
          >
            {p.name}
          </button>
        );
      })}
    </div>
  );
}

function ChipSelect({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const on = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className={[
              "rounded-md border px-2 py-1 font-mono text-[0.68rem] transition-colors",
              on
                ? "border-robin bg-robin-tint text-robin-deep"
                : "border-hairline bg-paper-sunk text-ink-faint hover:border-robin/50",
            ].join(" ")}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

/* ── The composer — primary entry point ───────────────────── */
export function Composer({
  profile,
  onChange,
  onSubmit,
  busy,
}: {
  profile: Profile;
  onChange: (patch: Partial<Profile>) => void;
  onSubmit: () => void;
  busy: boolean;
}) {
  const [showDetails, setShowDetails] = useState(false);

  const toggle = (key: "languages" | "interests") => (value: string) => {
    const cur = profile[key];
    onChange({
      [key]: cur.includes(value)
        ? cur.filter((v) => v !== value)
        : [...cur, value],
    });
  };

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!busy) onSubmit();
    }
  }

  return (
    <div className="w-full">
      {/* The 20px-radius composer */}
      <div
        className="rounded-[20px] border border-hairline bg-paper-raised p-3.5 shadow-[0_2px_16px_-6px_rgba(0,0,0,0.12)] transition-colors focus-within:border-robin/60"
      >
        <textarea
          value={profile.goals}
          onChange={(e) => onChange({ goals: e.target.value })}
          onKeyDown={handleKeyDown}
          rows={2}
          placeholder="Tell Robin about yourself — your languages, experience, and what you'd like to work on…"
          className="w-full resize-none bg-transparent px-2 pt-1 text-[0.98rem] leading-relaxed text-ink placeholder:text-ink-faint focus:outline-none"
        />
        <div className="mt-1 flex items-center gap-2">
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-paper-sunk px-2.5 py-1.5">
            <span className="shrink-0 font-mono text-[0.6rem] uppercase tracking-wide text-ink-faint">
              repo
            </span>
            <input
              value={profile.targetRepo}
              onChange={(e) => onChange({ targetRepo: e.target.value })}
              placeholder="owner/name"
              className="min-w-0 flex-1 bg-transparent font-mono text-[0.78rem] text-ink placeholder:text-ink-faint focus:outline-none"
            />
          </label>
          <button
            type="button"
            onClick={() => !busy && onSubmit()}
            disabled={busy}
            aria-label="Ask Robin"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-robin text-black transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
          >
            <ArrowUp size={18} />
          </button>
        </div>
      </div>

      {/* Optional structured details — collapsed by default for clarity */}
      <div className="mt-2.5 text-center">
        <button
          type="button"
          onClick={() => setShowDetails((s) => !s)}
          className="font-mono text-[0.72rem] text-ink-faint hover:text-robin-deep"
        >
          {showDetails ? "Hide details" : "Add details for a sharper read"}
        </button>
      </div>

      {showDetails && (
        <div className="animate-rise-soft mt-3 grid gap-5 rounded-2xl border border-hairline bg-paper-raised p-5">
          <Field label="Languages">
            <ChipSelect
              options={LANGUAGE_OPTIONS}
              selected={profile.languages}
              onToggle={toggle("languages")}
            />
          </Field>
          <Field label={`Years of experience — ${profile.yearsExperience}`}>
            <input
              type="range"
              min={0}
              max={20}
              step={1}
              value={profile.yearsExperience}
              onChange={(e) =>
                onChange({ yearsExperience: Number(e.target.value) })
              }
              className="w-full accent-[var(--color-robin)]"
            />
          </Field>
          <Field label="Interests">
            <ChipSelect
              options={INTEREST_OPTIONS}
              selected={profile.interests}
              onToggle={toggle("interests")}
            />
          </Field>
          <Field label={`Hours per week — ${profile.hoursPerWeek}`}>
            <input
              type="range"
              min={1}
              max={40}
              step={1}
              value={profile.hoursPerWeek}
              onChange={(e) => onChange({ hoursPerWeek: Number(e.target.value) })}
              className="w-full accent-[var(--color-robin)]"
            />
          </Field>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-faint">
        {label}
      </span>
      {children}
    </label>
  );
}
