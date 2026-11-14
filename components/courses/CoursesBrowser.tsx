"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { CourseDTO } from "@/lib/types";
import CourseCard from "./CourseCard";

export default function CoursesBrowser({ courses }: { courses: CourseDTO[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(courses.map((c) => c.category))).sort()],
    [courses]
  );

  const q = query.trim().toLowerCase();
  const visible = courses.filter(
    (c) =>
      (category === "All" || c.category === category) &&
      (!q || `${c.title} ${c.description} ${c.category}`.toLowerCase().includes(q))
  );

  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {categories.length > 2 &&
            categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
                className={`btn btn-sm ${category === c ? "btn-primary" : ""}`}
              >
                {c}
              </button>
            ))}
        </div>
        <div className="relative w-full md:max-w-xs">
          <label htmlFor="course-search" className="sr-only">
            Search courses
          </label>
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-dim"
            aria-hidden="true"
          />
          <input
            id="course-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses"
            className="field !rounded-full !pl-10"
          />
        </div>
      </div>

      <p className="eyebrow mt-8" aria-live="polite">
        {visible.length} course{visible.length === 1 ? "" : "s"}
      </p>

      {visible.length > 0 ? (
        <ul className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((course) => (
            <li key={course.id}>
              <CourseCard course={course} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-5 border-y border-line py-14">
          <p className="text-xl">Nothing matches that search.</p>
          <button
            type="button"
            className="btn mt-5"
            onClick={() => {
              setQuery("");
              setCategory("All");
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </>
  );
}
