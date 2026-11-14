import { Db, Document, ObjectId, WithId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { toObjectId } from "@/lib/session";
import type { CourseDTO, CourseLevel, EnrollmentDTO, LessonDTO, ProjectDTO } from "@/lib/types";

const iso = (value: unknown): string => {
  if (!value) return "";
  const date = new Date(value as string);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
};

const strings = (value: unknown): string[] =>
  Array.isArray(value) ? value.map((v) => String(v ?? "").trim()).filter(Boolean) : [];

const num = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

/* ------------------------------- courses -------------------------------- */

export function serializeLesson(lesson: Document, withVideo: boolean): LessonDTO {
  const videoUrl = typeof lesson.videoUrl === "string" ? lesson.videoUrl.trim() : "";
  return {
    id: String(lesson._id ?? ""),
    title: String(lesson.title ?? "Untitled lesson"),
    description: String(lesson.description ?? ""),
    duration: num(lesson.duration),
    order: num(lesson.order),
    isPublished: lesson.isPublished !== false,
    hasVideo: Boolean(videoUrl),
    ...(withVideo && videoUrl ? { videoUrl } : {}),
    resources: Array.isArray(lesson.resources)
      ? lesson.resources
          .map((r: Document) => ({ title: String(r?.title ?? ""), url: String(r?.url ?? "") }))
          .filter((r: { title: string; url: string }) => r.title && r.url)
      : [],
  };
}

export function serializeCourse(
  course: Document,
  opts: { withVideo?: boolean; includeDrafts?: boolean } = {}
): CourseDTO {
  const lessons = (Array.isArray(course.lessons) ? course.lessons : [])
    .map((l: Document) => serializeLesson(l, Boolean(opts.withVideo)))
    .filter((l: LessonDTO) => opts.includeDrafts || l.isPublished)
    .sort((a: LessonDTO, b: LessonDTO) => a.order - b.order);

  const level = ["beginner", "intermediate", "advanced"].includes(course.level)
    ? (course.level as CourseLevel)
    : "beginner";

  return {
    id: String(course._id),
    title: String(course.title ?? "Untitled course"),
    description: String(course.description ?? ""),
    thumbnail: String(course.thumbnail ?? ""),
    previewVideoUrl: String(course.previewVideoUrl ?? ""),
    category: String(course.category ?? "General"),
    price: num(course.price),
    originalPrice: num(course.originalPrice),
    level,
    language: String(course.language ?? "English"),
    students: num(course.students),
    lessons,
    requirements: strings(course.requirements),
    objectives: strings(course.objectives),
    isPublished: Boolean(course.isPublished),
    totalMinutes: lessons.reduce((sum: number, l: LessonDTO) => sum + l.duration, 0),
    createdAt: iso(course.createdAt),
    updatedAt: iso(course.updatedAt),
  };
}

/** Older seed data may hold lessons without ids; progress tracking needs them. */
async function ensureLessonIds(db: Db, course: WithId<Document>) {
  const lessons: Document[] = Array.isArray(course.lessons) ? course.lessons : [];
  if (!lessons.some((l) => !l._id)) return course;
  const fixed = lessons.map((l) => (l._id ? l : { ...l, _id: new ObjectId() }));
  await db.collection("courses").updateOne({ _id: course._id }, { $set: { lessons: fixed } });
  return { ...course, lessons: fixed };
}

export async function findCourse(id: string): Promise<WithId<Document> | null> {
  const _id = toObjectId(id);
  if (!_id) return null;
  const db = await getDb();
  const course = await db.collection("courses").findOne({ _id });
  return course ? ensureLessonIds(db, course) : null;
}

export async function listPublishedCourses(limit = 0): Promise<CourseDTO[]> {
  const db = await getDb();
  const cursor = db.collection("courses").find({ isPublished: true }).sort({ createdAt: -1 });
  if (limit) cursor.limit(limit);
  return (await cursor.toArray()).map((c) => serializeCourse(c));
}

export async function listAllCourses(): Promise<CourseDTO[]> {
  const db = await getDb();
  const courses = await db.collection("courses").find({}).sort({ createdAt: -1 }).toArray();
  return courses.map((c) => serializeCourse(c, { includeDrafts: true }));
}

/* ------------------------------ enrollments ------------------------------ */

export function serializeEnrollment(e: Document): EnrollmentDTO {
  return {
    id: String(e._id),
    courseId: String(e.courseId),
    progress: Math.min(100, num(e.progress)),
    completedLessons: Array.isArray(e.completedLessons) ? e.completedLessons.map(String) : [],
    enrolledAt: iso(e.enrolledAt),
    lastAccessedAt: iso(e.lastAccessedAt),
    completedAt: iso(e.completedAt),
    certificateIssued: Boolean(e.certificate?.issued),
    certificateIssuedAt: iso(e.certificate?.issuedAt),
  };
}

export async function findEnrollment(userId: string, courseId: string) {
  const u = toObjectId(userId);
  const c = toObjectId(courseId);
  if (!u || !c) return null;
  const db = await getDb();
  const enrollment = await db.collection("enrollments").findOne({ userId: u, courseId: c });
  return enrollment ? serializeEnrollment(enrollment) : null;
}

export interface MyCourse {
  enrollment: EnrollmentDTO;
  course: CourseDTO;
  nextLessonId: string;
}

export async function listMyCourses(userId: string): Promise<MyCourse[]> {
  const u = toObjectId(userId);
  if (!u) return [];
  const db = await getDb();
  const enrollments = await db
    .collection("enrollments")
    .find({ userId: u })
    .sort({ lastAccessedAt: -1, enrolledAt: -1 })
    .toArray();
  if (!enrollments.length) return [];

  const courses = await db
    .collection("courses")
    .find({ _id: { $in: enrollments.map((e) => e.courseId) } })
    .toArray();
  const byId = new Map(courses.map((c) => [String(c._id), c]));

  return enrollments.flatMap((e) => {
    const doc = byId.get(String(e.courseId));
    if (!doc) return [];
    const course = serializeCourse(doc);
    const enrollment = serializeEnrollment(e);
    const done = new Set(enrollment.completedLessons);
    const next = course.lessons.find((l) => !done.has(l.id)) || course.lessons[0];
    return [{ enrollment, course, nextLessonId: next?.id || "" }];
  });
}

/* -------------------------------- projects ------------------------------- */

export function serializeProject(p: Document): ProjectDTO {
  return {
    id: String(p._id),
    name: String(p.name ?? "Untitled"),
    imageUrl: String(p.imageUrl ?? ""),
    link: String(p.link ?? ""),
    status: String(p.status ?? ""),
    description: String(p.description ?? ""),
    technologies: strings(p.technologies),
    category: String(p.category ?? "Project"),
    featured: Boolean(p.featured),
    createdAt: iso(p.createdAt),
  };
}

export async function listProjects(): Promise<ProjectDTO[]> {
  const db = await getDb();
  const projects = await db
    .collection("projects")
    .find({})
    .sort({ featured: -1, createdAt: -1 })
    .toArray();
  return projects.map(serializeProject);
}

/** Public pages should render even when the database is unreachable. */
export async function safely<T>(query: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await query();
  } catch (error) {
    console.error("[data]", error instanceof Error ? error.message : error);
    return fallback;
  }
}
