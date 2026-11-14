import { ObjectId } from "mongodb";

export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const text = (value: unknown, max = 5000): string =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

/** Accepts an array, or text with one item per line (pass `commas` to split on commas too). */
export const list = (value: unknown, max = 40, commas = false): string[] =>
  (Array.isArray(value) ? value : typeof value === "string" ? value.split(commas ? /[\n,]/ : /\n/) : [])
    .map((v) => text(v, 300))
    .filter(Boolean)
    .slice(0, max);

export const money = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : 0;
};

/** Only http(s) links are stored, so a saved URL can never be `javascript:`. */
export const url = (value: unknown): string => {
  const v = text(value, 2000);
  if (!v) return "";
  if (v.startsWith("/") && !v.startsWith("//")) return v;
  return /^https?:\/\//i.test(v) ? v : "";
};

export async function body(request: Request): Promise<Record<string, unknown>> {
  try {
    const data = await request.json();
    return data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export function courseFields(input: Record<string, unknown>) {
  const level = ["beginner", "intermediate", "advanced"].includes(String(input.level))
    ? String(input.level)
    : "beginner";
  return {
    title: text(input.title, 160),
    description: text(input.description, 6000),
    category: text(input.category, 60) || "General",
    thumbnail: url(input.thumbnail),
    previewVideoUrl: url(input.previewVideoUrl),
    price: money(input.price),
    originalPrice: money(input.originalPrice),
    level,
    language: text(input.language, 40) || "English",
    requirements: list(input.requirements),
    objectives: list(input.objectives),
    isPublished: Boolean(input.isPublished),
  };
}

export function lessonFields(input: Record<string, unknown>) {
  const resources = (Array.isArray(input.resources) ? input.resources : [])
    .map((r) => ({ title: text((r as Record<string, unknown>)?.title, 120), url: url((r as Record<string, unknown>)?.url) }))
    .filter((r) => r.title && r.url)
    .slice(0, 20);
  return {
    title: text(input.title, 160),
    description: text(input.description, 8000),
    videoUrl: url(input.videoUrl),
    duration: Math.max(0, Math.round(Number(input.duration) || 0)),
    isPublished: input.isPublished !== false,
    resources,
  };
}

export const newId = () => new ObjectId();

export function projectFields(input: Record<string, unknown>) {
  return {
    name: text(input.name, 120),
    description: text(input.description, 2000),
    imageUrl: url(input.imageUrl),
    link: url(input.link),
    status: text(input.status, 40) || "Live",
    category: text(input.category, 60) || "Project",
    technologies: list(input.technologies, 20, true),
    featured: Boolean(input.featured),
  };
}
