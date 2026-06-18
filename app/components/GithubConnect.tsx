"use client";

import { useCallback, useEffect, useState } from "react";

type Me = {
  configured: boolean;
  connected: boolean;
  summary?: {
    login: string;
    topLanguages?: { name: string; percent: number }[];
  } | null;
};

function GhIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.486 2 12.02c0 4.428 2.865 8.184 6.839 9.51.5.092.682-.218.682-.483 0-.237-.009-.866-.013-1.7-2.782.606-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.467-1.11-1.467-.908-.622.069-.61.069-.61 1.004.071 1.532 1.034 1.532 1.034.892 1.532 2.341 1.09 2.91.833.092-.648.35-1.09.636-1.341-2.22-.253-4.555-1.114-4.555-4.957 0-1.095.39-1.99 1.029-2.69-.103-.254-.446-1.274.098-2.655 0 0 .84-.27 2.75 1.027a9.546 9.546 0 0 1 2.504-.338c.85.004 1.705.115 2.504.338 1.909-1.297 2.748-1.027 2.748-1.027.546 1.381.203 2.401.1 2.655.64.7 1.028 1.595 1.028 2.69 0 3.853-2.339 4.701-4.566 4.949.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .267.18.579.688.481A10.02 10.02 0 0 0 22 12.02C22 6.486 17.523 2 12 2Z"
      />
    </svg>
  );
}

export function GithubConnect() {
  const [me, setMe] = useState<Me | null>(null);
  const [working, setWorking] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const r = await fetch("/api/auth/github/me");
      setMe(await r.json());
    } catch {
      setMe({ configured: false, connected: false });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Don't render a broken button before the OAuth app is configured.
  if (!me || !me.configured) return null;

  if (!me.connected) {
    return (
      <a
        href="/api/auth/github/login"
        className="inline-flex items-center gap-2 rounded-full border border-hairline bg-paper-raised px-4 py-2 text-[0.85rem] font-medium text-ink transition-colors hover:border-robin/50 hover:bg-robin-tint"
      >
        <GhIcon />
        Connect GitHub
        <span className="text-ink-faint">— let Robin read your real skills</span>
      </a>
    );
  }

  const langs = (me.summary?.topLanguages ?? [])
    .slice(0, 4)
    .map((l) => l.name)
    .join(" · ");

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-full border border-hairline bg-paper-raised px-4 py-2 text-[0.82rem]">
      <span className="inline-flex items-center gap-1.5 font-medium text-ink">
        <GhIcon />@{me.summary?.login}
      </span>
      {langs && (
        <span className="text-ink-soft">
          Robin sees{" "}
          <span className="font-mono text-[0.78rem] text-robin-deep">{langs}</span>
        </span>
      )}
      <button
        disabled={working}
        onClick={async () => {
          setWorking(true);
          try {
            await fetch("/api/auth/github/logout", { method: "POST" });
            await refresh();
          } finally {
            setWorking(false);
          }
        }}
        className="font-mono text-[0.72rem] text-ink-faint underline-offset-2 hover:text-ink hover:underline"
      >
        disconnect
      </button>
    </div>
  );
}
