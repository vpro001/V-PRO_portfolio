import type { Metadata } from "next";
import Link from "next/link";
import CourseForm from "@/components/admin/CourseForm";
import PageHeader from "@/components/dash/PageHeader";

export const metadata: Metadata = { title: "New course" };

export default function NewCourse() {
  return (
    <>
      <Link href="/admin/courses" className="link eyebrow">
        ← Courses
      </Link>
      <div className="mt-4">
        <PageHeader
          title="New course"
          description="Start with the details. You'll add lessons next, and the course stays a draft until you publish it."
        />
      </div>
      <div className="max-w-4xl">
        <CourseForm />
      </div>
    </>
  );
}
