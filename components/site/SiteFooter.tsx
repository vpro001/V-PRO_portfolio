import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { site } from "@/lib/site";
import LocalTime from "./LocalTime";
import Mark from "./Mark";

export default function SiteFooter({ cta = true }: { cta?: boolean }) {
  return (
    <footer className="border-t border-line">
      {cta && (
        <section className="shell py-20 md:py-32">
          <p className="eyebrow">Have something to build?</p>
          <a
            href={`mailto:${site.email}`}
            className="group mt-6 block w-fit"
            aria-label={`Email ${site.name}`}
          >
            <span className="display block text-[clamp(3.25rem,13vw,13rem)]">
              Let&rsquo;s{" "}
              <span className="serif-accent text-accent transition-colors group-hover:text-ember">
                talk
              </span>
              <ArrowUpRight
                aria-hidden="true"
                className="ml-2 inline-block h-[0.6em] w-[0.6em] transition-transform duration-500 ease-out-expo group-hover:translate-x-[0.08em] group-hover:-translate-y-[0.08em]"
                strokeWidth={1.5}
              />
            </span>
          </a>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link href="/contact" className="btn btn-primary">
              Send a project brief
            </Link>
            <a href={`mailto:${site.email}`} className="btn break-all">
              {site.email}
            </a>
          </div>
        </section>
      )}

      <div className={cta ? "border-t border-line" : ""}>
        <div className="shell grid gap-10 py-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Link href="/" className="flex items-center gap-2.5">
              <Mark />
              <span className="font-display text-lg font-bold tracking-tight">{site.brandFull}</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-dim">
              The studio and classroom of {site.name}. {site.role}, based in {site.location}.
            </p>
          </div>

          <nav aria-label="Footer" className="md:col-span-3">
            <p className="eyebrow mb-4">Site</p>
            <ul className="space-y-2 text-sm">
              {[
                ["/projects", "Work"],
                ["/about", "About"],
                ["/courses", "Courses"],
                ["/contact", "Contact"],
                ["/auth/signin", "Student sign in"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="link text-dim hover:text-ink">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-4">
            <p className="eyebrow mb-4">Elsewhere</p>
            <ul className="space-y-2 text-sm">
              {site.socials.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 text-dim hover:text-ink"
                  >
                    <span className="link">{s.label}</span>
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="shell flex flex-wrap items-center justify-between gap-3 border-t border-line py-6">
          <p className="eyebrow">
            © {new Date().getFullYear()} {site.name}
          </p>
          <p className="eyebrow">
            {site.location} · <LocalTime />
          </p>
        </div>
      </div>
    </footer>
  );
}
