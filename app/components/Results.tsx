"use client";

import { useState } from "react";
import {
  recUrl,
  type Recommendation,
  type RobinResponse,
} from "@/app/lib/personas";
import { RobinMark, Signpost, BookMark, Arrow } from "@/app/components/icons";

/* ── The redirection signpost (signature moment) ──────────── */
function RedirectionBanner({
  verdict,
}: {
  verdict: { headline: string; sub: string };
}) {
  return (
    <div className="animate-rise overflow-hidden rounded-xl border border-honey-edge bg-honey-surface">
      <div className="flex items-start gap-3.5 p-5">
        <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-honey-edge bg-paper-raised">
          <Signpost size={20} />
        </span>
        <div>
          <h3 className="voice text-2xl text-ink sm:text-[1.7rem]">
            {verdict.headline}
          </h3>
          <p className="mt-1.5 max-w-[52ch] text-[0.92rem] leading-relaxed text-ink-soft">
            {verdict.sub}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── EvidencePanel — the credibility flex ─────────────────── */
function EvidencePanel({
  rec,
  isRedirect,
}: {
  rec: Recommendation;
  isRedirect: boolean;
}) {
  const accent = isRedirect ? "text-honey-deep" : "text-robin-deep";
  return (
    <div className="mt-4 space-y-4 border-t border-hairline-soft pt-4 text-[0.9rem] leading-relaxed">
      <div>
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-ink-faint">
          Why now
        </span>
        <p className="mt-1 text-ink-soft">{rec.whyNow}</p>
      </div>

      {rec.evidence?.length > 0 && (
        <div>
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-ink-faint">
            What Robin read
          </span>
          <ul className="mt-1.5 space-y-1.5">
            {rec.evidence.map((e, i) => (
              <li key={i} className="flex items-start gap-2 text-ink-soft">
                <span className={`mt-1 text-[0.7rem] ${accent}`}>●</span>
                <span className="text-[0.84rem]">{e}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-ink-faint">
          Read first
        </span>
        <ul className="mt-1.5 space-y-1.5">
          {rec.readFirst.map((r) => (
            <li key={r.label} className="flex items-start gap-2 text-ink">
              <span className={`mt-0.5 ${accent}`}>
                <BookMark />
              </span>
              <span className="font-mono text-[0.78rem]">
                {r.url ? (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`underline decoration-hairline underline-offset-2 hover:decoration-current ${accent}`}
                  >
                    {r.label}
                  </a>
                ) : (
                  r.label
                )}
                {r.note && (
                  <span className="ml-1.5 font-sans text-[0.78rem] text-ink-faint">
                    — {r.note}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <span
          className={`font-mono text-[0.6rem] uppercase tracking-[0.16em] ${
            isRedirect ? "text-honey-deep" : "text-robin-deep"
          }`}
        >
          Honest fit
        </span>
        <p className="mt-1 text-ink-soft">{rec.fit}</p>
      </div>

      <a
        href={recUrl(rec)}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[0.82rem] font-medium transition-colors ${
          isRedirect
            ? "border-honey-edge text-honey-deep hover:bg-honey-surface"
            : "border-hairline text-robin-deep hover:border-robin/50 hover:bg-robin-tint"
        }`}
      >
        Start here — open on GitHub
        <span className="text-[0.9em]">↗</span>
      </a>
    </div>
  );
}

/* ── A single recommendation card (collapsed → expandable) ─── */
function RecommendationCard({
  rec,
  tone,
  defaultOpen,
}: {
  rec: Recommendation;
  tone: "guide" | "redirect";
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  const isRedirect = tone === "redirect";
  return (
    <article
      className={[
        "animate-rise rounded-xl border bg-paper-raised transition-colors",
        isRedirect
          ? "border-honey-edge/70"
          : "border-hairline hover:border-robin/40",
      ].join(" ")}
    >
      <div className="flex w-full items-start gap-2 p-5">
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-start gap-3 text-left"
        >
          <span
            className={[
              "font-display text-2xl leading-none tabular-nums",
              isRedirect ? "text-honey-deep" : "text-robin-deep",
            ].join(" ")}
          >
            {String(rec.rank).padStart(2, "0")}
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-mono text-[0.72rem] text-ink-soft">
              {rec.repo}
            </div>
            <h4 className="mt-0.5 text-[1.02rem] font-medium leading-snug text-ink">
              {rec.area}
            </h4>
            {rec.signal && (
              <span
                className={[
                  "mt-2.5 inline-block rounded-full border px-2.5 py-0.5 font-mono text-[0.62rem] uppercase tracking-wide",
                  isRedirect
                    ? "border-honey-edge bg-honey-surface text-honey-deep"
                    : "border-hairline bg-paper-sunk text-ink-soft",
                ].join(" ")}
              >
                {rec.signal}
              </span>
            )}
          </div>
          <span
            className={[
              "mt-1 shrink-0 transition-transform duration-300",
              open ? "rotate-90" : "",
              isRedirect ? "text-honey-deep" : "text-robin-deep",
            ].join(" ")}
          >
            <Arrow size={15} />
          </span>
        </button>
        <a
          href={recUrl(rec)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${rec.repo} on GitHub`}
          className={[
            "grid h-8 w-8 shrink-0 place-items-center rounded-lg border transition-colors",
            isRedirect
              ? "border-honey-edge text-honey-deep hover:bg-honey-surface"
              : "border-hairline text-robin-deep hover:border-robin/50 hover:bg-robin-tint",
          ].join(" ")}
        >
          <span className="text-[0.95rem] leading-none">↗</span>
        </a>
      </div>

      {open && (
        <div className="px-5 pb-5">
          <EvidencePanel rec={rec} isRedirect={isRedirect} />
        </div>
      )}
    </article>
  );
}

/* ── Provenance: what Robin read ──────────────────────────── */
function SourceStrip({ sources }: { sources: string[] }) {
  return (
    <div className="mt-5 border-t border-hairline-soft pt-3">
      <div className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-ink-faint">
        Read to answer
      </div>
      <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
        {sources.map((s) => (
          <li key={s} className="font-mono text-[0.7rem] text-ink-faint">
            <span className="text-robin-deep/70">·</span> {s}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Empty state before the first query ───────────────────── */
export function ResultsEmpty() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 py-20 text-center">
      <RobinMark size={48} />
      <p className="voice mt-5 max-w-[34ch] text-[1.35rem] leading-snug text-ink-soft">
        Tell Robin who you are. Get a path into Bitcoin open source — or an
        honest nudge toward where you&apos;ll actually help.
      </p>
      <p className="mt-3 font-mono text-[0.7rem] text-ink-faint">
        Pick a preset, or fill the form and find your path.
      </p>
    </div>
  );
}

/* ── Loading skeleton (looks like a product, not a spinner) ── */
export function ResultsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5 text-ink-soft">
        <span className="flex gap-1" aria-hidden="true">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-robin [animation-delay:0ms]" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-robin/70 [animation-delay:160ms]" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-robin/40 [animation-delay:320ms]" />
        </span>
        <span className="font-mono text-[0.75rem] text-ink-faint">
          Reading the repo&apos;s trajectory…
        </span>
      </div>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-28 animate-pulse rounded-xl border border-hairline bg-paper-raised"
          style={{ animationDelay: `${i * 120}ms` }}
        />
      ))}
    </div>
  );
}

/* ── The full results panel ───────────────────────────────── */
export function Results({ response }: { response: RobinResponse }) {
  const isRedirect = response.mode === "redirect";
  return (
    <div className="animate-rise">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="grid h-7 w-7 place-items-center rounded-full border border-hairline bg-paper-raised">
          <RobinMark size={18} />
        </span>
        <span className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-ink-faint">
          Robin
        </span>
        <span className="ml-auto flex items-center gap-1.5 font-mono text-[0.66rem] text-ink-faint">
          fit
          <span
            className={isRedirect ? "text-honey-deep" : "text-robin-deep"}
          >
            {Math.round(response.fitScore)}%
          </span>
        </span>
      </div>

      <div className="voice space-y-3 text-[1.18rem] leading-[1.5] text-ink sm:text-[1.28rem]">
        {response.intro.map((para, i) => (
          <p key={i} className="max-w-[60ch]">
            {para}
          </p>
        ))}
      </div>

      {isRedirect && response.verdict && (
        <div className="mt-5">
          <RedirectionBanner verdict={response.verdict} />
        </div>
      )}

      <div className="mt-5 grid gap-3.5">
        {response.recs.map((rec, i) => (
          <RecommendationCard
            key={`${rec.repo}-${rec.rank}`}
            rec={rec}
            tone={response.mode}
            defaultOpen={i === 0}
          />
        ))}
      </div>

      {response.closer && (
        <p className="voice mt-5 max-w-[60ch] text-[1.1rem] leading-relaxed text-ink-soft">
          {response.closer}
        </p>
      )}

      <SourceStrip sources={response.sources} />
    </div>
  );
}

/* ── The dogfood meta-flex (always visible) ───────────────── */
export function DogfoodCallout() {
  return (
    <div className="rounded-xl border border-hairline bg-paper-raised p-5">
      <div className="flex items-start gap-4">
        <span className="mt-0.5 h-9 w-1 shrink-0 rounded-full bg-robin" aria-hidden="true" />
        <div>
          <div className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-robin-deep">
            We used Robin ourselves
          </div>
          <p className="mt-1.5 max-w-[60ch] text-[0.92rem] leading-relaxed text-ink-soft">
            Robin told us where to contribute during the hackathon — so we did.
            Here&apos;s the path: Robin recommended an area, we read what it told
            us to, and we opened the PR.
          </p>
          <a
            href="#"
            className="mt-2.5 inline-flex items-center gap-1.5 font-mono text-[0.78rem] text-robin-deep hover:underline"
          >
            View the PR on GitHub <Arrow size={13} />
          </a>
        </div>
      </div>
    </div>
  );
}
