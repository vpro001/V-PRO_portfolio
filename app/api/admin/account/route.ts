import { getDb } from "@/lib/mongodb";
import { hashPassword, verifyPassword } from "@/lib/password";
import { json, requireAdmin, toObjectId } from "@/lib/session";
import { body, EMAIL, text } from "@/lib/validate";

export async function PUT(request: Request) {
  const admin = await requireAdmin();
  if (admin instanceof Response) return admin;

  const input = await body(request);
  const _id = toObjectId(admin.id)!;

  try {
    const users = (await getDb()).collection("users");
    const account = await users.findOne({ _id });
    if (!account) return json.error("Account not found.", 404);

    const current = typeof input.currentPassword === "string" ? input.currentPassword : "";
    if (!verifyPassword(current, account.password).ok) {
      return json.error("Your current password is incorrect.", 403);
    }

    const set: Record<string, unknown> = { updatedAt: new Date() };
    const email = text(input.email, 200).toLowerCase();
    if (email) {
      if (!EMAIL.test(email)) return json.error("Please enter a valid email address.");
      set.email = email;
    }
    if (typeof input.newPassword === "string" && input.newPassword) {
      if (input.newPassword.length < 10) {
        return json.error("Admin passwords need at least 10 characters.");
      }
      set.password = hashPassword(input.newPassword);
    }

    await users.updateOne({ _id }, { $set: set });
    return json.ok({ success: true });
  } catch (error) {
    console.error("[admin/account]", error);
    return json.error("Your changes couldn't be saved.", 500);
  }
}
