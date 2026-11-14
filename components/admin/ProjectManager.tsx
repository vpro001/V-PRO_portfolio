"use client";

import { ExternalLink, Loader2, Pencil, Plus, Star, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/client";
import SafeImage from "@/components/site/SafeImage";
import type { ProjectDTO } from "@/lib/types";

const statuses = ["Live", "In development", "Completed", "Archived"];

export default function ProjectManager({ projects }: { projects: ProjectDTO[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<ProjectDTO | "new" | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

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

  const current = editing && editing !== "new" ? editing : null;

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const payload = { ...Object.fromEntries(data), featured: data.get("featured") === "on" };
    run(
      "save",
      () =>
        current
          ? api(`/api/admin/projects/${current.id}`, "PUT", payload)
          : api("/api/admin/projects", "POST", payload),
      () => setEditing(null)
    );
  }

  return (
    <>
      {error && (
        <p className="notice notice-error mb-4" role="alert">
          {error}
        </p>
      )}

      {editing ? (
        <form key={current?.id || "new"} onSubmit={onSubmit} className="panel mb-8 space-y-5 p-6 md:p-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              {current ? `Edit ${current.name}` : "New project"}
            </h2>
            <button type="button" onClick={() => setEditing(null)} className="btn btn-icon btn-sm" aria-label="Close form">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="p-name" className="label">Name</label>
              <input id="p-name" name="name" required maxLength={120} defaultValue={current?.name} className="field" autoFocus />
            </div>
            <div>
              <label htmlFor="p-category" className="label">Category</label>
              <input id="p-category" name="category" maxLength={60} defaultValue={current?.category} className="field" placeholder="Web app, API, Platform…" />
            </div>
          </div>

          <div>
            <label htmlFor="p-description" className="label">Description</label>
            <textarea id="p-description" name="description" required rows={3} maxLength={2000} defaultValue={current?.description} className="field" aria-describedby="p-description-hint" />
            <p id="p-description-hint" className="hint">What it does, who it&rsquo;s for, and your part in it. Two sentences is plenty.</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="p-link" className="label">Live link <span className="font-normal text-dim">(optional)</span></label>
              <input id="p-link" name="link" type="url" defaultValue={current?.link} className="field" placeholder="https://…" />
            </div>
            <div>
              <label htmlFor="p-image" className="label">Screenshot URL <span className="font-normal text-dim">(optional)</span></label>
              <input id="p-image" name="imageUrl" type="url" defaultValue={current?.imageUrl} className="field" placeholder="https://…" />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="p-tech" className="label">Technologies</label>
              <input id="p-tech" name="technologies" defaultValue={current?.technologies.join(", ")} className="field" placeholder="Laravel, MySQL, Tailwind CSS" aria-describedby="p-tech-hint" />
              <p id="p-tech-hint" className="hint">Separate with commas.</p>
            </div>
            <div>
              <label htmlFor="p-status" className="label">Status</label>
              <select id="p-status" name="status" defaultValue={current?.status || statuses[0]} className="field">
                {[...new Set([...(current?.status ? [current.status] : []), ...statuses])].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex min-h-11 items-center gap-3 text-sm">
            <input type="checkbox" name="featured" defaultChecked={current?.featured} className="h-4 w-4 accent-(--accent)" />
            Feature on the homepage
          </label>

          <div className="flex gap-2">
            <button type="submit" disabled={busy === "save"} className="btn btn-primary">
              {busy === "save" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {current ? "Save project" : "Add project"}
            </button>
            <button type="button" onClick={() => setEditing(null)} className="btn">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button type="button" onClick={() => setEditing("new")} className="btn btn-primary mb-8">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add project
        </button>
      )}

      {projects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line-strong px-6 py-14 text-center">
          <p className="font-display text-2xl font-semibold tracking-tight">Your portfolio is empty</p>
          <p className="mx-auto mt-3 max-w-md text-dim">
            Add the projects you&rsquo;re proudest of. Featured ones appear on the homepage; all of
            them appear on the Work page.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <li key={project.id} className="panel flex gap-4 p-4">
              <div className="h-20 w-28 shrink-0 overflow-hidden rounded-md border border-line bg-sunk">
                <SafeImage src={project.imageUrl} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate font-medium">
                    {project.featured && (
                      <Star className="mr-1.5 inline h-3.5 w-3.5 -translate-y-px fill-accent text-accent" aria-label="Featured" />
                    )}
                    {project.name}
                  </p>
                </div>
                <p className="text-xs text-dim">
                  {project.category} · {project.status}
                </p>
                <p className="mt-1.5 line-clamp-1 text-sm text-dim">{project.description}</p>
                <div className="mt-3 flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(project);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="btn btn-sm"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    Edit
                  </button>
                  {project.link && (
                    <a href={project.link} target="_blank" rel="noopener noreferrer" className="btn btn-icon btn-sm" aria-label={`Open ${project.name}`}>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  <button
                    type="button"
                    disabled={Boolean(busy)}
                    onClick={() => {
                      if (window.confirm(`Delete “${project.name}” from your portfolio?`)) {
                        run(`delete-${project.id}`, () => api(`/api/admin/projects/${project.id}`, "DELETE"));
                      }
                    }}
                    className="btn btn-icon btn-sm btn-danger"
                    aria-label={`Delete ${project.name}`}
                  >
                    {busy === `delete-${project.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
