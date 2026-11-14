import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { formatMinutes, formatNaira } from "@/lib/format";
import type { CourseDTO } from "@/lib/types";
import CourseCover from "./CourseCover";

export default function CourseCard({ course }: { course: CourseDTO }) {
  const onSale = course.originalPrice > course.price && course.price > 0;

  return (
    <Link
      href={`/courses/${course.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-raised transition-colors duration-300 hover:border-line-strong"
    >
      <CourseCover
        title={course.title}
        category={course.category}
        thumbnail={course.thumbnail}
        className="aspect-[16/10] border-b border-line"
      />
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <div className="flex flex-wrap gap-1.5">
          <span className="tag">{course.category}</span>
          <span className="tag capitalize">{course.level}</span>
        </div>
        <h3 className="mt-4 font-display text-2xl font-semibold leading-tight tracking-tight">
          {course.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-dim">{course.description}</p>

        <div className="mt-auto flex items-end justify-between gap-4 pt-6">
          <div>
            <p className="eyebrow">
              {course.lessons.length} lesson{course.lessons.length === 1 ? "" : "s"}
              {course.totalMinutes ? ` · ${formatMinutes(course.totalMinutes)}` : ""}
            </p>
            <p className="tabular mt-1.5 text-lg font-semibold">
              {formatNaira(course.price)}
              {onSale && (
                <span className="ml-2 text-sm font-normal text-dim line-through">
                  {formatNaira(course.originalPrice)}
                </span>
              )}
            </p>
          </div>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line-strong transition-colors duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-on-accent">
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}
