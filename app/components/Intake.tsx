"use client";

import {
  PERSONAS,
  type Persona,
  type Profile,
  LANGUAGE_OPTIONS,
  INTEREST_OPTIONS,
} from "@/app/lib/personas";
import { Arrow } from "@/app/components/icons";

/* ── Persona presets — the demo spine ─────────────────────── */
export function PersonaPresets({
  active,
  busy,
  onPick,
}: {
  active: Persona["id"] | null;
  busy: boolean;
  onPick: (p: Persona) => void;
}) {
  return (
    <div>
      <div className="mb-2.5 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-ink-faint">
        Quick presets
      </div>
      <div className="flex flex-col gap-2.5">
        {PERSONAS.map((p, idx) => {
          const selected = active === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onPick(p)}
              disabled={busy}
              style={{ animationDelay: `${120 + idx * 90}ms` }}
              className={[
                "animate-rise group rounded-xl border p-4 text-left transition-all duration-300",
                "disabled:cursor-not-allowed disabled:opacity-60",
                selected
                  ? "border-robin bg-robin-tint shadow-[0_2px_0_var(--color-robin)]"
                  : "border-hairline bg-paper-raised hover:-translate-y-0.5 hover:border-robin/50",
              ].join(" ")}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-robin">
                  {p.badge}
                </span>
                <span
                  className={[
                    "text-robin transition-transform duration-300",
                    selected
                      ? "translate-x-0"
                      : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100",
                  ].join(" ")}
                >
                  <Arrow size={15} />
                </span>
              </div>
              <div className="mt-1.5 text-[1rem] font-semibold text-ink">
                {p.name}
              </div>
              <p className="mt-0.5 text-[0.8rem] leading-snug text-ink-soft">
                {p.summary}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Multi-select chip row ────────────────────────────────── */
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
                ? "border-robin bg-robin-tint text-ink"
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

/* ── The structured intake form ───────────────────────────── */
export function ProfileForm({
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
  const toggle = (key: "languages" | "interests") => (value: string) => {
    const cur = profile[key];
    onChange({
      [key]: cur.includes(value)
        ? cur.filter((v) => v !== value)
        : [...cur, value],
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!busy) onSubmit();
      }}
      className="mt-7 flex flex-col gap-5"
    >
      <div className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-ink-faint">
        …or tell us about yourself
      </div>

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

      <Field label="Your goal">
        <textarea
          value={profile.goals}
          onChange={(e) => onChange({ goals: e.target.value })}
          rows={3}
          placeholder="What do you want to work on, and why?"
          className="w-full resize-none rounded-lg border border-hairline bg-paper-sunk px-3 py-2 text-[0.85rem] text-ink placeholder:text-ink-faint focus:border-robin/60 focus:outline-none"
        />
      </Field>

      <Field label="Target repo">
        <input
          value={profile.targetRepo}
          onChange={(e) => onChange({ targetRepo: e.target.value })}
          className="w-full rounded-lg border border-hairline bg-paper-sunk px-3 py-2 font-mono text-[0.8rem] text-ink placeholder:text-ink-faint focus:border-robin/60 focus:outline-none"
        />
      </Field>

      <button
        type="submit"
        disabled={busy}
        className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-robin px-4 py-2.5 font-semibold text-paper transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {busy ? "Reading the repo…" : "Find my path"}
        {!busy && <Arrow size={16} />}
      </button>
    </form>
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
