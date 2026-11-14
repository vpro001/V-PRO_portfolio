import { Document } from "mongodb";
import { findCourse } from "@/lib/data";
import { getDb } from "@/lib/mongodb";
import { json, requireAdmin } from "@/lib/session";
import { body, lessonFields, newId } from "@/lib/validate";

type Ctx = { params: Promise<{ id: string }> };

/** Add a lesson to the end of the course. */
export async function POST(request: Request, { params }: Ctx) {
  const admin = await requireAdmin();
  if (admin instanceof Response) return admin;

  const fields = lessonFields(await body(request));
  if (!fields.title) return json.error("Give the lesson a title.");

  try {
    const course = await findCourse((await params).id);
    if (!course) return json.error("Course not found.", 404);

    const lessons: Document[] = course.lessons || [];
    const lesson = {
      _id: newId(),
      ...fields,
      order: lessons.reduce((max, l) => Math.max(max, Number(l.order) || 0), 0) + 1,
    };
    await (await getDb())
      .collection("courses")
      .updateOne({ _id: course._id }, { $set: { lessons: [...lessons, lesson], updatedAt: new Date() } });
    return json.ok({ id: String(lesson._id) }, 201);
  } catch (error) {
    console.error("[admin/lessons]", error);
    return json.error("The lesson couldn't be added.", 500);
  }
}

/** Reorder: body is `{ order: [lessonId, lessonId, ...] }`. */
export async function PUT(request: Request, { params }: Ctx) {
  const admin = await requireAdmin();
  if (admin instanceof Response) return admin;

  const order = (await body(request)).order;
  if (!Array.isArray(order)) return json.error("Expected a list of lesson ids.");

  try {
    const course = await findCourse((await params).id);
    if (!course) return json.error("Course not found.", 404);

    const position = new Map(order.map((id, index) => [String(id), index]));
    const lessons = [...(course.lessons as Document[])]
      .sort(
        (a, b) =>
          (position.get(String(a._id)) ?? 1e6 + (Number(a.order) || 0)) -
          (position.get(String(b._id)) ?? 1e6 + (Number(b.order) || 0))
      )
      .map((lesson, index) => ({ ...lesson, order: index + 1 }));

    await (await getDb())
      .collection("courses")
      .updateOne({ _id: course._id }, { $set: { lessons, updatedAt: new Date() } });
    return json.ok({ success: true });
  } catch (error) {
    console.error("[admin/lessons]", error);
    return json.error("The lessons couldn't be reordered.", 500);
  }
}
