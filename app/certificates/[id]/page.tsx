import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Mark from "@/components/site/Mark";
import PrintButton from "@/components/site/PrintButton";
import { displayName } from "@/lib/auth";
import { formatDateLong } from "@/lib/format";
import { getDb } from "@/lib/mongodb";
import { toObjectId } from "@/lib/session";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Certificate of completion" };

/**
 * Public certificate. The URL is the verification: if this page renders, the
 * certificate is real, because it's read straight from the enrolment record.
 */
export default async function CertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const _id = toObjectId((await params).id);
  if (!_id) notFound();

  const db = await getDb();
  const enrollment = await db.collection("enrollments").findOne({ _id });
  if (!enrollment?.certificate?.issued) notFound();

  const [course, student] = await Promise.all([
    db.collection("courses").findOne({ _id: enrollment.courseId }),
    db.collection("students").findOne({ _id: enrollment.userId }),
  ]);
  if (!course || !student) notFound();

  const serial = `VP-${String(_id).slice(-10).toUpperCase()}`;
  const issued = formatDateLong(enrollment.certificate.issuedAt || enrollment.completedAt);

  return (
    <main id="main" className="min-h-dvh bg-sunk px-4 py-8 print:bg-white print:p-0 md:py-14">
      <div className="no-print mx-auto mb-6 flex max-w-5xl flex-wrap items-center justify-between gap-4">
        <p className="flex items-center gap-2 text-sm">
          <ShieldCheck className="h-5 w-5 text-accent" aria-hidden="true" />
          <span>
            <strong className="font-semibold">Verified.</strong>{" "}
            <span className="text-dim">Issued by {site.brandFull} and confirmed against our records.</span>
          </span>
        </p>
        <div className="flex gap-2">
          <Link href="/courses" className="btn">
            Courses
          </Link>
          <PrintButton />
        </div>
      </div>

      {/* The certificate itself is always light, like paper, in either theme. */}
      <article
        data-theme="light"
        className="relative mx-auto aspect-[1.414/1] w-full max-w-5xl overflow-hidden rounded-sm border border-line-strong bg-bg text-ink shadow-2xl shadow-black/30 print:max-w-none print:rounded-none print:border-0 print:shadow-none"
      >
        <div className="absolute inset-[2.2%] border border-line-strong" aria-hidden="true" />
        <div className="absolute inset-[3%] border border-line" aria-hidden="true" />

        <div className="relative flex h-full flex-col justify-between p-[7%]">
          <header className="flex items-start justify-between">
            <div className="flex items-center gap-[0.6em] text-[clamp(0.7rem,1.6vw,1.15rem)]">
              <Mark className="h-[1.8em] w-[1.8em]" />
              <span className="font-display font-bold tracking-tight">{site.brandFull}</span>
            </div>
            <p className="font-mono text-[clamp(0.45rem,1vw,0.72rem)] uppercase tracking-[0.14em] text-dim">
              Certificate of completion
            </p>
          </header>

          <div>
            <p className="font-mono text-[clamp(0.45rem,1vw,0.72rem)] uppercase tracking-[0.14em] text-dim">
              This certifies that
            </p>
            <h1 className="serif-accent mt-[0.15em] text-[clamp(1.9rem,7.2vw,5.6rem)] leading-[1.02] text-accent">
              {displayName(student)}
            </h1>
            <p className="mt-[1.2em] font-mono text-[clamp(0.45rem,1vw,0.72rem)] uppercase tracking-[0.14em] text-dim">
              has successfully completed
            </p>
            <p className="display mt-[0.25em] max-w-[85%] text-[clamp(1.05rem,3.6vw,2.7rem)] leading-[1]">
              {course.title}
            </p>
          </div>

          <footer className="grid grid-cols-3 items-end gap-4 text-[clamp(0.5rem,1.15vw,0.85rem)]">
            <div>
              <p className="serif-accent text-[1.9em] leading-none">{site.name}</p>
              <p className="mt-[0.5em] border-t border-line-strong pt-[0.5em] text-dim">
                Instructor, {site.brandFull}
              </p>
            </div>
            <div className="text-center">
              <p className="font-semibold">{issued}</p>
              <p className="mt-[0.5em] border-t border-line-strong pt-[0.5em] text-dim">Date issued</p>
            </div>
            <div className="text-right">
              <p className="tabular font-mono font-semibold">{serial}</p>
              <p className="mt-[0.5em] border-t border-line-strong pt-[0.5em] text-dim">Certificate ID</p>
            </div>
          </footer>
        </div>
      </article>

      <p className="no-print mx-auto mt-6 max-w-5xl text-center text-sm text-dim">
        Share this page&rsquo;s address to let anyone verify the certificate.
      </p>
    </main>
  );
}
