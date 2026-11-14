import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import PageHeader, { Empty, Stat } from "@/components/dash/PageHeader";
import { displayName } from "@/lib/auth";
import { formatDate, formatMoney } from "@/lib/format";
import { getDb } from "@/lib/mongodb";

export const metadata: Metadata = { title: "Overview" };

const PAID = { status: { $in: ["successful", "completed"] } };
const WEEK = 7 * 24 * 60 * 60 * 1000;

export default async function AdminOverview() {
  const db = await getDb();
  const now = Date.now();
  const since30 = new Date(now - 30 * 24 * 60 * 60 * 1000);
  const since8w = new Date(now - 8 * WEEK);

  const [revenue, revenue30, students, courses, liveCourses, enrollments, completed, unread, recent, weekly] =
    await Promise.all([
      db.collection("payments").aggregate([{ $match: PAID }, { $group: { _id: null, sum: { $sum: "$amount" } } }]).toArray(),
      db.collection("payments").aggregate([{ $match: { ...PAID, createdAt: { $gte: since30 } } }, { $group: { _id: null, sum: { $sum: "$amount" } } }]).toArray(),
      db.collection("students").countDocuments(),
      db.collection("courses").countDocuments(),
      db.collection("courses").countDocuments({ isPublished: true }),
      db.collection("enrollments").countDocuments(),
      db.collection("enrollments").countDocuments({ progress: { $gte: 100 } }),
      db.collection("messages").countDocuments({ read: { $ne: true } }),
      db.collection("enrollments").find({}).sort({ enrolledAt: -1 }).limit(6).toArray(),
      db.collection("enrollments").find({ enrolledAt: { $gte: since8w } }).project({ enrolledAt: 1 }).toArray(),
    ]);

  const [recentStudents, recentCourses] = await Promise.all([
    db.collection("students").find({ _id: { $in: recent.map((e) => e.userId) } }).toArray(),
    db.collection("courses").find({ _id: { $in: recent.map((e) => e.courseId) } }).project({ title: 1 }).toArray(),
  ]);
  const studentById = new Map(recentStudents.map((s) => [String(s._id), s]));
  const courseById = new Map(recentCourses.map((c) => [String(c._id), c]));

  // Enrolments per week for the last eight weeks, oldest first.
  const buckets = Array.from({ length: 8 }, (_, i) => {
    const start = now - (8 - i) * WEEK;
    return {
      label: new Date(start + WEEK).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      count: weekly.filter((e) => {
        const t = new Date(e.enrolledAt).getTime();
        return t >= start && t < start + WEEK;
      }).length,
    };
  });
  const peak = Math.max(1, ...buckets.map((b) => b.count));
  const completionRate = enrollments ? Math.round((completed / enrollments) * 100) : 0;

  return (
    <>
      <PageHeader
        title="Overview"
        description="How the school is doing, from live data."
        actions={
          <Link href="/admin/courses/new" className="btn btn-primary">
            New course
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat
          label="Revenue"
          value={formatMoney(revenue[0]?.sum || 0)}
          note={`${formatMoney(revenue30[0]?.sum || 0)} in the last 30 days`}
        />
        <Stat label="Students" value={students} note={`${enrollments} enrolment${enrollments === 1 ? "" : "s"}`} />
        <Stat label="Courses" value={courses} note={`${liveCourses} published`} />
        <Stat label="Completion" value={`${completionRate}%`} note={`${completed} finished`} />
      </div>

      {unread > 0 && (
        <Link
          href="/admin/messages"
          className="mt-4 flex items-center justify-between gap-4 rounded-lg border border-accent/50 bg-accent/10 px-5 py-4 transition-colors hover:bg-accent/15"
        >
          <span>
            <strong className="font-semibold">
              {unread} unread message{unread === 1 ? "" : "s"}
            </strong>{" "}
            <span className="text-dim">from the contact form.</span>
          </span>
          <ArrowRight className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
        </Link>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <section className="panel p-6 lg:col-span-2" aria-labelledby="weekly">
          <h2 id="weekly" className="font-display text-xl font-semibold tracking-tight">
            Enrolments per week
          </h2>
          <p className="mt-1 text-sm text-dim">Last eight weeks</p>
          <ol className="mt-6 flex h-44 items-end gap-2">
            {buckets.map((bucket) => (
              <li key={bucket.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <span className="tabular text-xs text-dim">{bucket.count}</span>
                <span
                  className={`w-full rounded-t-sm ${bucket.count ? "bg-accent" : "bg-line"}`}
                  style={{ height: `${Math.max(2, (bucket.count / peak) * 100)}%` }}
                  aria-hidden="true"
                />
                <span className="eyebrow !text-[0.58rem] !tracking-normal">
                  <span className="sr-only">week ending </span>
                  {bucket.label}
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className="lg:col-span-3" aria-labelledby="recent">
          <div className="mb-3 flex items-end justify-between">
            <h2 id="recent" className="font-display text-xl font-semibold tracking-tight">
              Latest enrolments
            </h2>
            <Link href="/admin/enrollments" className="link text-sm text-dim hover:text-ink">
              All enrolments →
            </Link>
          </div>
          {recent.length > 0 ? (
            <div className="table-wrap">
              <table className="table !min-w-0">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Course</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((e) => {
                    const student = studentById.get(String(e.userId));
                    return (
                      <tr key={String(e._id)}>
                        <td className="font-medium">{student ? displayName(student) : "Deleted account"}</td>
                        <td className="text-dim">{courseById.get(String(e.courseId))?.title || "Deleted course"}</td>
                        <td className="tabular whitespace-nowrap text-dim">{formatDate(e.enrolledAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty title="No enrolments yet">
              <p>They&rsquo;ll appear here as soon as your first student signs up for a course.</p>
            </Empty>
          )}
        </section>
      </div>
    </>
  );
}
