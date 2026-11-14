import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import Portrait from "@/components/site/Portrait";
import Reveal from "@/components/site/Reveal";
import SiteFrame from "@/components/site/SiteFrame";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `About ${site.name}, ${site.role.toLowerCase()} based in ${site.location}.`,
};

export default function About() {
  return (
    <SiteFrame>
      <PageIntro
        eyebrow={`About · ${site.location}`}
        title={
          <>
            Builder first, <span className="serif-accent text-accent">teacher</span> close second
          </>
        }
      />

      <section className="shell grid gap-12 pb-20 md:grid-cols-12 md:pb-32">
        <div className="md:col-span-4 lg:col-span-4">
          <div className="max-w-sm md:sticky md:top-28">
            <Portrait priority />
          </div>
        </div>

        <div className="md:col-span-8 lg:col-span-7 lg:col-start-6">
          <p className="text-2xl leading-snug md:text-[2rem] md:leading-[1.25]">{site.intro}</p>

          <div className="mt-10 space-y-5 text-lg text-dim">
            <p>
              I run {site.brandFull} as a one-person studio. That keeps things simple for the people
              I work with: you talk to the person writing the code, and the person writing the code
              has thought about your business, not just your ticket.
            </p>
            <p>
              Teaching grew out of the work. Explaining a system to someone else is the fastest way
              to find out whether you actually understand it, so I started recording what I was
              building and why. Those recordings became the courses on this site.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/contact" className="btn btn-primary">
              Work with me
            </Link>
            <Link href="/projects" className="btn">
              See the work
            </Link>
          </div>
        </div>
      </section>

      {/* Stack */}
      <section className="border-y border-line bg-sunk">
        <div className="shell py-20 md:py-28">
          <p className="eyebrow">
            <span className="text-accent">(01)</span> Toolbox
          </p>
          <h2 className="display mt-8 text-[clamp(2.5rem,7vw,6rem)]">
            What I <span className="serif-accent text-accent">reach for</span>
          </h2>
          <dl className="mt-12 border-t border-line">
            {site.stack.map((group) => (
              <Reveal key={group.group}>
                <div className="grid gap-3 border-b border-line py-7 md:grid-cols-12 md:items-baseline md:py-9">
                  <dt className="eyebrow md:col-span-3">{group.group}</dt>
                  <dd className="display flex flex-wrap gap-x-[0.3em] gap-y-1 text-3xl leading-[1.05] md:col-span-9 md:text-5xl">
                    {group.items.map((item, i) => (
                      <span key={item}>
                        {item}
                        {i < group.items.length - 1 && (
                          <span className="pl-[0.3em] text-line-strong" aria-hidden="true">
                            /
                          </span>
                        )}
                      </span>
                    ))}
                  </dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* Principles */}
      <section className="shell py-20 md:py-32">
        <p className="eyebrow">
          <span className="text-accent">(02)</span> Principles
        </p>
        <h2 className="display mt-8 max-w-4xl text-[clamp(2.5rem,7vw,6rem)]">
          How I decide what <span className="serif-accent text-accent">good</span> looks like
        </h2>
        <div className="mt-12 grid border-l border-t border-line md:grid-cols-2">
          {site.principles.map((principle, i) => (
            <Reveal key={principle.title} delay={(i % 2) * 0.08}>
              <article className="h-full border-b border-r border-line p-6 md:p-10">
                <span className="serif-accent text-5xl text-accent">{i + 1}</span>
                <h3 className="mt-6 font-display text-2xl font-semibold tracking-tight md:text-3xl">
                  {principle.title}
                </h3>
                <p className="mt-3 text-dim">{principle.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Elsewhere */}
      <section className="shell pb-20 md:pb-32">
        <p className="eyebrow">
          <span className="text-accent">(03)</span> Elsewhere
        </p>
        <ul className="mt-8 border-t border-line">
          {site.socials.map((social) => (
            <li key={social.href} className="border-b border-line">
              <a
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-6 py-6 md:py-8"
              >
                <span className="display text-4xl transition-transform duration-500 ease-out-expo group-hover:translate-x-3 md:text-6xl">
                  {social.label}
                </span>
                <span className="flex items-center gap-4">
                  <span className="eyebrow hidden sm:inline">{social.handle}</span>
                  <ArrowUpRight
                    className="h-7 w-7 text-dim transition-colors group-hover:text-accent md:h-9 md:w-9"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </SiteFrame>
  );
}
