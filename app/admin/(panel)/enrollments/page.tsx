import type { Metadata } from "next";
import Link from "next/link";
import ActionButton from "@/components/admin/ConfirmButton";
import GrantAccessForm from "@/components/admin/GrantAccessForm";
import PageHeader, { Empty } from "@/components/dash/PageHeader";
import { displayName } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { getDb } from "@/lib/mongodb";

export const metadata: Metadata = { title: "Enrolments" };

export default async function AdminEnrollments() {
  const db = await getDb();
  const [enrollments, courses] = await Promise.all([
    db.collection("enrollments").find({}).sort({ enrolledAt: -1 }).limit(500).toArray(),
    db.collection("courses").find({}).project({ title: 1 }).sort({ title: 1 }).toArray(),
  ]);
  const students = await db
    .collection("students")
    .find({ _id: { $in: enrollments.map((e) => e.userId) } })
    .project({ password: 0 })
    .toArray();
  const studentById = new Map(students.map((s) => [String(s._id), s]));
  const courseById = new Map(courses.map((c) => [String(c._id), c]));

  return (
    <>
      <PageHeader title="Enrolments" description="Who is taking what, and how far along they are." />

      <GrantAccessForm courses={courses.map((c) => ({ id: String(c._id), title: String(c.title) }))} />

      <div className="mt-8">
        {enrollments.length === 0 ? (
          <Empty title="No enrolments yet">
            <p>When a student enrols — free, paid or granted by you — it shows up here.</p>
          </Empty>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Progress</th>
                  <th>Enrolled</th>
                  <th>Last active</th>
                  <th>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((e) => {
                  const student = studentById.get(String(e.userId));
                  const course = courseById.get(String(e.courseId));
                  const progress = Math.min(100, Math.round(Number(e.progress) || 0));
                  return (
                    <tr key={String(e._id)}>
                      <td>
                        <p className="font-medium">{student ? displayName(student) : "Deleted account"}</p>
                        {student && <p className="text-xs text-dim">{student.email}</p>}
                      </td>
                      <td>
                        {course ? (
                          <Link href={`/admin/courses/${course._id}`} className="link">
                            {course.title}
                          </Link>
                        ) : (
                          <span className="text-dim">Deleted course</span>
                        )}
                        {e.grantedBy && <p className="text-xs text-dim">Granted manually</p>}
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="progress w-20">
                            <span style={{ width: `${progress}%` }} />
                          </div>
                          <span className="tabular text-dim">{progress}%</span>
                          {e.certificate?.issued && (
                            <Link href={`/certificates/${e._id}`} className="tag tag-accent">
                              Certificate
                            </Link>
                          )}
                        </div>
                      </td>
                      <td className="tabular whitespace-nowrap text-dim">{formatDate(e.enrolledAt)}</td>
                      <td className="tabular whitespace-nowrap text-dim">{formatDate(e.lastAccessedAt)}</td>
                      <td>
                        <div className="flex justify-end">
                          <ActionButton
                            url={`/api/admin/enrollments/${e._id}`}
                            method="DELETE"
                            confirm="Remove access?"
                          >
                            Revoke
                          </ActionButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
