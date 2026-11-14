import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import MyCourseCard from "@/components/dash/MyCourseCard";
import { Empty, Stat } from "@/components/dash/PageHeader";
import { listMyCourses } from "@/lib/data";
import { requirePageUser } from "@/lib/session";

export const metadata: Metadata = { title: "Overview" };

export default async function StudentDashboard() {
  const user = await requirePageUser("student", "/student/dashboard");
  const items = await listMyCourses(user.id);

  const completed = items.filter((i) => i.enrollment.progress >= 100).length;
  const certificates = items.filter((i) => i.enrollment.certificateIssued).length;
  const lessonsDone = items.reduce(
    (sum, i) => sum + i.course.lessons.filter((l) => i.enrollment.completedLessons.includes(l.id)).length,
    0
  );
  const current = items.find((i) => i.enrollment.progress < 100 && i.course.lessons.length > 0);
  const nextLesson = current?.course.lessons.find((l) => l.id === current.nextLessonId);

  return (
    <>
      <p className="eyebrow">Overview</p>
      <h1 className="display mt-4 text-[clamp(2.5rem,6vw,4.5rem)]">
        Hello, <span className="serif-accent text-accent">{user.name.split(" ")[0]}</span>
      </h1>

      {current && (
        <section className="panel mt-8 grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8" aria-label="Continue learning">
          <div>
            <p className="eyebrow text-accent">
              {current.enrollment.progress > 0 ? "Continue where you stopped" : "Ready when you are"}
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight md:text-3xl">
              {current.course.title}
            </h2>
            {nextLesson && <p className="mt-1 text-dim">Next: {nextLesson.title}</p>}
            <div className="mt-5 flex items-center gap-4">
              <div className="progress flex-1">
                <span style={{ width: `${current.enrollment.progress}%` }} />
              </div>
              <span className="tabular text-sm font-semibold">{current.enrollment.progress}%</span>
            </div>
          </div>
          <Link
            href={`/courses/${current.course.id}/learn${current.nextLessonId ? `?lesson=${current.nextLessonId}` : ""}`}
            className="btn btn-primary"
          >
            {current.enrollment.progress > 0 ? "Resume" : "Start"}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Enrolled" value={items.length} />
        <Stat label="Completed" value={completed} />
        <Stat label="Lessons done" value={lessonsDone} />
        <Stat label="Certificates" value={certificates} />
      </div>

      <section className="mt-12" aria-labelledby="my-courses">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 id="my-courses" className="font-display text-2xl font-semibold tracking-tight">
            Your courses
          </h2>
          <Link href="/courses" className="link text-sm text-dim hover:text-ink">
            Browse the catalogue →
          </Link>
        </div>
        {items.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {items.slice(0, 6).map((item) => (
              <MyCourseCard key={item.enrollment.id} item={item} />
            ))}
          </div>
        ) : (
          <Empty title="You haven't enrolled in anything yet">
            <p>Pick a course and your progress will show up here.</p>
            <Link href="/courses" className="btn btn-primary mt-6">
              Browse courses
            </Link>
          </Empty>
        )}
      </section>
    </>
  );
}
