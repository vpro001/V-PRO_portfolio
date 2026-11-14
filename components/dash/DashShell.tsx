"use client";

import {
  Award,
  BookOpen,
  CreditCard,
  ExternalLink,
  FolderKanban,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  User,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useState, type ReactNode } from "react";
import Mark from "@/components/site/Mark";
import ThemeToggle from "@/components/site/ThemeToggle";

const icons = {
  overview: LayoutDashboard,
  courses: BookOpen,
  students: Users,
  enrollments: GraduationCap,
  payments: CreditCard,
  projects: FolderKanban,
  messages: Inbox,
  settings: Settings,
  certificates: Award,
  profile: User,
};

export interface DashNavItem {
  href: string;
  label: string;
  icon: keyof typeof icons;
  badge?: number;
  /** Match only this exact path (for index routes). */
  exact?: boolean;
}

export default function DashShell({
  area,
  userName,
  nav,
  children,
}: {
  area: string;
  userName: string;
  nav: DashNavItem[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
        <Link href="/" className="flex items-center gap-2.5">
          <Mark className="h-6 w-6" />
          <span className="font-display font-bold tracking-tight">V-PRO</span>
          <span className="eyebrow ml-1">{area}</span>
        </Link>
        <button type="button" className="btn btn-icon btn-sm lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav aria-label={`${area} navigation`} className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-0.5">
          {nav.map((item) => {
            const Icon = icons[item.icon];
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-11 items-center gap-3 rounded-md px-3 text-sm transition-colors ${
                    active ? "bg-raised font-medium text-ink" : "text-dim hover:bg-raised/60 hover:text-ink"
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${active ? "text-accent" : ""}`} aria-hidden="true" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge ? (
                    <span className="tabular rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-on-accent">
                      {item.badge}
                      <span className="sr-only"> unread</span>
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="shrink-0 border-t border-line p-3">
        <Link
          href="/"
          className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm text-dim hover:bg-raised/60 hover:text-ink"
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          View site
        </Link>
        <div className="mt-2 flex items-center gap-3 border-t border-line px-3 pt-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent font-display text-sm font-bold text-on-accent" aria-hidden="true">
            {userName.slice(0, 1).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-medium">{userName}</span>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="btn btn-icon btn-sm"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line bg-bg lg:block">{sidebar}</aside>

      <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-line bg-bg/90 px-4 backdrop-blur-md lg:h-16 lg:px-10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="btn btn-icon btn-sm lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
          >
            <Menu className="h-4 w-4" />
          </button>
          <span className="eyebrow">{area}</span>
        </div>
        <ThemeToggle />
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} aria-label="Close menu" />
          <div className="absolute inset-y-0 left-0 w-[min(17rem,85vw)] border-r border-line bg-bg">{sidebar}</div>
        </div>
      )}

      <main id="main" className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-10 lg:py-12">
        {children}
      </main>
    </div>
  );
}
