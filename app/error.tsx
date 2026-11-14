"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="shell flex min-h-dvh flex-col justify-center py-20">
      <p className="eyebrow">Something broke</p>
      <h1 className="display mt-6 text-[clamp(3rem,11vw,10rem)]">
        That didn&rsquo;t <span className="serif-accent text-ember">load</span>
      </h1>
      <p className="mt-6 max-w-lg text-lg text-dim">
        The page hit an error on our side — usually a brief connection problem. Trying again
        normally fixes it.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="btn btn-primary">
          Try again
        </button>
        <Link href="/" className="btn">
          Go home
        </Link>
      </div>
    </main>
  );
}
