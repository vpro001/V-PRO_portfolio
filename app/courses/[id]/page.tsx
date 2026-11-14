import { BarChart3, Check, Clock, FileText, Globe, Lock, PlayCircle, Users } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import CourseCover from "@/components/courses/CourseCover";
import EnrollButton, { Viewer } from "@/components/courses/EnrollButton";
import VideoPlayer from "@/components/courses/VideoPlayer";
import SiteFrame from "@/components/site/SiteFrame";
import { findCourse, findEnrollment, safely, serializeCourse } from "@/lib/data";
import { formatMinutes, formatNaira, pad2 } from "@/lib/format";
import { getSessionUser } from "@/lib/session";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const doc = await safely(async () => findCourse((await params).id), null);
  if (!doc || !doc.isPublished) return { title: "Course" };
  return { title: String(doc.title), description: String(doc.description).slice(0, 160) };
}

export default async function CoursePage({ params }: Props) {
  const { id } = await params;
  const [doc, user] = await Promise.all([findCourse(id), getSessionUser()]);
  if (!doc) notFound();

  const enrollment = user?.role === "student" ? await findEnrollment(user.id, id) : null;
  // Drafts are visible to the admin, and to students who enrolled before it was unpublished.
  if (!doc.isPublished && user?.role !== "admin" && !enrollment) notFound();

  const course = serializeCourse(doc);
  const viewer: Viewer = !user
    ? "guest"
    : user.role === "admin"
      ? "admin"
      : enrollment
        ? "enrolled"
        : "student";
  const onSale = course.originalPrice > course.price && course.price > 0;
  const done = new Set(enrollment?.completedLessons || []);

  const facts = [
    { icon: PlayCircle, label: `${course.lessons.length} lesson${course.lessons.length === 1 ? "" : "s"}` },
    ...(course.totalMinutes ? [{ icon: Clock, label: formatMinutes(course.totalMinutes) }] : []),
    { icon: BarChart3, label: course.level[0].toUpperCase() + course.level.slice(1) },
    { icon: Globe, label: course.language },
    ...(course.students > 0
      ? [{ icon: Users, label: `${course.students} enrolled` }]
      : []),
  ];

  return (
    <SiteFrame cta={false}>
      <div className="shell pb-20 pt-8 md:pb-32 md:pt-12">
        <nav aria-label="Breadcrumb" className="eyebrow">
          <Link href="/courses" className="link">
            Courses
          </Link>{" "}
          / <span className="text-ink">{course.category}</span>
          {!course.isPublished && (
            <span className="tag tag-ember ml-3">
              {viewer === "admin" ? "Draft — not visible to the public" : "No longer open for enrolment"}
            </span>
          )}
        </nav>

        <div className="mt-8 grid gap-x-12 gap-y-10 lg:grid-cols-12">
          {/* ------------------------------ Main ------------------------------ */}
          <div className="lg:col-span-8">
            <h1 className="display animate-rise text-[clamp(2.5rem,6.5vw,5.75rem)]">{course.title}</h1>
            <p className="mt-6 max-w-2xl animate-rise whitespace-pre-line text-lg text-dim [animation-delay:80ms] md:text-xl">
              {course.description}
            </p>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-y border-line py-5 text-sm">
              {facts.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ul>

            {course.previewVideoUrl && (
              <section className="mt-12" aria-labelledby="trailer">
                <h2 id="trailer" className="eyebrow mb-4">
                  Trailer
                </h2>
                <div className="overflow-hidden rounded-lg border border-line">
                  <VideoPlayer url={course.previewVideoUrl} title={`${course.title} trailer`} />
                </div>
              </section>
            )}

            {course.objectives.length > 0 && (
              <section className="mt-14" aria-labelledby="outcomes">
                <h2 id="outcomes" className="display text-3xl md:text-4xl">
                  What you&rsquo;ll be able to do
                </h2>
                <ul className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                  {course.objectives.map((objective) => (
                    <li key={objective} className="flex gap-3">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="mt-14" aria-labelledby="curriculum">
              <div className="flex items-end justify-between gap-4">
                <h2 id="curriculum" className="display text-3xl md:text-4xl">
                  Curriculum
                </h2>
                <p className="eyebrow">
                  {course.lessons.length} lessons
                  {course.totalMinutes ? ` · ${formatMinutes(course.totalMinutes)}` : ""}
                </p>
              </div>
              {course.lessons.length > 0 ? (
                <ol className="mt-6 border-t border-line">
                  {course.lessons.map((lesson, i) => {
                    const open = viewer === "enrolled" || viewer === "admin";
                    const Icon = done.has(lesson.id) ? Check : open ? (lesson.hasVideo ? PlayCircle : FileText) : Lock;
                    const row = (
                      <>
                        <span className="eyebrow w-7 shrink-0">{pad2(i + 1)}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-medium">{lesson.title}</span>
                          {lesson.description && (
                            <span className="mt-0.5 line-clamp-1 block text-sm text-dim">
                              {lesson.description}
                            </span>
                          )}
                        </span>
                        {lesson.duration > 0 && (
                          <span className="tabular shrink-0 text-sm text-dim">
                            {formatMinutes(lesson.duration)}
                          </span>
                        )}
                        <Icon
                          className={`h-4 w-4 shrink-0 ${done.has(lesson.id) ? "text-accent" : "text-dim"}`}
                          aria-hidden="true"
                        />
                      </>
                    );
                    return (
                      <li key={lesson.id} className="border-b border-line">
                        {open ? (
                          <Link
                            href={`/courses/${course.id}/learn?lesson=${lesson.id}`}
                            className="flex items-center gap-4 py-4 transition-colors hover:bg-raised md:px-3"
                          >
                            {row}
                          </Link>
                        ) : (
                          <div className="flex items-center gap-4 py-4 md:px-3">{row}</div>
                        )}
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <p className="mt-6 border-y border-line py-8 text-dim">Lessons are being added.</p>
              )}
            </section>

            {course.requirements.length > 0 && (
              <section className="mt-14" aria-labelledby="requirements">
                <h2 id="requirements" className="display text-3xl md:text-4xl">
                  Before you start
                </h2>
                <ul className="mt-6 space-y-3">
                  {course.requirements.map((requirement) => (
                    <li key={requirement} className="flex gap-3 text-dim">
                      <span className="mt-[0.7em] h-px w-4 shrink-0 bg-accent" aria-hidden="true" />
                      {requirement}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="mt-14 border-t border-line pt-8" aria-labelledby="instructor">
              <h2 id="instructor" className="eyebrow">
                Your instructor
              </h2>
              <div className="mt-5 flex items-start gap-5">
                <Image
                  src={site.portrait}
                  alt=""
                  width={88}
                  height={88}
                  className="h-20 w-20 shrink-0 rounded-full border border-line-strong object-cover object-[50%_25%] grayscale"
                />
                <div>
                  <p className="font-display text-2xl font-semibold tracking-tight">{site.name}</p>
                  <p className="text-sm text-dim">{site.role}</p>
                  <p className="mt-3 max-w-xl text-dim">{site.tagline}</p>
                  <Link href="/about" className="link mt-3 inline-block text-sm">
                    More about {site.firstName} →
                  </Link>
                </div>
              </div>
            </section>
          </div>

          {/* --------------------------- Purchase card --------------------------- */}
          <aside className="lg:col-span-4">
            <div className="panel overflow-hidden lg:sticky lg:top-24">
              <CourseCover
                title={course.title}
                category={course.category}
                thumbnail={course.thumbnail}
                className="aspect-[16/10] border-b border-line"
              />
              <div className="p-6">
                {viewer === "enrolled" && enrollment ? (
                  <div className="mb-5">
                    <div className="flex items-baseline justify-between">
                      <p className="eyebrow">Your progress</p>
                      <p className="tabular font-display text-2xl font-semibold">
                        {enrollment.progress}%
                      </p>
                    </div>
                    <div className="progress mt-3">
                      <span style={{ width: `${enrollment.progress}%` }} />
                    </div>
                  </div>
                ) : (
                  <div className="mb-5 flex items-baseline gap-3">
                    <p className="tabular display text-4xl">{formatNaira(course.price)}</p>
                    {onSale && (
                      <p className="tabular text-dim line-through">
                        {formatNaira(course.originalPrice)}
                      </p>
                    )}
                  </div>
                )}

                <EnrollButton
                  courseId={course.id}
                  price={course.price}
                  viewer={viewer}
                  started={Boolean(enrollment && enrollment.progress > 0)}
                />

                {enrollment?.certificateIssued && (
                  <Link href={`/certificates/${enrollment.id}`} className="btn mt-2 w-full">
                    View certificate
                  </Link>
                )}

                <ul className="mt-6 space-y-2.5 border-t border-line pt-5 text-sm text-dim">
                  {[
                    "Lifetime access, at your own pace",
                    "Progress saved automatically",
                    "Verifiable certificate on completion",
                    ...(course.price > 0 ? ["Secure payment via Flutterwave"] : []),
                  ].map((line) => (
                    <li key={line} className="flex gap-2.5">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </SiteFrame>
  );
}
