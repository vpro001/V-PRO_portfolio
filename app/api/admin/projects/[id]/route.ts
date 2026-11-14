import { getDb } from "@/lib/mongodb";
import { json, requireAdmin, toObjectId } from "@/lib/session";
import { body, projectFields } from "@/lib/validate";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Ctx) {
  const admin = await requireAdmin();
  if (admin instanceof Response) return admin;
  const _id = toObjectId((await params).id);
  if (!_id) return json.error("Project not found.", 404);

  const fields = projectFields(await body(request));
  if (!fields.name || !fields.description) {
    return json.error("A project needs at least a name and a description.");
  }

  try {
    const result = await (await getDb())
      .collection("projects")
      .updateOne({ _id }, { $set: { ...fields, updatedAt: new Date() } });
    if (!result.matchedCount) return json.error("Project not found.", 404);
    return json.ok({ success: true });
  } catch (error) {
    console.error("[admin/projects]", error);
    return json.error("The project couldn't be saved.", 500);
  }
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const admin = await requireAdmin();
  if (admin instanceof Response) return admin;
  const _id = toObjectId((await params).id);
  if (!_id) return json.error("Project not found.", 404);

  try {
    await (await getDb()).collection("projects").deleteOne({ _id });
    return json.ok({ success: true });
  } catch (error) {
    console.error("[admin/projects]", error);
    return json.error("The project couldn't be deleted.", 500);
  }
}
