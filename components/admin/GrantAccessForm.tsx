"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/client";

export default function GrantAccessForm({ courses }: { courses: { id: string; title: string }[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setMessage(null);
    try {
      await api("/api/admin/enrollments", "POST", Object.fromEntries(new FormData(form)));
      setMessage({ ok: true, text: "Access granted." });
      form.reset();
      router.refresh();
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : "That didn't work." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="panel p-5 md:p-6">
      <h2 className="font-display text-xl font-semibold tracking-tight">Grant access manually</h2>
      <p className="mt-1 text-sm text-dim">
        For bank transfers, scholarships or gifts. The student must already have an account.
      </p>
      <div className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <div className="min-w-0">
          <label htmlFor="grant-student" className="label">Student email or username</label>
          <input id="grant-student" name="student" required autoCapitalize="none" spellCheck={false} className="field" />
        </div>
        <div className="min-w-0">
          <label htmlFor="grant-course" className="label">Course</label>
          <select id="grant-course" name="courseId" required defaultValue="" className="field">
            <option value="" disabled>
              Choose a course
            </option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={busy || courses.length === 0} className="btn btn-primary">
          {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Grant access
        </button>
      </div>
      {message && (
        <p className={`notice mt-4 ${message.ok ? "notice-ok" : "notice-error"}`} role={message.ok ? "status" : "alert"}>
          {message.text}
        </p>
      )}
    </form>
  );
}
