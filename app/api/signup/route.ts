import { getDb } from "@/lib/mongodb";
import { hashPassword } from "@/lib/password";
import { allow, clientIp } from "@/lib/rate-limit";
import { json } from "@/lib/session";
import { body, EMAIL, text } from "@/lib/validate";

export async function POST(request: Request) {
  if (!allow(`signup:${clientIp(request)}`, 8, 60 * 60 * 1000)) {
    return json.error("Too many attempts. Please try again later.", 429);
  }

  const input = await body(request);
  const username = text(input.username, 30).toLowerCase();
  const email = text(input.email, 200).toLowerCase();
  const password = typeof input.password === "string" ? input.password : "";
  const firstName = text(input.firstName, 60);
  const lastName = text(input.lastName, 60);

  if (!firstName || !lastName) return json.error("Please enter your first and last name.");
  if (!/^[a-z0-9_.-]{3,30}$/.test(username)) {
    return json.error("Usernames are 3–30 characters: letters, numbers, dots, dashes or underscores.");
  }
  if (!EMAIL.test(email)) return json.error("That email address doesn't look right.");
  if (password.length < 8) return json.error("Passwords need at least 8 characters.");

  try {
    const db = await getDb();
    const students = db.collection("students");
    const clash = await students.findOne({ $or: [{ username }, { email }] });
    if (clash) {
      return json.error(
        clash.email === email
          ? "An account with that email already exists. Try signing in."
          : "That username is taken.",
        409
      );
    }

    const now = new Date();
    await students.insertOne({
      username,
      email,
      password: hashPassword(password),
      role: "student",
      profile: {
        firstName,
        lastName,
        phone: text(input.phone, 30),
        country: text(input.country, 60),
      },
      preferences: { notifications: true, emailUpdates: true, language: "English" },
      createdAt: now,
      updatedAt: now,
    });
    return json.ok({ success: true }, 201);
  } catch (error) {
    console.error("[signup]", error);
    return json.error("We couldn't create your account right now. Please try again.", 500);
  }
}
