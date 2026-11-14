import type { ReactNode } from "react";

export default function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-10">
      <div>
        <h1 className="display text-4xl md:text-5xl">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-dim">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Stat({ label, value, note }: { label: string; value: ReactNode; note?: ReactNode }) {
  return (
    <div className="panel p-5">
      <p className="eyebrow">{label}</p>
      <p className="tabular display mt-4 break-words text-3xl md:text-4xl">{value}</p>
      {note && <p className="mt-2 text-sm text-dim">{note}</p>}
    </div>
  );
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-line-strong px-6 py-14 text-center">
      <p className="font-display text-2xl font-semibold tracking-tight">{title}</p>
      {children && <div className="mx-auto mt-3 max-w-md text-dim">{children}</div>}
    </div>
  );
}
