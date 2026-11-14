"use client";

import { ArrowUpRight, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import Mark from "./Mark";
import ThemeToggle from "./ThemeToggle";

const nav = [
  { href: "/projects", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/courses", label: "Courses" },
  { href: "/contact", label: "Contact" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const account = session
    ? session.user.role === "admin"
      ? { href: "/admin", label: "Admin" }
      : { href: "/student/dashboard", label: "My learning" }
    : { href: "/auth/signin", label: "Sign in" };

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
          scrolled || open ? "border-line bg-bg/85 backdrop-blur-md" : "border-transparent"
        }`}
      >
        <div className="shell flex h-16 items-center justify-between gap-4 md:h-[4.5rem]">
          <Link href="/" className="flex items-center gap-2.5" aria-label={`${site.brand} — home`}>
            <Mark />
            <span className="font-display text-lg font-bold tracking-tight">{site.brand}</span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`rounded-full px-4 py-2 text-sm transition-colors ${
                  isActive(item.href) ? "bg-raised text-ink" : "text-dim hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href={account.href} className="btn btn-sm hidden md:inline-flex">
              {account.label}
            </Link>
            <Link href="/contact" className="btn btn-primary btn-sm hidden sm:inline-flex">
              Let&rsquo;s talk
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <button
              type="button"
              className="btn btn-icon btn-sm md:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-bg pt-16 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            transition={{ duration: 0.25 }}
          >
            <nav aria-label="Mobile" className="shell flex flex-1 flex-col justify-center py-8">
              {[{ href: "/", label: "Home" }, ...nav].map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline justify-between border-b border-line py-4"
                  >
                    <span className="display text-5xl">{item.label}</span>
                    <span className="eyebrow">0{i + 1}</span>
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="shell grid grid-cols-2 gap-3 pb-8">
              <Link href={account.href} onClick={() => setOpen(false)} className="btn">
                {account.label}
              </Link>
              <Link href="/contact" onClick={() => setOpen(false)} className="btn btn-primary">
                Let&rsquo;s talk
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
