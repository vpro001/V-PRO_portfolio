"use client";

import { ArrowDown, ArrowUp, EyeOff, FileText, Loader2, Pencil, PlayCircle, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/client";
import { formatMinutes, pad2 } from "@/lib/format";
import type { LessonDTO } from "@/lib/types";
import { parseVideo } from "@/lib/video";

type Draft = {
  title: string;
  description: string;
  videoUrl: string;
  duration: string;
  isPublished: boolean;
  resources: string;
};

const blank: Draft = { title: "", description: "", videoUrl: "", duration: "", isPublished: true, resources: "" };

const toDraft = (l: LessonDTO): Draft => ({
  title: l.title,
  description: l.description,
  videoUrl: l.videoUrl || "",
  duration: l.duration ? String(l.duration) : "",
  isPublished: l.isPublished,
  resources: l.resources.map((r) => `${r.title} | ${r.url}`).join("\n"),
});

/** "Title | https://link" per line → [{ title, url }] */
const parseResources = (text: string) =>
  text
    .split("\n")
    .map((line) => {
      const [title, ...rest] = line.split("|");
      return { title: title.trim(), url: rest.join("|").trim() };
    })
    .filter((r) => r.title && r.url);

export default function LessonManager({ courseId, lessons }: { courseId: string; lessons: LessonDTO[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null); // lesson id, or "new"
  const [draft, setDraft] = useState<Draft>(blank);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const base = `/api/admin/courses/${courseId}/lessons`;

  const open = (id: string, values: Draft) => {
    setEditing(id);
    setDraft(values);
    setError("");
  };

  async function run(key: string, task: () => Promise<unknown>, after?: () => void) {
    setBusy(key);
    setError("");
    try {
      await task();
      after?.();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That didn't work.");
    } finally {
      setBusy("");
    }
  }

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    const payload = { ...draft, duration: Number(draft.duration) || 0, resources: parseResources(draft.resources) };
    run(
      "save",
      () => (editing === "new" ? api(base, "POST", payload) : api(`${base}/${editing}`, "PUT", payload)),
      () => setEditing(null)
    );
  };

  const move = (index: number, direction: -1 | 1) => {
    const order = lessons.map((l) => l.id);
    [order[index], order[index + direction]] = [order[index + direction], order[index]];
    run(`move-${lessons[index].id}`, () => api(base, "PUT", { order }));
  };

  const videoOk = !draft.videoUrl || Boolean(parseVideo(draft.videoUrl));

  const form = (
    <form onSubmit={save} className="space-y-5 border-t border-line bg-sunk p-5 md:p-6">
      <div className="grid gap-5 sm:grid-cols-[1fr_9rem]">
        <div>
          <label htmlFor="lesson-title" className="label">Lesson title</label>
          <input id="lesson-title" required maxLength={160} autoFocus value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="field" />
        </div>
        <div>
          <label htmlFor="lesson-duration" className="label">Minutes</label>
          <input id="lesson-duration" type="number" min={0} inputMode="numeric" value={draft.duration} onChange={(e) => setDraft({ ...draft, duration: e.target.value })} className="field tabular" />
        </div>
      </div>

      <div>
        <label htmlFor="lesson-video" className="label">Video URL <span className="font-normal text-dim">(optional)</span></label>
        <input id="lesson-video" type="url" value={draft.videoUrl} onChange={(e) => setDraft({ ...draft, videoUrl: e.target.value })} className="field" placeholder="https://youtube.com/watch?v=…" aria-describedby="lesson-video-hint" aria-invalid={!videoOk} />
        <p id="lesson-video-hint" className={`hint ${videoOk ? "" : "!text-danger"}`}>
          {videoOk
            ? "YouTube (unlisted works), Vimeo, Google Drive, or a direct .mp4 link. Leave empty for a reading lesson."
            : "The player won't recognise this link. Use YouTube, Vimeo, Google Drive or a direct video file."}
        </p>
      </div>

      <div>
        <label htmlFor="lesson-notes" className="label">Notes <span className="font-normal text-dim">(optional)</span></label>
        <textarea id="lesson-notes" rows={4} maxLength={8000} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="field" />
      </div>

      <div>
        <label htmlFor="lesson-resources" className="label">Resources <span className="font-normal text-dim">(optional)</span></label>
        <textarea id="lesson-resources" rows={2} value={draft.resources} onChange={(e) => setDraft({ ...draft, resources: e.target.value })} className="field font-mono !text-sm" placeholder="Starter repo | https://github.com/…" aria-describedby="lesson-resources-hint" />
        <p id="lesson-resources-hint" className="hint">One per line, as: Title | https://link</p>
      </div>

      <label className="flex min-h-11 items-center gap-3 text-sm">
        <input type="checkbox" checked={draft.isPublished} onChange={(e) => setDraft({ ...draft, isPublished: e.target.checked })} className="h-4 w-4 accent-(--accent)" />
        Visible to students
      </label>

      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={busy === "save"} className="btn btn-primary btn-sm">
          {busy === "save" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {editing === "new" ? "Add lesson" : "Save lesson"}
        </button>
        <button type="button" onClick={() => setEditing(null)} className="btn btn-sm">
          <X className="h-4 w-4" aria-hidden="true" />
          Cancel
        </button>
      </div>
    </form>
  );

  return (
    <section aria-labelledby="lessons-heading">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="lessons-heading" className="font-display text-2xl font-semibold tracking-tight">
            Lessons
          </h2>
          <p className="mt-1 text-sm text-dim">
            {lessons.length} lesson{lessons.length === 1 ? "" : "s"}
            {lessons.length ? ` · ${formatMinutes(lessons.reduce((s, l) => s + l.duration, 0))}` : ""}
          </p>
        </div>
        {editing !== "new" && (
          <button type="button" onClick={() => open("new", blank)} className="btn btn-primary btn-sm">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add lesson
          </button>
        )}
      </div>

      {error && (
        <p className="notice notice-error mb-4" role="alert">
          {error}
        </p>
      )}

      <div className="panel overflow-hidden">
        {lessons.length === 0 && editing !== "new" && (
          <p className="px-6 py-12 text-center text-dim">
            No lessons yet. Add the first one — a course needs at least one published lesson before
            it can go live.
          </p>
        )}

        <ol>
          {lessons.map((lesson, i) => (
            <li key={lesson.id} className="border-b border-line last:border-b-0">
              <div className="flex items-center gap-3 px-4 py-3 md:px-5">
                <span className="eyebrow w-6 shrink-0">{pad2(i + 1)}</span>
                {lesson.hasVideo ? (
                  <PlayCircle className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                ) : (
                  <FileText className="h-4 w-4 shrink-0 text-dim" aria-hidden="true" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{lesson.title}</p>
                  <p className="text-xs text-dim">
                    {lesson.hasVideo ? "Video" : "Reading"}
                    {lesson.duration ? ` · ${formatMinutes(lesson.duration)}` : ""}
                    {lesson.resources.length ? ` · ${lesson.resources.length} resource${lesson.resources.length === 1 ? "" : "s"}` : ""}
                  </p>
                </div>
                {!lesson.isPublished && (
                  <span className="tag tag-ember hidden sm:inline-flex">
                    <EyeOff className="h-3 w-3" aria-hidden="true" />
                    Hidden
                  </span>
                )}
                <div className="flex shrink-0 gap-1">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0 || Boolean(busy)} className="btn btn-icon btn-sm" aria-label={`Move “${lesson.title}” up`}>
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === lessons.length - 1 || Boolean(busy)} className="btn btn-icon btn-sm" aria-label={`Move “${lesson.title}” down`}>
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => (editing === lesson.id ? setEditing(null) : open(lesson.id, toDraft(lesson)))} className="btn btn-icon btn-sm" aria-label={`Edit “${lesson.title}”`} aria-expanded={editing === lesson.id}>
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Delete “${lesson.title}”? Students' progress on it will be removed.`)) {
                        run(`delete-${lesson.id}`, () => api(`${base}/${lesson.id}`, "DELETE"));
                      }
                    }}
                    disabled={Boolean(busy)}
                    className="btn btn-icon btn-sm btn-danger"
                    aria-label={`Delete “${lesson.title}”`}
                  >
                    {busy === `delete-${lesson.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {editing === lesson.id && form}
            </li>
          ))}
        </ol>

        {editing === "new" && form}
      </div>
    </section>
  );
}
