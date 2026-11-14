import type { Metadata } from "next";
import Link from "next/link";
import MyCourseCard from "@/components/dash/MyCourseCard";
import PageHeader, { Empty } from "@/components/dash/PageHeader";
import { listMyCourses } from "@/lib/data";
import { requirePageUser } from "@/lib/session";

export const metadata: Metadata = { title: "My courses" };

export default async function StudentCourses() {
  const user = await requirePageUser("student", "/student/courses");
  const items = await listMyCourses(user.id);
  const active = items.filter((i) => i.enrollment.progress < 100);
  const finished = items.filter((i) => i.enrollment.progress >= 100);

  return (
    <>
      <PageHeader
        title="My courses"
        description="Everything you're enrolled in. Progress saves automatically as you go."
        actions={
          <Link href="/courses" className="btn">
            Find another course
          </Link>
        }
      />

      {items.length === 0 ? (
        <Empty title="No courses yet">
          <p>Enrol in a course and it will appear here.</p>
          <Link href="/courses" className="btn btn-primary mt-6">
            Browse courses
          </Link>
        </Empty>
      ) : (
        <div className="space-y-12">
          {active.length > 0 && (
            <section aria-labelledby="in-progress">
              <h2 id="in-progress" className="eyebrow mb-5">
                In progress · {active.length}
              </h2>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {active.map((item) => (
                  <MyCourseCard key={item.enrollment.id} item={item} />
                ))}
              </div>
            </section>
          )}
          {finished.length > 0 && (
            <section aria-labelledby="finished">
              <h2 id="finished" className="eyebrow mb-5">
                Completed · {finished.length}
              </h2>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {finished.map((item) => (
                  <MyCourseCard key={item.enrollment.id} item={item} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </>
  );
}
