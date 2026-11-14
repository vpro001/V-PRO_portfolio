import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import ProjectsBrowser from "@/components/site/ProjectsBrowser";
import SiteFrame from "@/components/site/SiteFrame";
import { listProjects, safely } from "@/lib/data";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Work",
  description: `Selected projects designed and built by ${site.name}.`,
};

export default async function ProjectsPage() {
  const projects = await safely(listProjects, []);

  return (
    <SiteFrame>
      <PageIntro
        eyebrow={projects.length ? `Work · ${projects.length} projects` : "Work"}
        title={
          <>
            Selected <span className="serif-accent text-accent">work</span>
          </>
        }
      >
        <p>
          Products and platforms I&rsquo;ve designed, built and shipped — mostly business software
          where the data model and the payment flow matter more than the landing page.
        </p>
      </PageIntro>

      <section className="shell pb-20 md:pb-32">
        {projects.length > 0 ? (
          <ProjectsBrowser projects={projects} />
        ) : (
          <div className="grid gap-8 border-y border-line py-14 md:grid-cols-12">
            <p className="text-xl leading-snug md:col-span-7 md:text-2xl">
              I&rsquo;m writing up case studies now. If you&rsquo;d like to see relevant work before
              they&rsquo;re published, ask and I&rsquo;ll walk you through it.
            </p>
            <div className="flex flex-wrap items-start gap-3 md:col-span-5 md:justify-end">
              <Link href="/contact" className="btn btn-primary">
                Ask for examples
              </Link>
              <a href={site.socials[0].href} target="_blank" rel="noopener noreferrer" className="btn">
                GitHub
              </a>
            </div>
          </div>
        )}
      </section>
    </SiteFrame>
  );
}
