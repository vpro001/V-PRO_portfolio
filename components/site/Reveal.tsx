"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/**
 * Fades content up as it scrolls into view.
 *
 * Content is visible in the server HTML; the hidden starting state is only
 * applied by script, to elements still below the fold, when the visitor hasn't
 * asked for reduced motion. So nothing can ever get stuck invisible.
 */
export default function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;

    el.dataset.reveal = "pending";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.dataset.reveal = "shown";
        observer.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      delete el.dataset.reveal;
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${className || ""}`}
      style={delay ? ({ "--reveal-delay": `${delay}s` } as CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}
