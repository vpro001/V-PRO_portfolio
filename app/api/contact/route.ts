import { getDb } from "@/lib/mongodb";
import { allow, clientIp } from "@/lib/rate-limit";
import { json } from "@/lib/session";
import { body, EMAIL, text } from "@/lib/validate";

export async function POST(request: Request) {
  if (!allow(`contact:${clientIp(request)}`, 5, 60 * 60 * 1000)) {
    return json.error("You've sent a few messages already. Please email me directly instead.", 429);
  }

  const input = await body(request);
  // Honeypot: real visitors never fill this hidden field.
  if (text(input.company)) return json.ok({ success: true });

  const name = text(input.name, 100);
  const email = text(input.email, 200).toLowerCase();
  const message = text(input.message, 5000);
  if (!name) return json.error("Please tell me your name.");
  if (!EMAIL.test(email)) return json.error("Please enter a valid email so I can reply.");
  if (message.length < 10) return json.error("Could you add a little more detail to your message?");

  try {
    const db = await getDb();
    await db.collection("messages").insertOne({
      name,
      email,
      topic: text(input.topic, 60) || "General",
      message,
      read: false,
      createdAt: new Date(),
    });
    return json.ok({ success: true }, 201);
  } catch (error) {
    console.error("[contact]", error);
    return json.error("Your message couldn't be saved. Please email me directly.", 500);
  }
}
