import { recomputeProgress } from "@/lib/enrollment";
import { getDb } from "@/lib/mongodb";
import { json, requireUser, toObjectId } from "@/lib/session";
import { body } from "@/lib/validate";

/** Save where a learner is in a lesson and/or mark it complete. */
export async function POST(request: Request) {
  const user = await requireUser();
  if (user instanceof Response) return user;

  const input = await body(request);
  const userId = toObjectId(user.id)!;
  const courseId = toObjectId(input.courseId);
  const lessonId = toObjectId(input.lessonId);
  if (!courseId || !lessonId) return json.error("Unknown lesson.");

  try {
    const db = await getDb();
    const [course, enrollment] = await Promise.all([
      db.collection("courses").findOne({ _id: courseId }),
      db.collection("enrollments").findOne({ userId, courseId }),
    ]);
    if (!course) return json.error("Course not found.", 404);
    if (!enrollment) return json.error("You're not enrolled in this course.", 403);
    const lesson = (course.lessons || []).find(
      (l: { _id?: unknown }) => String(l._id) === String(lessonId)
    );
    if (!lesson) return json.error("Lesson not found.", 404);

    const now = new Date();
    const set: Record<string, unknown> = { updatedAt: now };
    if (typeof input.completed === "boolean") {
      set.completed = input.completed;
      set.completedAt = input.completed ? now : null;
    }
    const position = Number(input.lastPosition);
    if (Number.isFinite(position) && position >= 0) set.lastPosition = Math.floor(position);

    await db
      .collection("progress")
      .updateOne(
        { userId, courseId, lessonId },
        { $set: set, $setOnInsert: { createdAt: now } },
        { upsert: true }
      );

    if (typeof input.completed !== "boolean") {
      await db
        .collection("enrollments")
        .updateOne({ _id: enrollment._id }, { $set: { lastAccessedAt: now } });
      return json.ok({ success: true });
    }

    const progress = await recomputeProgress(db, userId, course);
    return json.ok({ success: true, progress });
  } catch (error) {
    console.error("[progress]", error);
    return json.error("Your progress couldn't be saved.", 500);
  }
}
