import { Document } from "mongodb";
import { findCourse } from "@/lib/data";
import { getDb } from "@/lib/mongodb";
import { json, requireAdmin, toObjectId } from "@/lib/session";
import { body, lessonFields } from "@/lib/validate";

type Ctx = { params: Promise<{ id: string; lessonId: string }> };

export async function PUT(request: Request, { params }: Ctx) {
  const admin = await requireAdmin();
  if (admin instanceof Response) return admin;
  const { id, lessonId } = await params;

  const fields = lessonFields(await body(request));
  if (!fields.title) return json.error("Give the lesson a title.");

  try {
    const course = await findCourse(id);
    if (!course) return json.error("Course not found.", 404);
    const lessons: Document[] = course.lessons || [];
    if (!lessons.some((l) => String(l._id) === lessonId)) return json.error("Lesson not found.", 404);

    const next = lessons.map((l) => (String(l._id) === lessonId ? { ...l, ...fields } : l));
    const stillLive = next.some((l) => l.isPublished !== false);
    await (await getDb()).collection("courses").updateOne(
      { _id: course._id },
      {
        $set: {
          lessons: next,
          updatedAt: new Date(),
          // A published course must keep at least one visible lesson.
          ...(stillLive ? {} : { isPublished: false }),
        },
      }
    );
    return json.ok({ success: true, unpublished: !stillLive && Boolean(course.isPublished) });
  } catch (error) {
    console.error("[admin/lessons]", error);
    return json.error("The lesson couldn't be saved.", 500);
  }
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const admin = await requireAdmin();
  if (admin instanceof Response) return admin;
  const { id, lessonId } = await params;
  const lessonObjectId = toObjectId(lessonId);

  try {
    const course = await findCourse(id);
    if (!course || !lessonObjectId) return json.error("Lesson not found.", 404);

    const lessons: Document[] = (course.lessons as Document[])
      .filter((l) => String(l._id) !== lessonId)
      .map((l, index) => ({ ...l, order: index + 1 }));
    const stillLive = lessons.some((l) => l.isPublished !== false);

    const db = await getDb();
    await db.collection("courses").updateOne(
      { _id: course._id },
      { $set: { lessons, updatedAt: new Date(), ...(stillLive ? {} : { isPublished: false }) } }
    );
    await db.collection("progress").deleteMany({ courseId: course._id, lessonId: lessonObjectId });
    return json.ok({ success: true });
  } catch (error) {
    console.error("[admin/lessons]", error);
    return json.error("The lesson couldn't be deleted.", 500);
  }
}
