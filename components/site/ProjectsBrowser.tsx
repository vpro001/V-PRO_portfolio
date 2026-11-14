"use client";

import { ArrowUpRight } from "lucide-react";
import { useMemo, useState } from "react";
import type { ProjectDTO } from "@/lib/types";
import SafeImage from "./SafeImage";

export default function ProjectsBrowser({ projects }: { projects: ProjectDTO[] }) {
  const [category, setCategory] = useState("All");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(projects.map((p) => p.category))).sort()],
    [projects]
  );
  const visible = category === "All" ? projects : projects.filter((p) => p.category === category);

  return (
    <>
      {categories.length > 2 && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter projects by category">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
              className={`btn btn-sm ${category === c ? "btn-primary" : ""}`}
            >
              {c}
              <span className="tabular opacity-60">
                {c === "All" ? projects.length : projects.filter((p) => p.category === c).length}
              </span>
            </button>
          ))}
        </div>
      )}

      <ul className="mt-10 grid gap-x-6 gap-y-14 md:grid-cols-2 md:gap-y-20">
        {visible.map((project, i) => {
          const Card = (project.link ? "a" : "div") as "a";
          return (
            <li key={project.id} className={i % 2 ? "md:mt-24" : ""}>
              <Card
                {...(project.link
                  ? { href: project.link, target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="group block"
              >
                <div className="relative aspect-[16/11] overflow-hidden rounded-lg border border-line bg-raised">
                  <SafeImage
                    src={project.imageUrl}
                    alt={`Screenshot of ${project.name}`}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]"
                    fallback={
                      <span className="display absolute -bottom-[0.12em] left-4 text-[9rem] leading-none text-line-strong">
                        {project.name.slice(0, 2)}
                      </span>
                    }
                  />
                  <div className="absolute left-3 top-3 flex gap-1.5">
                    {project.featured && (
                      <span className="tag tag-accent bg-bg/80 backdrop-blur">Featured</span>
                    )}
                    {project.status && (
                      <span className="tag bg-bg/80 backdrop-blur">{project.status}</span>
                    )}
                  </div>
                  {project.link && (
                    <span className="absolute bottom-3 right-3 flex h-12 w-12 translate-y-2 items-center justify-center rounded-full bg-accent text-on-accent opacity-0 transition-all duration-500 ease-out-expo group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                      <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
                    </span>
                  )}
                </div>

                <div className="mt-5 flex items-baseline justify-between gap-4">
                  <h2 className="display text-3xl md:text-5xl">{project.name}</h2>
                  <span className="eyebrow shrink-0">{project.category}</span>
                </div>
                <p className="mt-3 max-w-xl text-dim">{project.description}</p>
                {project.technologies.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {project.technologies.map((tech) => (
                      <span key={tech} className="tag">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                {project.link && <span className="sr-only">Opens in a new tab</span>}
              </Card>
            </li>
          );
        })}
      </ul>
    </>
  );
}
