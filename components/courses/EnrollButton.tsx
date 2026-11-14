"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatNaira } from "@/lib/format";

export type Viewer = "guest" | "student" | "enrolled" | "admin";

/** The one call-to-action on a course page; what it does depends on who is looking. */
export default function EnrollButton({
  courseId,
  price,
  viewer,
  started,
}: {
  courseId: string;
  price: number;
  viewer: Viewer;
  started?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const learnHref = `/courses/${courseId}/learn`;

  if (viewer === "enrolled") {
    return (
      <Link href={learnHref} className="btn btn-primary w-full">
        {started ? "Continue learning" : "Start the course"}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    );
  }

  if (viewer === "admin") {
    return (
      <div className="space-y-2">
        <Link href={learnHref} className="btn btn-primary w-full">
          Preview as a student
        </Link>
        <Link href={`/admin/courses/${courseId}`} className="btn w-full">
          Edit course
        </Link>
      </div>
    );
  }

  if (viewer === "guest") {
    const callback = encodeURIComponent(`/courses/${courseId}`);
    return (
      <div className="space-y-3">
        <Link href={`/auth/signup?callbackUrl=${callback}`} className="btn btn-primary w-full">
          {price > 0 ? `Enrol — ${formatNaira(price)}` : "Enrol for free"}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <p className="text-center text-sm text-dim">
          Already have an account?{" "}
          <Link href={`/auth/signin?callbackUrl=${callback}`} className="link text-ink">
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  async function enrol() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(price > 0 ? "/api/payments/initialize" : "/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");

      if (data.paymentUrl) {
        window.location.assign(data.paymentUrl);
        return; // keep the spinner while the browser leaves for checkout
      }
      router.push(learnHref);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <button type="button" onClick={enrol} disabled={busy} className="btn btn-primary w-full">
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            {price > 0 ? "Opening secure checkout…" : "Enrolling…"}
          </>
        ) : (
          <>
            {price > 0 ? `Enrol — ${formatNaira(price)}` : "Enrol for free"}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </>
        )}
      </button>
      {error && (
        <p className="notice notice-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
