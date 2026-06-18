// Hand-built marks for Robin. Geometric, warm, no icon-library default look.

export function RobinMark({ size = 34 }: { size?: number }) {
  // An abstract robin facing right: round body, lifted tail, terracotta breast.
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      {/* tail */}
      <path
        d="M7 14 L2 9 L10 16 Z"
        fill="var(--color-ink)"
      />
      {/* body */}
      <path
        d="M27 11c-7-2-15 2-17 9-1 4 1 8 6 9 6 1 13-1 16-6 3-5 2-10-5-12Z"
        fill="var(--color-ink)"
      />
      {/* breast */}
      <path
        d="M16 19c-2 3-2 6 0 8 3 1.6 7 1.2 10-0.6-2.6-3-6.4-5.6-10-7.4Z"
        fill="var(--color-robin)"
      />
      {/* beak */}
      <path d="M27 11l7-1-6 4Z" fill="var(--color-robin-deep)" />
      {/* eye */}
      <circle cx="26.5" cy="14.5" r="1.4" fill="var(--color-paper)" />
    </svg>
  );
}

export function Signpost({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--color-honey-deep)"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 22V8" />
      <path d="M5 6.5h9l2.5 2-2.5 2H5z" fill="var(--color-honey)" stroke="none" />
      <path d="M19 12.5h-9l-2.5 2 2.5 2h9z" fill="var(--color-honey-edge)" stroke="none" />
      <path d="M12 22V4.5" />
    </svg>
  );
}

export function Arrow({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

export function ArrowUp({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 19V5" />
      <path d="M6 11l6-6 6 6" />
    </svg>
  );
}

export function BookMark({ size = 13 }: { size?: number }) {
  // tiny "read first" glyph — an open page
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8 4C6.5 2.8 4.5 2.6 2.5 3v9c2-.4 4-.2 5.5 1 1.5-1.2 3.5-1.4 5.5-1V3c-2-.4-4-.2-5.5 1Z" />
      <path d="M8 4v10" />
    </svg>
  );
}
