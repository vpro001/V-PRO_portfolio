import { getDb } from "@/lib/mongodb";
import { json, requireAdmin, toObjectId } from "@/lib/session";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (admin instanceof Response) return admin;
  const _id = toObjectId((await params).id);
  if (!_id) return json.error("Enrolment not found.", 404);

  try {
    const db = await getDb();
    const enrollment = await db.collection("enrollments").findOneAndDelete({ _id });
    if (!enrollment) return json.error("Enrolment not found.", 404);

    await Promise.all([
      db
        .collection("progress")
        .deleteMany({ userId: enrollment.userId, courseId: enrollment.courseId }),
      db
        .collection("courses")
        .updateOne({ _id: enrollment.courseId, students: { $gt: 0 } }, { $inc: { students: -1 } }),
    ]);
    return json.ok({ success: true });
  } catch (error) {
    console.error("[admin/enrollments]", error);
    return json.error("The enrolment couldn't be removed.", 500);
  }
}
