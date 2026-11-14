import { createCheckout, paymentsConfigured } from "@/lib/flutterwave";
import { getDb } from "@/lib/mongodb";
import { json, requireUser, toObjectId } from "@/lib/session";
import { body } from "@/lib/validate";

export async function POST(request: Request) {
  const user = await requireUser();
  if (user instanceof Response) return user;
  if (user.role !== "student") return json.error("Sign in with a student account to enrol.", 403);

  const courseId = toObjectId((await body(request)).courseId);
  if (!courseId) return json.error("Unknown course.");
  const userId = toObjectId(user.id)!;

  try {
    const db = await getDb();
    const course = await db.collection("courses").findOne({ _id: courseId, isPublished: true });
    if (!course) return json.error("Course not found.", 404);

    const price = Number(course.price) || 0;
    if (price <= 0) return json.error("This course is free — no payment needed.");

    if (await db.collection("enrollments").findOne({ userId, courseId })) {
      return json.ok({ alreadyEnrolled: true });
    }

    if (!paymentsConfigured()) {
      return json.error(
        "Online payment isn't switched on yet. Please get in touch and I'll enrol you manually.",
        503
      );
    }

    const student = await db.collection("students").findOne({ _id: userId });
    if (!student) return json.error("Account not found. Please sign in again.", 401);

    const origin = (process.env.NEXTAUTH_URL || new URL(request.url).origin).replace(/\/$/, "");
    const checkout = await createCheckout({
      amount: price,
      email: student.email,
      name: user.name,
      phone: student.profile?.phone,
      title: course.title,
      redirectUrl: `${origin}/courses/${courseId}/payment/success`,
      logoUrl: origin.startsWith("https://") ? `${origin}/logo.png` : undefined,
    });
    if (!checkout.ok) return json.error(checkout.error, 502);

    await db.collection("payment_initializations").insertOne({
      userId,
      courseId,
      txRef: checkout.txRef,
      amount: price,
      currency: "NGN",
      status: "initialized",
      createdAt: new Date(),
    });

    return json.ok({ paymentUrl: checkout.link });
  } catch (error) {
    console.error("[payments/initialize]", error);
    return json.error("Checkout couldn't be started. Please try again.", 500);
  }
}
