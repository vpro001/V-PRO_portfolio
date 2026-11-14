import type { Metadata } from "next";
import Link from "next/link";
import CoursesBrowser from "@/components/courses/CoursesBrowser";
import PageIntro from "@/components/site/PageIntro";
import SiteFrame from "@/components/site/SiteFrame";
import { listPublishedCourses, safely } from "@/lib/data";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Courses",
  description: `Project-based programming courses taught by ${site.name}.`,
};

export default async function CoursesPage() {
  const courses = await safely(() => listPublishedCourses(), []);

  return (
    <SiteFrame>
      <PageIntro
        eyebrow="Courses"
        title={
          <>
            Learn by <span className="serif-accent text-accent">building</span>
          </>
        }
      >
        <p>
          Every course follows one real project from an empty folder to production. Watch at your
          own pace, pick up where you stopped, and finish with a certificate anyone can verify.
        </p>
      </PageIntro>

      <section className="shell pb-20 md:pb-32">
        {courses.length > 0 ? (
          <CoursesBrowser courses={courses} />
        ) : (
          <div className="grid gap-8 border-y border-line py-14 md:grid-cols-12">
            <p className="text-xl leading-snug md:col-span-7 md:text-2xl">
              The first courses are being recorded. Create a free account now and you&rsquo;ll be
              ready to enrol the day they open.
            </p>
            <div className="flex flex-wrap items-start gap-3 md:col-span-5 md:justify-end">
              <Link href="/auth/signup" className="btn btn-primary">
                Create an account
              </Link>
              <Link href="/contact" className="btn">
                Ask about mentorship
              </Link>
            </div>
          </div>
        )}
      </section>
    </SiteFrame>
  );
}
