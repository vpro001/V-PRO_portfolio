import Link from "next/link";
import SiteFrame from "@/components/site/SiteFrame";

export default function NotFound() {
  return (
    <SiteFrame cta={false}>
      <div className="shell flex min-h-[70dvh] flex-col justify-center py-20">
        <p className="eyebrow">Error 404</p>
        <h1 className="display mt-6 text-[clamp(4rem,16vw,15rem)]">
          Not <span className="serif-accent text-accent">here</span>
        </h1>
        <p className="mt-6 max-w-lg text-lg text-dim">
          That page doesn&rsquo;t exist, or it moved. The links below definitely work.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/" className="btn btn-primary">
            Home
          </Link>
          <Link href="/projects" className="btn">
            Work
          </Link>
          <Link href="/courses" className="btn">
            Courses
          </Link>
        </div>
      </div>
    </SiteFrame>
  );
}
