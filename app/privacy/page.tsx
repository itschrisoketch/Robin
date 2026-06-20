import type { Metadata } from "next";
import Link from "next/link";
import { RobinMark } from "@/app/components/icons";

export const metadata: Metadata = {
  title: "Privacy — Robin",
  description: "What Robin collects, how it's used, and your choices.",
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="voice text-[1.3rem] text-ink">{title}</h2>
      <div className="mt-2 space-y-3 text-[0.95rem] leading-relaxed text-ink-soft">
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-[680px] px-6 py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-ink-soft transition-colors hover:text-ink"
      >
        <RobinMark size={28} />
        <span className="font-display text-[1.4rem] tracking-tight text-ink">
          Robin
        </span>
      </Link>

      <h1 className="voice mt-8 text-[2rem] text-ink">Privacy Policy</h1>
      <p className="mt-2 font-mono text-[0.72rem] uppercase tracking-[0.16em] text-ink-faint">
        Effective 20 June 2026
      </p>

      <p className="mt-6 text-[0.95rem] leading-relaxed text-ink-soft">
        Robin helps you find where to contribute in Bitcoin open source. It is
        designed to collect as little as possible: there are no accounts, no
        database, and no advertising or tracking. This page explains what Robin
        uses and your choices. It covers both the website and the Chrome
        extension, which share the same backend.
      </p>

      <Section title="What you provide">
        <p>
          The profile you enter — languages, years of experience, interests,
          hours per week, your goal, and the repository you&apos;re aiming at.
          It is used only to generate your recommendation for that request.
        </p>
      </Section>

      <Section title="Connecting GitHub (optional)">
        <p>
          If you choose <strong>Connect GitHub</strong>, Robin uses GitHub
          OAuth with read-only public scope (<code>read:user</code>) to read
          your public profile and public repositories. It derives a short skill
          summary — your most-used languages, a few notable public repos, and
          your account age — and then <strong>immediately discards the access
          token</strong>; the token is never stored. The derived summary is kept
          in a secure, http-only cookie for up to 24 hours so your session
          works, and you can delete it any time by clicking{" "}
          <strong>disconnect</strong>. Robin never requests write access and
          never reads private repositories.
        </p>
      </Section>

      <Section title="How recommendations are generated">
        <p>
          Your profile (and the GitHub summary, if connected) is sent to
          Robin&apos;s server, which reads public activity for the target
          repository from the GitHub API and queries a large language model via{" "}
          <a
            href="https://openrouter.ai"
            className="text-robin-deep underline underline-offset-2"
          >
            OpenRouter
          </a>{" "}
          to produce the ranked recommendations. Your data is not used to train
          any model.
        </p>
      </Section>

      <Section title="What's stored, and where">
        <p>
          No accounts and no database. Your most recent result is cached{" "}
          <strong>locally in your own browser</strong> (localStorage on the web,
          <code> chrome.storage.local</code> in the extension) so it persists
          between visits — you control it with “New session” or by clearing your
          browser/extension storage. The only server-readable item is the
          short-lived GitHub summary cookie described above.
        </p>
      </Section>

      <Section title="Third parties">
        <p>
          Robin relies on <strong>OpenRouter</strong> (model inference) and the{" "}
          <strong>GitHub API</strong> (repository signals and, if you connect,
          your public data). Their handling of requests is governed by their own
          policies.
        </p>
      </Section>

      <Section title="Browser extension permissions">
        <p>
          The extension requests only: <code>storage</code> (to save your last
          result and the backend setting), <code>activeTab</code> (to read the
          current GitHub tab&apos;s repository when you open the popup), and
          access to <code>github.com</code> and Robin&apos;s own domain (to show
          Robin on the GitHub page and call the API). The extension holds no
          secrets — all keys live on the server.
        </p>
      </Section>

      <Section title="Your choices">
        <p>
          Disconnect GitHub to delete the summary cookie. Use “New session,” or
          clear the site&apos;s data / the extension&apos;s storage, to remove
          cached results. Because there are no accounts, there is nothing else
          retained about you.
        </p>
      </Section>

      <Section title="Changes & contact">
        <p>
          We may update this policy; material changes will update the date
          above. Questions or requests:{" "}
          <a
            href="https://github.com/itschrisoketch/Robin"
            className="text-robin-deep underline underline-offset-2"
          >
            the Robin repository
          </a>
          .
        </p>
      </Section>

      <div className="mt-12 border-t border-hairline pt-6">
        <Link
          href="/"
          className="font-mono text-[0.78rem] text-robin-deep hover:underline"
        >
          ← Back to Robin
        </Link>
      </div>
    </main>
  );
}
