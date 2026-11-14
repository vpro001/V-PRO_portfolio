import type { ReactNode } from "react";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";

/** Header + main + footer for every public page. */
export default function SiteFrame({ children, cta = true }: { children: ReactNode; cta?: boolean }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter cta={cta} />
    </div>
  );
}
