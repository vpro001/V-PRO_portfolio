"use client";

import { ArrowUpRight } from "lucide-react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useState } from "react";
import { pad2 } from "@/lib/format";
import type { ProjectDTO } from "@/lib/types";
import SafeImage from "./SafeImage";

/**
 * Editorial index of projects. On devices with a mouse, a preview image trails
 * the cursor over the hovered row; on touch devices the image sits in the row.
 */
export default function WorkList({ projects }: { projects: ProjectDTO[] }) {
  const [active, setActive] = useState<number | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 26, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 220, damping: 26, mass: 0.6 });

  const preview = active !== null ? projects[active]?.imageUrl : "";

  return (
    <div
      onMouseMove={(e) => {
        x.set(e.clientX);
        y.set(e.clientY);
      }}
      onMouseLeave={() => setActive(null)}
    >
      <ul className="border-b border-line">
        {projects.map((project, i) => {
          const Row = (project.link ? "a" : "div") as "a";
          return (
            <li key={project.id} className="border-t border-line">
              <Row
                {...(project.link
                  ? { href: project.link, target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                className={`group grid gap-x-6 gap-y-4 py-6 transition-opacity duration-300 md:grid-cols-12 md:items-center md:py-9 ${
                  active !== null && active !== i ? "md:opacity-35" : ""
                }`}
              >
                <span className="eyebrow md:col-span-1">{pad2(i + 1)}</span>

                <SafeImage
                  src={project.imageUrl}
                  className="aspect-[16/10] w-full rounded-md border border-line object-cover md:hidden"
                />

                <div className="md:col-span-6">
                  <h3 className="display text-[clamp(2rem,5vw,4.25rem)] transition-transform duration-500 ease-out-expo md:group-hover:translate-x-3">
                    {project.name}
                  </h3>
                  <p className="mt-3 line-clamp-2 max-w-xl text-sm text-dim md:text-base">
                    {project.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 md:col-span-3">
                  {project.technologies.slice(0, 4).map((tech) => (
                    <span key={tech} className="tag">
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between gap-3 md:col-span-2 md:justify-end">
                  <span className="eyebrow">{project.category}</span>
                  {project.link && (
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line-strong transition-colors duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-on-accent">
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                      <span className="sr-only">Open {project.name} in a new tab</span>
                    </span>
                  )}
                </div>
              </Row>
            </li>
          );
        })}
      </ul>

      {/* Cursor-following preview (mouse only). */}
      <motion.div
        aria-hidden="true"
        style={{ x: sx, y: sy }}
        className="pointer-events-none fixed left-0 top-0 z-30 hidden md:[@media(hover:hover)]:block"
      >
        <motion.div
          animate={{ opacity: preview ? 1 : 0, scale: preview ? 1 : 0.85, rotate: preview ? -3 : 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="-translate-y-1/2 translate-x-8 overflow-hidden rounded-lg border border-line-strong bg-raised shadow-2xl shadow-black/40"
        >
          {preview && (
            <SafeImage key={preview} src={preview} className="aspect-[16/10] w-[22rem] object-cover" />
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
