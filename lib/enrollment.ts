import { Db, Document, ObjectId } from "mongodb";

/**
 * Enrol a learner exactly once. Safe to call from the verify page and the
 * webhook at the same time — the upsert makes the second call a no-op.
 */
export async function enrollUser(
  db: Db,
  userId: ObjectId,
  courseId: ObjectId,
  extra: Document = {}
): Promise<{ created: boolean }> {
  const now = new Date();
  const result = await db.collection("enrollments").updateOne(
    { userId, courseId },
    {
      $setOnInsert: {
        userId,
        courseId,
        enrolledAt: now,
        lastAccessedAt: now,
        progress: 0,
        completedLessons: [],
        certificate: { issued: false },
        ...extra,
      },
    },
    { upsert: true }
  );

  const created = result.upsertedCount > 0;
  if (created) {
    await db.collection("courses").updateOne({ _id: courseId }, { $inc: { students: 1 } });
  }
  return { created };
}

/**
 * Recalculate a learner's progress from their per-lesson records, counting
 * only lessons that still exist and are published. Issues the certificate the
 * first time they reach 100% and never takes it back.
 */
export async function recomputeProgress(db: Db, userId: ObjectId, course: Document) {
  const courseId: ObjectId = course._id;
  const lessonIds: string[] = (Array.isArray(course.lessons) ? course.lessons : [])
    .filter((l: Document) => l._id && l.isPublished !== false)
    .map((l: Document) => String(l._id));
  const live = new Set(lessonIds);

  const records = await db
    .collection("progress")
    .find({ userId, courseId, completed: true })
    .toArray();
  const completed = [...new Set(records.map((r) => String(r.lessonId)))].filter((id) =>
    live.has(id)
  );

  const total = lessonIds.length;
  const progress = total ? Math.round((completed.length / total) * 100) : 0;
  const finished = total > 0 && completed.length === total;
  const now = new Date();

  const enrollment = await db.collection("enrollments").findOne({ userId, courseId });
  if (!enrollment) return null;

  const firstCompletion = finished && !enrollment.certificate?.issued;
  await db.collection("enrollments").updateOne(
    { _id: enrollment._id },
    {
      $set: {
        progress,
        completedLessons: completed.map((id) => new ObjectId(id)),
        lastAccessedAt: now,
        ...(finished && !enrollment.completedAt ? { completedAt: now } : {}),
        ...(firstCompletion ? { certificate: { issued: true, issuedAt: now } } : {}),
      },
    }
  );

  return {
    enrollmentId: String(enrollment._id),
    progress,
    completedLessons: completed,
    totalLessons: total,
    courseCompleted: finished,
    certificateIssued: Boolean(enrollment.certificate?.issued) || finished,
  };
}
