import SafeImage from "@/components/site/SafeImage";

/**
 * Course artwork. Uses the uploaded thumbnail when there is one; otherwise
 * draws a typographic cover from the title so no course ever looks unfinished.
 */
export default function CourseCover({
  title,
  category,
  thumbnail,
  className = "",
}: {
  title: string;
  category: string;
  thumbnail?: string;
  className?: string;
}) {
  const initials = title
    .split(/\s+/)
    .filter((w) => /^[a-z0-9]/i.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  // Stable per-title variation so covers differ without being random on each render.
  const seed = [...title].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const angle = 20 + (seed % 5) * 28;

  const generated = (
    <div className="absolute inset-0" aria-hidden="true">
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage: `repeating-linear-gradient(${angle}deg, var(--line) 0 1px, transparent 1px 14px)`,
        }}
      />
      <span className="display absolute -bottom-[0.14em] left-3 text-[clamp(5rem,14vw,9rem)] leading-none text-accent">
        {initials || "V"}
      </span>
      <span className="eyebrow absolute right-3 top-3">{category}</span>
    </div>
  );

  return (
    <div className={`relative overflow-hidden bg-sunk ${className}`}>
      <SafeImage src={thumbnail || ""} className="absolute inset-0 h-full w-full object-cover" fallback={generated} />
    </div>
  );
}
