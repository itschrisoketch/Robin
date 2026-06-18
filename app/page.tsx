"use client";

import { useEffect, useRef, useState } from "react";
import {
  PERSONAS,
  type Persona,
  type Profile,
  type RobinResponse,
} from "@/app/lib/personas";
import { PersonaChips, Composer } from "@/app/components/Intake";
import { Results, ResultsSkeleton } from "@/app/components/Results";
import { GithubConnect } from "@/app/components/GithubConnect";
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

  function submitComposer() {
    if (!profile.goals.trim() && profile.languages.length === 0) return;
    setActive(null);
    recommend(profile);
  }

  function patchProfile(patch: Partial<Profile>) {
    setActive(null);
    setProfile((prev) => ({ ...prev, ...patch }));
  }

  // Deep-link a preset for screenshots / a bulletproof demo backup.
  useEffect(() => {
    const want = new URLSearchParams(window.location.search).get("persona");
    const p = PERSONAS.find((x) => x.id === want);
    if (p) pickPreset(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const started = busy || result;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[720px] flex-col px-6 pb-16">
      {/* ── Header / instruction ───────────────────────────── */}
      <header
        className={[
          "animate-rise flex flex-col items-center text-center transition-all",
          started ? "pt-10 pb-6" : "pt-[14vh] pb-8",
        ].join(" ")}
      >
        <div className="flex items-center gap-2.5">
          <RobinMark size={34} />
          <span className="font-display text-[1.9rem] leading-none tracking-tight text-ink">
            Robin
          </span>
        </div>
        <h1 className="voice mt-5 max-w-[18ch] text-[1.8rem] text-ink sm:text-[2.1rem]">
          Find where you&apos;ll actually help in Bitcoin open source.
        </h1>
        <p className="mt-3 max-w-[46ch] text-[0.95rem] leading-relaxed text-ink-soft">
          Pick a starting point or describe yourself. Robin reads each repo&apos;s
          live activity and tells you what to work on, what to read first, or
          when to start somewhere else.
        </p>
      </header>

      {/* ── Intake ─────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-4">
        <PersonaChips active={active} busy={busy} onPick={pickPreset} />
        <GithubConnect />
        <Composer
          profile={profile}
          onChange={patchProfile}
          onSubmit={submitComposer}
          busy={busy}
        />
      </div>

      {/* ── Results ────────────────────────────────────────── */}
      <section className="mt-10 flex-1">
        {busy ? (
          <ResultsSkeleton />
        ) : result ? (
          <Results response={result} />
        ) : null}
      </section>

      <footer className="mt-12 text-center font-mono text-[0.62rem] text-ink-faint">
        RAG, not fine-tuning · open issues · last ~100 merged PRs · CONTRIBUTING
      </footer>
    </main>
  );
}
