import { ExternalLink, Pencil } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import ActionButton from "@/components/admin/ConfirmButton";
import PageHeader, { Empty } from "@/components/dash/PageHeader";
import { listAllCourses } from "@/lib/data";
import { formatNaira } from "@/lib/format";

export const metadata: Metadata = { title: "Courses" };

export default async function AdminCourses() {
  const courses = await listAllCourses();

  return (
    <>
      <PageHeader
        title="Courses"
        description="Create courses, add lessons, and decide what's live."
        actions={
          <Link href="/admin/courses/new" className="btn btn-primary">
            New course
          </Link>
        }
      />

      {courses.length === 0 ? (
        <Empty title="No courses yet">
          <p>Create your first course, add a few lessons, then publish it.</p>
          <Link href="/admin/courses/new" className="btn btn-primary mt-6">
            Create a course
          </Link>
        </Empty>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Status</th>
                <th>Lessons</th>
                <th>Students</th>
                <th>Price</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id}>
                  <td>
                    <Link href={`/admin/courses/${course.id}`} className="link font-medium">
                      {course.title}
                    </Link>
                    <p className="text-xs text-dim">
                      {course.category} · <span className="capitalize">{course.level}</span>
                    </p>
                  </td>
                  <td>
                    <span className={`tag ${course.isPublished ? "tag-accent" : ""}`}>
                      {course.isPublished ? "Live" : "Draft"}
                    </span>
                  </td>
                  <td className="tabular">{course.lessons.length}</td>
                  <td className="tabular">{course.students}</td>
                  <td className="tabular whitespace-nowrap">{formatNaira(course.price)}</td>
                  <td>
                    <div className="flex items-start justify-end gap-1.5">
                      <ActionButton
                        url={`/api/admin/courses/${course.id}`}
                        method="PUT"
                        body={{ isPublished: !course.isPublished }}
                      >
                        {course.isPublished ? "Unpublish" : "Publish"}
                      </ActionButton>
                      <Link href={`/admin/courses/${course.id}`} className="btn btn-icon btn-sm" aria-label={`Edit ${course.title}`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <Link href={`/courses/${course.id}`} className="btn btn-icon btn-sm" aria-label={`View ${course.title} on the site`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
