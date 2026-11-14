import { Award } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import PageHeader, { Empty } from "@/components/dash/PageHeader";
import { listMyCourses } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { requirePageUser } from "@/lib/session";

export const metadata: Metadata = { title: "Certificates" };

export default async function StudentCertificates() {
  const user = await requirePageUser("student", "/student/certificates");
  const items = (await listMyCourses(user.id)).filter((i) => i.enrollment.certificateIssued);

  return (
    <>
      <PageHeader
        title="Certificates"
        description="One for every course you finish. Each has a public link that anyone can use to verify it."
      />

      {items.length === 0 ? (
        <Empty title="No certificates yet">
          <p>Complete every lesson in a course and your certificate is issued automatically.</p>
          <Link href="/student/courses" className="btn btn-primary mt-6">
            Go to my courses
          </Link>
        </Empty>
      ) : (
        <ul className="grid gap-5 md:grid-cols-2">
          {items.map(({ course, enrollment }) => (
            <li key={enrollment.id} className="panel flex flex-col p-6">
              <Award className="h-7 w-7 text-accent" aria-hidden="true" />
              <h2 className="mt-5 font-display text-2xl font-semibold leading-tight tracking-tight">
                {course.title}
              </h2>
              <p className="mt-2 text-sm text-dim">
                Issued {formatDate(enrollment.certificateIssuedAt || enrollment.completedAt)}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link href={`/certificates/${enrollment.id}`} className="btn btn-primary btn-sm">
                  View &amp; download
                </Link>
                <Link href={`/courses/${course.id}/learn`} className="btn btn-sm">
                  Review course
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
