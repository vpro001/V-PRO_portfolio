import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import LearnClient from "@/components/courses/LearnClient";
import SiteFrame from "@/components/site/SiteFrame";
import { findCourse, findEnrollment, serializeCourse } from "@/lib/data";
import { getDb } from "@/lib/mongodb";
import { getSessionUser, toObjectId } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Learning", robots: { index: false } };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ lesson?: string }> };

export default async function LearnPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { lesson: requested } = await searchParams;

  const user = await getSessionUser();
  if (!user) redirect(`/auth/signin?callbackUrl=${encodeURIComponent(`/courses/${id}/learn`)}`);

  const doc = await findCourse(id);
  if (!doc) notFound();

  const isAdmin = user.role === "admin";
  const enrollment = isAdmin ? null : await findEnrollment(user.id, id);
  // Students need an enrolment; nobody gets lesson videos without one.
  if (!isAdmin && !enrollment) redirect(`/courses/${id}`);

  const course = serializeCourse(doc, { withVideo: true, includeDrafts: isAdmin });

  if (!course.lessons.length) {
    return (
      <SiteFrame cta={false}>
        <div className="shell py-24">
          <p className="eyebrow">{course.title}</p>
          <h1 className="display mt-6 text-5xl md:text-7xl">Lessons are on the way.</h1>
          <p className="mt-6 max-w-xl text-lg text-dim">
            You&rsquo;re enrolled, but no lessons have been published yet. They&rsquo;ll appear here
            as soon as they&rsquo;re ready.
          </p>
          <Link href={isAdmin ? `/admin/courses/${id}` : "/student/dashboard"} className="btn mt-8">
            {isAdmin ? "Add lessons" : "Back to my learning"}
          </Link>
        </div>
      </SiteFrame>
    );
  }

  const positions: Record<string, number> = {};
  if (enrollment) {
    const records = await (await getDb())
      .collection("progress")
      .find({ userId: toObjectId(user.id)!, courseId: doc._id })
      .toArray();
    for (const r of records) {
      // Don't resume a finished lesson from its last second.
      if (!r.completed && r.lastPosition > 0) positions[String(r.lessonId)] = Number(r.lastPosition);
    }
  }

  const done = new Set(enrollment?.completedLessons || []);
  const start =
    course.lessons.find((l) => l.id === requested) ||
    course.lessons.find((l) => !done.has(l.id)) ||
    course.lessons[0];

  return (
    <LearnClient
      course={course}
      enrollmentId={enrollment?.id || null}
      initialCompleted={enrollment?.completedLessons || []}
      initialLessonId={start.id}
      positions={positions}
      certificateIssued={Boolean(enrollment?.certificateIssued)}
    />
  );
}
