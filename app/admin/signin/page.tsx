import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import AuthShell from "@/components/auth/AuthShell";
import SignInForm from "@/components/auth/SignInForm";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false } };

export default function AdminSignInPage() {
  return (
    <AuthShell
      kicker="Back office"
      headline={
        <>
          The <span className="serif-accent text-accent">control</span> room
        </>
      }
    >
      <p className="eyebrow">Admin</p>
      <h1 className="display mt-4 text-5xl">Sign in</h1>
      <p className="mt-3 text-dim">Manage courses, students, payments and projects.</p>
      <div className="mt-8">
        <Suspense>
          <SignInForm userType="admin" />
        </Suspense>
      </div>
      <p className="mt-8 text-sm text-dim">
        Looking for your courses?{" "}
        <Link href="/auth/signin" className="link text-ink">
          Student sign in
        </Link>
      </p>
    </AuthShell>
  );
}
