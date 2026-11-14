import Link from "next/link";
import type { ReactNode } from "react";
import Mark from "@/components/site/Mark";
import ThemeToggle from "@/components/site/ThemeToggle";
import { site } from "@/lib/site";

/** Two-column frame shared by sign-in and sign-up screens. */
export default function AuthShell({
  children,
  kicker,
  headline,
}: {
  children: ReactNode;
  kicker: string;
  headline: ReactNode;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5" aria-label={`${site.brand} — home`}>
            <Mark />
            <span className="font-display text-lg font-bold tracking-tight">{site.brand}</span>
          </Link>
          <ThemeToggle />
        </div>
        <main id="main" className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
          {children}
        </main>
      </div>

      <aside className="relative hidden overflow-hidden border-l border-line bg-sunk lg:flex lg:flex-col lg:justify-between lg:p-14">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "repeating-linear-gradient(118deg, var(--line) 0 1px, transparent 1px 22px)",
          }}
        />
        <p className="eyebrow relative">{kicker}</p>
        <p className="display relative text-[clamp(3rem,6vw,6.5rem)]">{headline}</p>
        <p className="eyebrow relative">
          {site.name} · {site.location}
        </p>
      </aside>
    </div>
  );
}
