import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import AuthShell from "@/components/auth/AuthShell";
import SignInForm from "@/components/auth/SignInForm";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <AuthShell
      kicker="Student sign in"
      headline={
        <>
          Pick up <span className="serif-accent text-accent">where</span> you stopped
        </>
      }
    >
      <p className="eyebrow">Students</p>
      <h1 className="display mt-4 text-5xl">Welcome back</h1>
      <p className="mt-3 text-dim">Sign in to continue your courses.</p>
      <div className="mt-8">
        <Suspense>
          <SignInForm userType="student" />
        </Suspense>
      </div>
      <p className="mt-8 text-sm text-dim">
        New here?{" "}
        <Link href="/auth/signup" className="link text-ink">
          Create a free account
        </Link>
      </p>
    </AuthShell>
  );
}
