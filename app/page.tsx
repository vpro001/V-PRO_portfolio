import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import CourseCard from "@/components/courses/CourseCard";
import AvailabilityBadge from "@/components/site/AvailabilityBadge";
import LocalTime from "@/components/site/LocalTime";
import Marquee from "@/components/site/Marquee";
import Portrait from "@/components/site/Portrait";
import Reveal from "@/components/site/Reveal";
import SectionHead from "@/components/site/SectionHead";
import SiteFrame from "@/components/site/SiteFrame";
import WorkList from "@/components/site/WorkList";
import { listProjects, listPublishedCourses, safely } from "@/lib/data";
import { pad2 } from "@/lib/format";
import { allStack, site } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [projects, courses] = await Promise.all([
    safely(listProjects, []),
    safely(() => listPublishedCourses(3), []),
  ]);
  const featured = projects.filter((p) => p.featured);
  const selected = (featured.length ? featured : projects).slice(0, 5);

  return (
    <SiteFrame>
      {/* ------------------------------- Hero ------------------------------- */}
      <section className="shell relative pb-16 pt-8 md:pb-24 md:pt-12">
        <div className="eyebrow flex flex-wrap items-center justify-between gap-x-8 gap-y-2 border-b border-line pb-4">
          <span>{site.role}</span>
          <span className="hidden sm:inline">
            {site.location} · <LocalTime />
          </span>
          {site.available && (
            <span className="flex items-center gap-2 text-ink">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              Taking on new projects
            </span>
          )}
        </div>

        <div className="relative mt-10 md:mt-14">
          <h1 className="relative z-10">
            <span className="block overflow-hidden pb-[0.06em]">
              <span className="display block animate-rise text-[clamp(5rem,22.5vw,21rem)] uppercase tracking-[-0.045em]">
                {site.firstName}
              </span>
            </span>
            <span className="-mt-[0.06em] block overflow-hidden pb-[0.18em] lg:pl-[6vw]">
              <span className="serif-accent block animate-rise text-[clamp(3.6rem,14.5vw,14rem)] leading-[0.92] text-accent [animation-delay:120ms]">
                {site.lastName}
              </span>
            </span>
          </h1>

          <div className="relative mt-10 w-full max-w-sm animate-rise [animation-delay:260ms] lg:absolute lg:right-0 lg:top-[3%] lg:mt-0 lg:w-[25%] lg:max-w-[22rem] lg:rotate-[2.5deg]">
            <Portrait priority />
            {site.available && (
              <div className="absolute -right-3 -top-10 z-20 lg:-left-20 lg:bottom-16 lg:right-auto lg:top-auto lg:-rotate-[2.5deg]">
                <AvailabilityBadge />
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 grid gap-8 md:mt-16 md:grid-cols-12 md:items-end">
          <p className="text-xl leading-snug md:col-span-7 md:text-[1.7rem] lg:col-span-6">
            {site.tagline}
          </p>
          <div className="flex flex-wrap gap-3 md:col-span-5 md:justify-end lg:col-span-6">
            <Link href="/projects" className="btn btn-primary">
              See the work
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/courses" className="btn">
              Browse courses
            </Link>
          </div>
        </div>
      </section>

      <Marquee items={allStack.slice(0, 9)} />

      {/* ------------------------------- Work ------------------------------- */}
      <section className="shell py-20 md:py-32">
        <SectionHead
          index="01"
          label="Selected work"
          title={
            <>
              Things I&rsquo;ve <span className="serif-accent text-accent">shipped</span>
            </>
          }
          aside={
            projects.length > 0 && (
              <Link href="/projects" className="link eyebrow text-ink">
                All {projects.length} projects →
              </Link>
            )
          }
        />
        <div className="mt-12 md:mt-16">
          {selected.length > 0 ? (
            <WorkList projects={selected} />
          ) : (
            <div className="grid gap-8 border-y border-line py-12 md:grid-cols-12">
              <p className="text-xl leading-snug md:col-span-7 md:text-2xl">
                Case studies are being written up. In the meantime, the platform you&rsquo;re on is
                one of them: a portfolio, course marketplace, payment flow and admin back-office,
                designed and built end to end.
              </p>
              <div className="flex flex-wrap items-start gap-3 md:col-span-5 md:justify-end">
                <Link href="/courses" className="btn">
                  See the course platform
                </Link>
                <a
                  href={site.socials[0].href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn"
                >
                  Code on GitHub
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ----------------------------- Services ----------------------------- */}
      <section className="shell pb-20 md:pb-32">
        <SectionHead
          index="02"
          label="What I do"
          title={
            <>
              From the schema <span className="serif-accent text-accent">to the</span> checkout
            </>
          }
        />
        <div className="mt-12 grid border-l border-t border-line md:mt-16 md:grid-cols-2">
          {site.services.map((service, i) => (
            <Reveal key={service.title} delay={(i % 2) * 0.08}>
              <article className="group relative h-full border-b border-r border-line p-6 transition-colors duration-500 hover:bg-raised md:p-10">
                <div className="flex items-start justify-between">
                  <span className="eyebrow text-accent">{pad2(i + 1)}</span>
                  <span className="h-2 w-2 rounded-full bg-line-strong transition-colors duration-500 group-hover:bg-accent" />
                </div>
                <h3 className="display mt-10 text-4xl md:mt-16 md:text-5xl">{service.title}</h3>
                <p className="mt-5 max-w-md text-dim">{service.body}</p>
                <div className="mt-8 flex flex-wrap gap-1.5">
                  {service.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ----------------------------- Approach ----------------------------- */}
      <section className="shell pb-20 md:pb-32">
        <div className="grid gap-12 border-t border-line pt-5 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="md:sticky md:top-28">
              <p className="eyebrow">
                <span className="text-accent">(03)</span> How I work
              </p>
              <h2 className="display mt-8 text-[clamp(2.5rem,6vw,5rem)] md:mt-12">
                Four rules I <span className="serif-accent text-accent">don&rsquo;t</span> break
              </h2>
              <Link href="/about" className="btn mt-8">
                More about me
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
          <ol className="md:col-span-7 md:pt-2">
            {site.principles.map((principle, i) => (
              <li key={principle.title} className="border-b border-line first:border-t">
                <Reveal className="grid gap-3 py-8 sm:grid-cols-[4rem_1fr] md:py-10">
                  <span className="serif-accent text-4xl text-dim">{i + 1}</span>
                  <div>
                    <h3 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
                      {principle.title}
                    </h3>
                    <p className="mt-3 max-w-xl text-dim">{principle.body}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------------ Courses ----------------------------- */}
      <section className="border-t border-line bg-sunk">
        <div className="shell py-20 md:py-32">
          <div className="grid gap-8 md:grid-cols-12 md:items-end">
            <div className="md:col-span-8">
              <p className="eyebrow">
                <span className="text-accent">(04)</span> Courses
              </p>
              <h2 className="display mt-8 text-[clamp(2.5rem,7vw,6rem)] md:mt-12">
                I teach what <span className="serif-accent text-accent">I ship</span>
              </h2>
            </div>
            <p className="text-dim md:col-span-4">
              Project-based courses recorded from real builds. Watch at your own pace, track your
              progress, and earn a certificate you can verify online.
            </p>
          </div>

          {courses.length > 0 ? (
            <div className="mt-12 grid gap-5 md:mt-16 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course, i) => (
                <Reveal key={course.id} delay={i * 0.08}>
                  <CourseCard course={course} />
                </Reveal>
              ))}
            </div>
          ) : (
            <p className="mt-12 border-y border-line py-10 text-xl md:text-2xl">
              The first courses are in production.{" "}
              <Link href="/auth/signup" className="link text-accent">
                Create a free account
              </Link>{" "}
              and you&rsquo;ll be ready when they open.
            </p>
          )}

          <div className="mt-10">
            <Link href="/courses" className="btn">
              {courses.length > 0 ? "All courses" : "Course catalogue"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </SiteFrame>
  );
}
