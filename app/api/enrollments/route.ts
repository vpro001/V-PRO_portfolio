import { enrollUser } from "@/lib/enrollment";
import { getDb } from "@/lib/mongodb";
import { json, requireUser, toObjectId } from "@/lib/session";
import { body } from "@/lib/validate";

/** Enrol in a free course. Paid courses go through /api/payments/initialize. */
export async function POST(request: Request) {
  const user = await requireUser();
  if (user instanceof Response) return user;
  if (user.role !== "student") return json.error("Sign in with a student account to enrol.", 403);

  const courseId = toObjectId((await body(request)).courseId);
  if (!courseId) return json.error("Unknown course.");

  try {
    const db = await getDb();
    const course = await db.collection("courses").findOne({ _id: courseId, isPublished: true });
    if (!course) return json.error("Course not found.", 404);
    if (Number(course.price) > 0) return json.error("This course requires payment.", 402);

    await enrollUser(db, toObjectId(user.id)!, courseId);
    return json.ok({ success: true });
  } catch (error) {
    console.error("[enrollments]", error);
    return json.error("We couldn't enrol you right now. Please try again.", 500);
  }
}
