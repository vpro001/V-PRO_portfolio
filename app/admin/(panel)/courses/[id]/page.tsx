import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ActionButton from "@/components/admin/ConfirmButton";
import CourseForm from "@/components/admin/CourseForm";
import LessonManager from "@/components/admin/LessonManager";
import { findCourse, serializeCourse } from "@/lib/data";

export const metadata: Metadata = { title: "Edit course" };

export default async function EditCourse({ params }: { params: Promise<{ id: string }> }) {
  const doc = await findCourse((await params).id);
  if (!doc) notFound();
  const course = serializeCourse(doc, { withVideo: true, includeDrafts: true });
  const liveLessons = course.lessons.filter((l) => l.isPublished).length;

  return (
    <>
      <Link href="/admin/courses" className="link eyebrow">
        ← Courses
      </Link>

      <div className="mb-8 mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <span className={`tag ${course.isPublished ? "tag-accent" : "tag-ember"}`}>
            {course.isPublished ? "Live" : "Draft"}
          </span>
          <h1 className="display mt-3 text-3xl md:text-5xl">{course.title}</h1>
          <p className="mt-2 text-sm text-dim">
            {course.students} student{course.students === 1 ? "" : "s"} · {liveLessons} visible lesson
            {liveLessons === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex flex-wrap items-start gap-2">
          <Link href={`/courses/${course.id}/learn`} className="btn btn-sm">
            Preview
          </Link>
          <ActionButton
            url={`/api/admin/courses/${course.id}`}
            method="PUT"
            body={{ isPublished: !course.isPublished }}
            className={`btn btn-sm ${course.isPublished ? "" : "btn-primary"}`}
          >
            {course.isPublished ? "Unpublish" : "Publish"}
          </ActionButton>
        </div>
      </div>

      <div className="max-w-4xl space-y-12">
        <LessonManager courseId={course.id} lessons={course.lessons} />

        <section aria-labelledby="details-heading">
          <h2 id="details-heading" className="mb-4 font-display text-2xl font-semibold tracking-tight">
            Details
          </h2>
          <CourseForm course={course} />
        </section>

        <section className="rounded-lg border border-danger/40 p-6" aria-labelledby="danger-heading">
          <h2 id="danger-heading" className="font-display text-xl font-semibold tracking-tight">
            Delete this course
          </h2>
          <p className="mt-2 max-w-xl text-sm text-dim">
            Permanent. Courses with enrolled students can&rsquo;t be deleted — unpublish them
            instead so existing students keep access.
          </p>
          <div className="mt-4 flex justify-start">
            <ActionButton
              url={`/api/admin/courses/${course.id}`}
              method="DELETE"
              confirm="Click again to delete forever"
              className="btn btn-sm btn-danger"
              redirectTo="/admin/courses"
            >
              Delete course
            </ActionButton>
          </div>
        </section>
      </div>
    </>
  );
}
