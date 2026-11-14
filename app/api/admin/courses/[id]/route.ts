import { getDb } from "@/lib/mongodb";
import { json, requireAdmin, toObjectId } from "@/lib/session";
import { body, courseFields } from "@/lib/validate";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Ctx) {
  const admin = await requireAdmin();
  if (admin instanceof Response) return admin;
  const _id = toObjectId((await params).id);
  if (!_id) return json.error("Course not found.", 404);

  const input = await body(request);

  try {
    const courses = (await getDb()).collection("courses");
    const course = await courses.findOne({ _id });
    if (!course) return json.error("Course not found.", 404);

    // `{ isPublished }` on its own is the publish/unpublish toggle.
    const onlyToggle = Object.keys(input).length === 1 && "isPublished" in input;
    const fields = onlyToggle
      ? { isPublished: Boolean(input.isPublished) }
      : courseFields({ ...input, isPublished: input.isPublished ?? course.isPublished });

    if (!onlyToggle) {
      const full = fields as ReturnType<typeof courseFields>;
      if (!full.title) return json.error("Give the course a title.");
      if (!full.description) return json.error("Add a short description.");
    }

    if (fields.isPublished) {
      const live = (course.lessons || []).filter(
        (l: { isPublished?: boolean }) => l.isPublished !== false
      );
      if (!live.length) return json.error("Add at least one published lesson before publishing.");
    }

    await courses.updateOne({ _id }, { $set: { ...fields, updatedAt: new Date() } });
    return json.ok({ success: true });
  } catch (error) {
    console.error("[admin/courses]", error);
    return json.error("The course couldn't be saved.", 500);
  }
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const admin = await requireAdmin();
  if (admin instanceof Response) return admin;
  const _id = toObjectId((await params).id);
  if (!_id) return json.error("Course not found.", 404);

  try {
    const db = await getDb();
    const enrolled = await db.collection("enrollments").countDocuments({ courseId: _id });
    if (enrolled > 0) {
      return json.error(
        `${enrolled} student${enrolled === 1 ? " is" : "s are"} enrolled. Unpublish the course instead, or remove the enrolments first.`,
        409
      );
    }
    const result = await db.collection("courses").deleteOne({ _id });
    if (!result.deletedCount) return json.error("Course not found.", 404);
    await db.collection("progress").deleteMany({ courseId: _id });
    return json.ok({ success: true });
  } catch (error) {
    console.error("[admin/courses]", error);
    return json.error("The course couldn't be deleted.", 500);
  }
}
