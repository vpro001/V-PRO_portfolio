import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import ContactForm from "@/components/site/ContactForm";
import LocalTime from "@/components/site/LocalTime";
import PageIntro from "@/components/site/PageIntro";
import SiteFrame from "@/components/site/SiteFrame";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Start a project or ask a question — get in touch with ${site.name}.`,
};

export default function ContactPage() {
  return (
    <SiteFrame cta={false}>
      <PageIntro
        eyebrow="Contact"
        title={
          <>
            Say <span className="serif-accent text-accent">hello</span>
          </>
        }
      >
        <p>
          Tell me what you&rsquo;re building. A few honest sentences are plenty — I&rsquo;ll reply
          with questions, not a sales deck.
        </p>
      </PageIntro>

      <section className="shell grid gap-12 pb-20 md:grid-cols-12 md:pb-32">
        <div className="md:col-span-7">
          <ContactForm />
        </div>

        <aside className="md:col-span-4 md:col-start-9">
          <dl className="border-t border-line">
            <div className="border-b border-line py-6">
              <dt className="eyebrow">Email</dt>
              <dd className="mt-2">
                <a href={`mailto:${site.email}`} className="link break-all text-lg">
                  {site.email}
                </a>
              </dd>
            </div>
            <div className="border-b border-line py-6">
              <dt className="eyebrow">Based in</dt>
              <dd className="mt-2 text-lg">{site.location}</dd>
              <dd className="mt-1 text-sm text-dim">
                It&rsquo;s <LocalTime /> here right now.
              </dd>
            </div>
            <div className="border-b border-line py-6">
              <dt className="eyebrow">Elsewhere</dt>
              <dd className="mt-3 space-y-2">
                {site.socials.map((social) => (
                  <a
                    key={social.href}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between text-lg"
                  >
                    <span className="link">{social.label}</span>
                    <ArrowUpRight
                      className="h-4 w-4 text-dim group-hover:text-accent"
                      aria-hidden="true"
                    />
                  </a>
                ))}
              </dd>
            </div>
          </dl>
        </aside>
      </section>
    </SiteFrame>
  );
}
