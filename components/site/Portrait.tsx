import Image from "next/image";
import { site } from "@/lib/site";

/** Portrait in a slightly tilted frame; black-and-white until hovered. */
export default function Portrait({ className = "", priority = false }: { className?: string; priority?: boolean }) {
  return (
    <figure className={`group relative ${className}`}>
      <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-lg border border-accent/60" aria-hidden="true" />
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-line-strong bg-raised">
        <Image
          src={site.portrait}
          alt={`Portrait of ${site.name}`}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 26vw, (min-width: 640px) 50vw, 90vw"
          className="object-cover object-[50%_28%] grayscale contrast-[1.08] transition-[filter,transform] duration-700 ease-out-expo group-hover:scale-[1.03] group-hover:grayscale-0"
        />
        <div className="pointer-events-none absolute inset-0 bg-accent/15 mix-blend-color transition-opacity duration-700 group-hover:opacity-0" aria-hidden="true" />
      </div>
      <figcaption className="eyebrow mt-5 flex justify-between">
        <span>{site.name}</span>
        <span>{site.location.split(",")[0]}</span>
      </figcaption>
    </figure>
  );
}
