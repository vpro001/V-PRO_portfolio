import { getDb } from "@/lib/mongodb";
import { json, requireAdmin, toObjectId } from "@/lib/session";
import { body } from "@/lib/validate";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  const admin = await requireAdmin();
  if (admin instanceof Response) return admin;
  const _id = toObjectId((await params).id);
  if (!_id) return json.error("Message not found.", 404);

  try {
    const read = Boolean((await body(request)).read);
    await (await getDb()).collection("messages").updateOne({ _id }, { $set: { read } });
    return json.ok({ success: true });
  } catch (error) {
    console.error("[admin/messages]", error);
    return json.error("The message couldn't be updated.", 500);
  }
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const admin = await requireAdmin();
  if (admin instanceof Response) return admin;
  const _id = toObjectId((await params).id);
  if (!_id) return json.error("Message not found.", 404);

  try {
    await (await getDb()).collection("messages").deleteOne({ _id });
    return json.ok({ success: true });
  } catch (error) {
    console.error("[admin/messages]", error);
    return json.error("The message couldn't be deleted.", 500);
  }
}
