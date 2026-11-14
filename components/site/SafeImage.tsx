"use client";

import { useState, type ReactNode } from "react";

/**
 * Image for URLs typed in by hand (project screenshots, course covers).
 * If the link is dead it renders `fallback` instead of a broken-image icon.
 */
export default function SafeImage({
  src,
  alt = "",
  className,
  fallback = null,
}: {
  src: string;
  alt?: string;
  className?: string;
  fallback?: ReactNode;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <>{fallback}</>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={className}
      onError={() => setFailed(true)}
      ref={(el) => {
        // Catches images that failed before React attached the handler.
        if (el && el.complete && el.naturalWidth === 0) setFailed(true);
      }}
    />
  );
}
