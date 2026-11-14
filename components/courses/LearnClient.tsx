"use client";

import {
  ArrowLeft,
  ArrowRight,
  Award,
  Check,
  Circle,
  ExternalLink,
  FileText,
  ListVideo,
  Loader2,
  PlayCircle,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Mark from "@/components/site/Mark";
import { formatMinutes, pad2 } from "@/lib/format";
import type { CourseDTO } from "@/lib/types";
import VideoPlayer from "./VideoPlayer";

interface Props {
  course: CourseDTO;
  /** Null when an admin is previewing: nothing is recorded. */
  enrollmentId: string | null;
  initialCompleted: string[];
  initialLessonId: string;
  positions: Record<string, number>;
  certificateIssued: boolean;
}

export default function LearnClient({
  course,
  enrollmentId,
  initialCompleted,
  initialLessonId,
  positions,
  certificateIssued,
}: Props) {
  const lessons = course.lessons;
  const preview = !enrollmentId;
  const [currentId, setCurrentId] = useState(initialLessonId);
  const [completed, setCompleted] = useState(() => new Set(initialCompleted));
  const [hasCertificate, setHasCertificate] = useState(certificateIssued);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [drawer, setDrawer] = useState(false);
  const lastSaved = useRef(0);

  const index = Math.max(0, lessons.findIndex((l) => l.id === currentId));
  const lesson = lessons[index];
  const previous = lessons[index - 1];
  const next = lessons[index + 1];
  const isDone = completed.has(lesson.id);
  const doneCount = lessons.filter((l) => completed.has(l.id)).length;
  const percent = lessons.length ? Math.round((doneCount / lessons.length) * 100) : 0;
  const startAt = useMemo(() => positions[lesson.id] || 0, [positions, lesson.id]);

  const go = useCallback((id: string) => {
    setCurrentId(id);
    setDrawer(false);
    setError("");
    window.history.replaceState(null, "", `?lesson=${id}`);
    window.scrollTo({ top: 0 });
  }, []);

  const post = useCallback(
    async (payload: Record<string, unknown>) => {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course.id, ...payload }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Your progress couldn't be saved.");
      return data;
    },
    [course.id]
  );

  const setLessonDone = useCallback(
    async (lessonId: string, done: boolean) => {
      if (preview) return;
      setSaving(true);
      setError("");
      try {
        const data = await post({ lessonId, completed: done });
        if (data.progress) {
          setCompleted(new Set<string>(data.progress.completedLessons));
          if (data.progress.certificateIssued) setHasCertificate(true);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Your progress couldn't be saved.");
      } finally {
        setSaving(false);
      }
    },
    [post, preview]
  );

  const savePosition = useCallback(
    (seconds: number) => {
      if (preview || Math.abs(seconds - lastSaved.current) < 8) return;
      lastSaved.current = seconds;
      post({ lessonId: lesson.id, lastPosition: seconds }).catch(() => {});
    },
    [post, preview, lesson.id]
  );

  useEffect(() => {
    lastSaved.current = 0;
  }, [currentId]);

  useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawer(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawer]);

  const lessonList = (
    <ol>
      {lessons.map((item, i) => {
        const active = item.id === lesson.id;
        const done = completed.has(item.id);
        return (
          <li key={item.id} className="border-b border-line">
            <button
              type="button"
              onClick={() => go(item.id)}
              aria-current={active ? "true" : undefined}
              className={`flex w-full items-start gap-3 px-5 py-4 text-left transition-colors ${
                active ? "bg-raised" : "hover:bg-raised/60"
              }`}
            >
              <span className="mt-0.5 shrink-0">
                {done ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-on-accent">
                    <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                  </span>
                ) : active ? (
                  <PlayCircle className="h-5 w-5 text-accent" aria-hidden="true" />
                ) : (
                  <Circle className="h-5 w-5 text-line-strong" aria-hidden="true" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block text-sm leading-snug ${active ? "font-semibold" : ""}`}>
                  {item.title}
                </span>
                <span className="eyebrow mt-1.5 block">
                  {pad2(i + 1)}
                  {item.duration > 0 ? ` · ${formatMinutes(item.duration)}` : ""}
                  {!item.hasVideo ? " · Reading" : ""}
                </span>
              </span>
              <span className="sr-only">{done ? "Completed" : "Not completed"}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );

  const sidebarHead = (
    <div className="border-b border-line px-5 py-5">
      <div className="flex items-baseline justify-between">
        <p className="eyebrow">Course content</p>
        <p className="tabular text-sm text-dim">
          {doneCount}/{lessons.length}
        </p>
      </div>
      <div className="progress mt-3" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Course progress">
        <span style={{ width: `${percent}%` }} />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-md">
        <div className="flex h-14 items-center gap-3 px-4 md:px-6">
          <Link
            href={preview ? `/admin/courses/${course.id}` : "/student/dashboard"}
            className="btn btn-icon btn-sm shrink-0"
            aria-label={preview ? "Back to course editor" : "Back to my learning"}
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <Mark className="hidden h-6 w-6 shrink-0 sm:block" />
          <p className="min-w-0 flex-1 truncate text-sm font-medium">{course.title}</p>
          {preview ? (
            <span className="tag tag-ember shrink-0">Admin preview</span>
          ) : (
            <span className="tabular shrink-0 text-sm text-dim">{percent}% complete</span>
          )}
          <button
            type="button"
            onClick={() => setDrawer(true)}
            className="btn btn-sm shrink-0 lg:hidden"
            aria-haspopup="dialog"
          >
            <ListVideo className="h-4 w-4" aria-hidden="true" />
            Lessons
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        <main id="main" className="min-w-0 flex-1">
          {lesson.videoUrl ? (
            <div className="bg-black">
              <div className="mx-auto max-w-[1280px]">
                <VideoPlayer
                  key={lesson.id}
                  url={lesson.videoUrl}
                  title={lesson.title}
                  startAt={startAt}
                  onPosition={savePosition}
                  onEnded={() => {
                    if (!completed.has(lesson.id)) setLessonDone(lesson.id, true);
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="border-b border-line bg-sunk">
              <div className="mx-auto flex max-w-4xl items-center gap-3 px-5 py-6 text-dim md:px-10">
                <FileText className="h-5 w-5 text-accent" aria-hidden="true" />
                <p className="text-sm">Reading lesson — no video for this one.</p>
              </div>
            </div>
          )}

          <div className="mx-auto max-w-4xl px-5 py-8 md:px-10 md:py-12">
            {hasCertificate && enrollmentId && (
              <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-accent/50 bg-accent/10 p-5">
                <div className="flex items-center gap-3">
                  <Award className="h-6 w-6 shrink-0 text-accent" aria-hidden="true" />
                  <p>
                    <strong className="font-semibold">Course complete.</strong>{" "}
                    <span className="text-dim">Your certificate is ready.</span>
                  </p>
                </div>
                <Link href={`/certificates/${enrollmentId}`} className="btn btn-primary btn-sm">
                  View certificate
                </Link>
              </div>
            )}

            <p className="eyebrow">
              Lesson {pad2(index + 1)} of {pad2(lessons.length)}
            </p>
            <h1 className="display mt-4 text-[clamp(2rem,5vw,3.75rem)]">{lesson.title}</h1>

            <div className="mt-8 flex flex-wrap items-center gap-3 border-y border-line py-4">
              {!preview && (
                <button
                  type="button"
                  onClick={() => setLessonDone(lesson.id, !isDone)}
                  disabled={saving}
                  aria-pressed={isDone}
                  className={`btn ${isDone ? "" : "btn-primary"}`}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  )}
                  {isDone ? "Completed — undo" : "Mark as complete"}
                </button>
              )}
              <div className="ml-auto flex gap-2">
                <button
                  type="button"
                  onClick={() => previous && go(previous.id)}
                  disabled={!previous}
                  className="btn"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sr-only sm:hidden">Previous lesson</span>
                </button>
                <button
                  type="button"
                  onClick={() => next && go(next.id)}
                  disabled={!next}
                  className={`btn ${isDone && next ? "btn-primary" : ""}`}
                >
                  <span className="hidden sm:inline">Next</span>
                  <span className="sr-only sm:hidden">Next lesson</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {error && (
              <p className="notice notice-error mt-4" role="alert">
                {error}
              </p>
            )}

            {lesson.description && (
              <div className="mt-8 max-w-2xl whitespace-pre-line text-lg leading-relaxed text-dim">
                {lesson.description}
              </div>
            )}

            {lesson.resources.length > 0 && (
              <section className="mt-10" aria-labelledby="resources">
                <h2 id="resources" className="eyebrow">
                  Resources
                </h2>
                <ul className="mt-4 border-t border-line">
                  {lesson.resources.map((resource) => (
                    <li key={resource.url} className="border-b border-line">
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between gap-4 py-4"
                      >
                        <span className="link">{resource.title}</span>
                        <ExternalLink className="h-4 w-4 text-dim group-hover:text-accent" aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </main>

        <aside
          aria-label="Course content"
          className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-[22rem] shrink-0 overflow-y-auto border-l border-line lg:block"
        >
          {sidebarHead}
          {lessonList}
        </aside>
      </div>

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Course content">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            onClick={() => setDrawer(false)}
            aria-label="Close lesson list"
          />
          <div className="absolute inset-y-0 right-0 flex w-[min(24rem,90vw)] flex-col border-l border-line bg-bg">
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-5">
              <p className="font-medium">Lessons</p>
              <button type="button" onClick={() => setDrawer(false)} className="btn btn-icon btn-sm" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="overflow-y-auto">
              {sidebarHead}
              {lessonList}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
