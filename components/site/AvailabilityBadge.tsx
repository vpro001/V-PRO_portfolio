import { ArrowDownRight } from "lucide-react";
import Link from "next/link";

/** Rotating ring of text around an arrow; links to the contact page. */
export default function AvailabilityBadge() {
  return (
    <Link
      href="/contact"
      aria-label="Available for new projects — get in touch"
      className="group relative flex h-28 w-28 items-center overflow-hidden justify-center rounded-full bg-accent text-on-accent md:h-36 md:w-36"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 animate-turn" aria-hidden="true">
        <defs>
          <path id="badge-ring" d="M50 50m-38 0a38 38 0 1 1 76 0a38 38 0 1 1-76 0" />
        </defs>
        <text className="fill-current font-mono text-[7.5px] uppercase">
          <textPath href="#badge-ring" textLength="232" lengthAdjust="spacing">
            Available for new projects · Say hello ·
          </textPath>
        </text>
      </svg>
      <ArrowDownRight
        className="h-8 w-8 transition-transform duration-500 ease-out-expo group-hover:-rotate-45 md:h-10 md:w-10"
        strokeWidth={1.5}
        aria-hidden="true"
      />
    </Link>
  );
}
