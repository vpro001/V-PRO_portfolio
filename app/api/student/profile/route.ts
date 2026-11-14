import { getDb } from "@/lib/mongodb";
import { hashPassword, verifyPassword } from "@/lib/password";
import { json, requireUser, toObjectId } from "@/lib/session";
import { body, EMAIL, text } from "@/lib/validate";

export async function PUT(request: Request) {
  const user = await requireUser();
  if (user instanceof Response) return user;
  if (user.role !== "student") return json.error("Students only.", 403);

  const input = await body(request);
  const _id = toObjectId(user.id)!;

  try {
    const students = (await getDb()).collection("students");
    const student = await students.findOne({ _id });
    if (!student) return json.error("Account not found.", 404);

    const set: Record<string, unknown> = { updatedAt: new Date() };

    if (input.profile !== undefined) {
      const firstName = text(input.firstName, 60);
      const lastName = text(input.lastName, 60);
      const email = text(input.email, 200).toLowerCase();
      if (!firstName || !lastName) return json.error("First and last name are required.");
      if (!EMAIL.test(email)) return json.error("Please enter a valid email address.");
      if (email !== student.email && (await students.findOne({ email, _id: { $ne: _id } }))) {
        return json.error("Another account already uses that email.", 409);
      }
      Object.assign(set, {
        email,
        "profile.firstName": firstName,
        "profile.lastName": lastName,
        "profile.phone": text(input.phone, 30),
        "profile.country": text(input.country, 60),
        "profile.bio": text(input.bio, 600),
      });
    }

    if (input.newPassword !== undefined) {
      const next = typeof input.newPassword === "string" ? input.newPassword : "";
      const current = typeof input.currentPassword === "string" ? input.currentPassword : "";
      if (!verifyPassword(current, student.password).ok) {
        return json.error("Your current password is incorrect.", 403);
      }
      if (next.length < 8) return json.error("New passwords need at least 8 characters.");
      set.password = hashPassword(next);
    }

    await students.updateOne({ _id }, { $set: set });
    return json.ok({ success: true });
  } catch (error) {
    console.error("[student/profile]", error);
    return json.error("Your changes couldn't be saved.", 500);
  }
}
