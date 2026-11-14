import type { ReactNode } from "react";

/** "(01) Selected work" style section opener with a hairline rule. */
export default function SectionHead({
  index,
  label,
  title,
  aside,
}: {
  index: string;
  label: string;
  title: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="border-t border-line pt-5">
      <div className="flex items-center justify-between gap-4">
        <p className="eyebrow">
          <span className="text-accent">({index})</span> {label}
        </p>
        {aside}
      </div>
      <h2 className="display mt-8 max-w-5xl text-[clamp(2.5rem,7vw,6rem)] md:mt-12">{title}</h2>
    </div>
  );
}
