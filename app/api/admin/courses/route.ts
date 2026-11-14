import { getDb } from "@/lib/mongodb";
import { json, requireAdmin } from "@/lib/session";
import { body, courseFields } from "@/lib/validate";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (admin instanceof Response) return admin;

  const fields = courseFields(await body(request));
  if (!fields.title) return json.error("Give the course a title.");
  if (!fields.description) return json.error("Add a short description.");

  try {
    const now = new Date();
    const result = await (await getDb()).collection("courses").insertOne({
      ...fields,
      // A course with no lessons can't be published yet.
      isPublished: false,
      students: 0,
      lessons: [],
      createdAt: now,
      updatedAt: now,
    });
    return json.ok({ id: String(result.insertedId) }, 201);
  } catch (error) {
    console.error("[admin/courses]", error);
    return json.error("The course couldn't be created.", 500);
  }
}
