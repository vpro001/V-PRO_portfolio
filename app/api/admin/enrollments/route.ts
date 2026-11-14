import { enrollUser } from "@/lib/enrollment";
import { getDb } from "@/lib/mongodb";
import { json, requireAdmin, toObjectId } from "@/lib/session";
import { body, text } from "@/lib/validate";

/** Give a student access by hand — for bank transfers, scholarships, etc. */
export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (admin instanceof Response) return admin;

  const input = await body(request);
  const courseId = toObjectId(input.courseId);
  const who = text(input.student, 200).toLowerCase();
  if (!courseId || !who) return json.error("Choose a course and enter the student's email or username.");

  try {
    const db = await getDb();
    const [course, student] = await Promise.all([
      db.collection("courses").findOne({ _id: courseId }),
      db.collection("students").findOne({ $or: [{ email: who }, { username: who }] }),
    ]);
    if (!course) return json.error("Course not found.", 404);
    if (!student) return json.error("No student account matches that email or username.", 404);

    const { created } = await enrollUser(db, student._id, courseId, { grantedBy: admin.username });
    if (!created) return json.error("That student is already enrolled in this course.", 409);
    return json.ok({ success: true }, 201);
  } catch (error) {
    console.error("[admin/enrollments]", error);
    return json.error("The enrolment couldn't be created.", 500);
  }
}
