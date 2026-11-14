import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import AuthShell from "@/components/auth/AuthShell";
import SignUpForm from "@/components/auth/SignUpForm";

export const metadata: Metadata = { title: "Create an account" };

export default function SignUpPage() {
  return (
    <AuthShell
      kicker="Create a student account"
      headline={
        <>
          Start <span className="serif-accent text-accent">building</span> today
        </>
      }
    >
      <p className="eyebrow">Students</p>
      <h1 className="display mt-4 text-5xl">Create your account</h1>
      <p className="mt-3 text-dim">Free to join. You only pay for the courses you choose.</p>
      <div className="mt-8">
        <Suspense>
          <SignUpForm />
        </Suspense>
      </div>
      <p className="mt-8 text-sm text-dim">
        Already registered?{" "}
        <Link href="/auth/signin" className="link text-ink">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
