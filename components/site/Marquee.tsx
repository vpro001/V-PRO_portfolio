/** Endless strip of words. Decorative, so hidden from assistive tech; pauses on hover. */
export default function Marquee({ items }: { items: string[] }) {
  const row = (
    <div className="flex shrink-0 items-center">
      {items.map((item, i) => (
        <span key={i} className="flex items-center">
          <span
            className={`display px-5 text-[clamp(2.75rem,7vw,6.5rem)] md:px-8 ${
              i % 2 ? "outline-text" : "text-ink"
            }`}
          >
            {item}
          </span>
          <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-accent md:h-8 md:w-8">
            <path
              fill="currentColor"
              d="M12 0c.6 6.3 5.7 11.4 12 12-6.3.6-11.4 5.7-12 12-.6-6.3-5.7-11.4-12-12C6.3 11.400 11.400 6.300 12 0Z"
            />
          </svg>
        </span>
      ))}
    </div>
  );

  return (
    <div
      aria-hidden="true"
      className="group flex overflow-hidden border-y border-line py-5 select-none md:py-7"
    >
      <div className="flex animate-marquee group-hover:[animation-play-state:paused]">
        {row}
        {row}
      </div>
    </div>
  );
}
