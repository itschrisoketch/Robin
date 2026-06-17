"use client";

import { useEffect, useRef, useState } from "react";
import {
  PERSONAS,
  type Persona,
  type Profile,
  type RobinResponse,
} from "@/app/lib/personas";
import { PersonaPresets, ProfileForm } from "@/app/components/Intake";
import {
  Results,
  ResultsEmpty,
  ResultsSkeleton,
  DogfoodCallout,
} from "@/app/components/Results";
import { RobinMark } from "@/app/components/icons";

const EMPTY_PROFILE: Profile = {
  languages: [],
  yearsExperience: 3,
  interests: [],
  hoursPerWeek: 5,
  goals: "",
  targetRepo: "bitcoin/bitcoin",
};

export default function Home() {
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
  const [active, setActive] = useState<Persona["id"] | null>(null);
  const [result, setResult] = useState<RobinResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const reqRef = useRef(0);

  async function recommend(p: Profile) {
    const reqId = ++reqRef.current;
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p),
      });
      const data: RobinResponse = await res.json();
      // Ignore stale responses if a newer query started.
      if (reqId === reqRef.current) setResult(data);
    } catch {
      if (reqId === reqRef.current) setResult(null);
    } finally {
      if (reqId === reqRef.current) setBusy(false);
    }
  }

  function pickPreset(p: Persona) {
    if (busy) return;
    setActive(p.id);
    setProfile(p.profile);
    recommend(p.profile);
  }

  function submitForm() {
    setActive(null);
    recommend(profile);
  }

  function patchProfile(patch: Partial<Profile>) {
    setActive(null);
    setProfile((prev) => ({ ...prev, ...patch }));
  }

  // Deep-link a preset for screenshots / a bulletproof demo backup:
  // /?persona=bootcamp | senior | designer auto-runs that preset on load.
  useEffect(() => {
    const want = new URLSearchParams(window.location.search).get("persona");
    const p = PERSONAS.find((x) => x.id === want);
    if (p) pickPreset(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto grid min-h-dvh max-w-[1240px] grid-cols-1 lg:grid-cols-[360px_1fr]">
      {/* ── Intake column ───────────────────────────────── */}
      <aside className="flex flex-col border-hairline px-6 pt-8 pb-6 lg:sticky lg:top-0 lg:h-dvh lg:overflow-y-auto lg:border-r">
        <header className="animate-rise">
          <div className="flex items-center gap-3">
            <RobinMark size={40} />
            <span className="font-display text-[2.1rem] leading-none tracking-tight text-ink">
              Robin
            </span>
          </div>
          <p className="voice mt-3 text-[1.05rem] leading-snug text-ink-soft">
            A path into Bitcoin open source.
          </p>
          <p className="mt-2 max-w-[34ch] text-[0.82rem] leading-relaxed text-ink-faint">
            What to work on, what to read first, and — when it matters most —
            when not to contribute yet.
          </p>
        </header>

        <div className="mt-7">
          <PersonaPresets active={active} busy={busy} onPick={pickPreset} />
        </div>

        <ProfileForm
          profile={profile}
          onChange={patchProfile}
          onSubmit={submitForm}
          busy={busy}
        />

        <footer className="mt-auto pt-6">
          <div className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-ink-faint">
            What Robin reads
          </div>
          <p className="mt-1.5 max-w-[32ch] font-mono text-[0.68rem] leading-relaxed text-ink-faint">
            open issues · last ~100 merged PRs · CONTRIBUTING &amp;
            developer-notes
          </p>
          <div className="mt-3 font-mono text-[0.6rem] text-ink-faint/70">
            RAG, not fine-tuning.
          </div>
        </footer>
      </aside>

      {/* ── Results column ──────────────────────────────── */}
      <main className="flex min-h-dvh flex-col px-6 py-8 sm:px-10">
        <div className="mx-auto w-full max-w-[680px] flex-1">
          {busy ? (
            <ResultsSkeleton />
          ) : result ? (
            <Results response={result} />
          ) : (
            <ResultsEmpty />
          )}
        </div>

        <div className="mx-auto mt-8 w-full max-w-[680px]">
          <DogfoodCallout />
        </div>
      </main>
    </div>
  );
}
