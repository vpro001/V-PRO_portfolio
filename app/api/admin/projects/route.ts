import { getDb } from "@/lib/mongodb";
import { json, requireAdmin } from "@/lib/session";
import { body, projectFields } from "@/lib/validate";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (admin instanceof Response) return admin;

  const fields = projectFields(await body(request));
  if (!fields.name || !fields.description) {
    return json.error("A project needs at least a name and a description.");
  }

  try {
    const now = new Date();
    const result = await (await getDb())
      .collection("projects")
      .insertOne({ ...fields, createdAt: now, updatedAt: now });
    return json.ok({ id: String(result.insertedId) }, 201);
  } catch (error) {
    console.error("[admin/projects]", error);
    return json.error("The project couldn't be saved.", 500);
  }
}
