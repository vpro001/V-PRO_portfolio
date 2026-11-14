"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/client";
import type { CourseDTO } from "@/lib/types";

/** Create a course (no `course`) or edit its details. Lessons are managed separately. */
export default function CourseForm({ course }: { course?: CourseDTO }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    setBusy(true);
    setMessage(null);
    try {
      if (course) {
        await api(`/api/admin/courses/${course.id}`, "PUT", values);
        setMessage({ ok: true, text: "Course details saved." });
        router.refresh();
      } else {
        const { id } = await api<{ id: string }>("/api/admin/courses", "POST", values);
        router.push(`/admin/courses/${id}`);
        router.refresh();
        return;
      }
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : "The course couldn't be saved." });
    }
    setBusy(false);
  }

  return (
    <form onSubmit={onSubmit} className="panel space-y-6 p-6 md:p-8">
      <div>
        <label htmlFor="title" className="label">Title</label>
        <input id="title" name="title" required maxLength={160} defaultValue={course?.title} className="field" placeholder="e.g. Laravel APIs from first route to production" />
      </div>

      <div>
        <label htmlFor="description" className="label">Description</label>
        <textarea id="description" name="description" required rows={5} maxLength={6000} defaultValue={course?.description} className="field" />
        <p className="hint">Shown at the top of the course page. Say what gets built and who it&rsquo;s for.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div>
          <label htmlFor="category" className="label">Category</label>
          <input id="category" name="category" required maxLength={60} defaultValue={course?.category} className="field" placeholder="Backend" />
        </div>
        <div>
          <label htmlFor="level" className="label">Level</label>
          <select id="level" name="level" defaultValue={course?.level || "beginner"} className="field">
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div>
          <label htmlFor="language" className="label">Language</label>
          <input id="language" name="language" maxLength={40} defaultValue={course?.language || "English"} className="field" />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="price" className="label">Price (₦)</label>
          <input id="price" name="price" type="number" min={0} step="any" inputMode="decimal" defaultValue={course?.price ?? 0} className="field tabular" aria-describedby="price-hint" />
          <p id="price-hint" className="hint">Enter 0 to make the course free.</p>
        </div>
        <div>
          <label htmlFor="originalPrice" className="label">Original price (₦) <span className="font-normal text-dim">(optional)</span></label>
          <input id="originalPrice" name="originalPrice" type="number" min={0} step="any" inputMode="decimal" defaultValue={course?.originalPrice || ""} className="field tabular" aria-describedby="original-hint" />
          <p id="original-hint" className="hint">If higher than the price, it&rsquo;s shown struck through.</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="thumbnail" className="label">Cover image URL <span className="font-normal text-dim">(optional)</span></label>
          <input id="thumbnail" name="thumbnail" type="url" defaultValue={course?.thumbnail} className="field" placeholder="https://…" aria-describedby="thumb-hint" />
          <p id="thumb-hint" className="hint">Leave empty and a cover is generated from the title.</p>
        </div>
        <div>
          <label htmlFor="previewVideoUrl" className="label">Trailer video URL <span className="font-normal text-dim">(optional)</span></label>
          <input id="previewVideoUrl" name="previewVideoUrl" type="url" defaultValue={course?.previewVideoUrl} className="field" placeholder="https://youtube.com/watch?v=…" aria-describedby="trailer-hint" />
          <p id="trailer-hint" className="hint">Public — anyone can watch it before enrolling.</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="objectives" className="label">What students will be able to do</label>
          <textarea id="objectives" name="objectives" rows={5} defaultValue={course?.objectives.join("\n")} className="field" aria-describedby="objectives-hint" />
          <p id="objectives-hint" className="hint">One per line.</p>
        </div>
        <div>
          <label htmlFor="requirements" className="label">Requirements</label>
          <textarea id="requirements" name="requirements" rows={5} defaultValue={course?.requirements.join("\n")} className="field" aria-describedby="requirements-hint" />
          <p id="requirements-hint" className="hint">One per line.</p>
        </div>
      </div>

      {message && (
        <p className={`notice ${message.ok ? "notice-ok" : "notice-error"}`} role={message.ok ? "status" : "alert"}>
          {message.text}
        </p>
      )}

      <button type="submit" disabled={busy} className="btn btn-primary">
        {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {course ? "Save details" : "Create course & add lessons"}
      </button>
    </form>
  );
}
