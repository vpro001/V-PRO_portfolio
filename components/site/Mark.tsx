/** The V-PRO mark: two stacked chevrons, redrawn as a vector so it works on any background. */
export default function Mark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path
        d="M5 13.5 16 24.5l11-11"
        stroke="currentColor"
        strokeOpacity=".38"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 6.5 16 17.5l11-11"
        stroke="var(--accent)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
