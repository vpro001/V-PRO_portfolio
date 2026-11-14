import type { ReactNode } from "react";

/** Oversized page title used at the top of every inner public page. */
export default function PageIntro({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="shell pb-12 pt-10 md:pb-20 md:pt-16">
      <p className="eyebrow animate-rise">{eyebrow}</p>
      <h1 className="display mt-6 animate-rise text-[clamp(3.25rem,11.5vw,11rem)] [animation-delay:80ms]">
        {title}
      </h1>
      {children && (
        <div className="mt-8 max-w-2xl animate-rise text-lg text-dim [animation-delay:160ms] md:mt-10 md:text-xl">
          {children}
        </div>
      )}
    </header>
  );
}
