import { ArrowRight, Award } from "lucide-react";
import Link from "next/link";
import CourseCover from "@/components/courses/CourseCover";
import type { MyCourse } from "@/lib/data";

export default function MyCourseCard({ item }: { item: MyCourse }) {
  const { course, enrollment, nextLessonId } = item;
  const total = course.lessons.length;
  const done = course.lessons.filter((l) => enrollment.completedLessons.includes(l.id)).length;
  const finished = total > 0 && done === total;

  return (
    <article className="panel flex h-full flex-col overflow-hidden">
      <CourseCover
        title={course.title}
        category={course.category}
        thumbnail={course.thumbnail}
        className="aspect-[16/8] border-b border-line"
      />
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl font-semibold leading-tight tracking-tight">{course.title}</h3>
        <div className="mt-4 flex items-baseline justify-between text-sm">
          <span className="text-dim">
            {done} of {total} lessons
          </span>
          <span className="tabular font-semibold">{enrollment.progress}%</span>
        </div>
        <div className="progress mt-2">
          <span style={{ width: `${enrollment.progress}%` }} />
        </div>
        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          <Link
            href={`/courses/${course.id}/learn${!finished && nextLessonId ? `?lesson=${nextLessonId}` : ""}`}
            className={`btn btn-sm flex-1 ${finished ? "" : "btn-primary"}`}
          >
            {finished ? "Review" : enrollment.progress > 0 ? "Continue" : "Start"}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          {enrollment.certificateIssued && (
            <Link href={`/certificates/${enrollment.id}`} className="btn btn-sm">
              <Award className="h-4 w-4" aria-hidden="true" />
              Certificate
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
