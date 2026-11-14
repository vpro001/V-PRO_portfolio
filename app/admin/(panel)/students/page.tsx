import type { Metadata } from "next";
import PageHeader, { Empty } from "@/components/dash/PageHeader";
import { displayName } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { getDb } from "@/lib/mongodb";

export const metadata: Metadata = { title: "Students" };

export default async function AdminStudents() {
  const db = await getDb();
  const [students, stats] = await Promise.all([
    db.collection("students").find({}).project({ password: 0 }).sort({ createdAt: -1 }).limit(500).toArray(),
    db
      .collection("enrollments")
      .aggregate([
        {
          $group: {
            _id: "$userId",
            courses: { $sum: 1 },
            completed: { $sum: { $cond: [{ $gte: ["$progress", 100] }, 1, 0] } },
            average: { $avg: "$progress" },
          },
        },
      ])
      .toArray(),
  ]);
  const byStudent = new Map(stats.map((s) => [String(s._id), s]));

  return (
    <>
      <PageHeader
        title="Students"
        description={`${students.length} registered account${students.length === 1 ? "" : "s"}.`}
      />

      {students.length === 0 ? (
        <Empty title="No students yet">
          <p>Accounts appear here as soon as someone signs up.</p>
        </Empty>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Email</th>
                <th>Courses</th>
                <th>Avg. progress</th>
                <th>Joined</th>
                <th>Last seen</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const s = byStudent.get(String(student._id));
                return (
                  <tr key={String(student._id)}>
                    <td>
                      <p className="font-medium">{displayName(student)}</p>
                      <p className="text-xs text-dim">@{student.username}</p>
                    </td>
                    <td>
                      <a href={`mailto:${student.email}`} className="link text-dim hover:text-ink">
                        {student.email}
                      </a>
                    </td>
                    <td className="tabular">
                      {s?.courses || 0}
                      {s?.completed ? <span className="text-dim"> · {s.completed} done</span> : null}
                    </td>
                    <td>
                      {s ? (
                        <div className="flex items-center gap-3">
                          <div className="progress w-20">
                            <span style={{ width: `${Math.round(s.average || 0)}%` }} />
                          </div>
                          <span className="tabular text-dim">{Math.round(s.average || 0)}%</span>
                        </div>
                      ) : (
                        <span className="text-dim">—</span>
                      )}
                    </td>
                    <td className="tabular whitespace-nowrap text-dim">{formatDate(student.createdAt)}</td>
                    <td className="tabular whitespace-nowrap text-dim">{formatDate(student.lastLoginAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
