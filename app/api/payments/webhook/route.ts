import { timingSafeEqual } from "crypto";
import { fulfilTransaction, verifyById } from "@/lib/flutterwave";
import { getDb } from "@/lib/mongodb";
import { json } from "@/lib/session";

/**
 * Flutterwave webhook. Set the same "secret hash" in the Flutterwave dashboard
 * and in FLUTTERWAVE_SECRET_HASH. It's the safety net for buyers who close the
 * tab before being redirected back to the site.
 */
export async function POST(request: Request) {
  const secret = process.env.FLUTTERWAVE_SECRET_HASH;
  const received = request.headers.get("verif-hash") || "";
  if (!secret) return json.error("Webhook is not configured", 503);

  const a = Buffer.from(received);
  const b = Buffer.from(secret);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return json.error("Invalid signature", 401);

  let payload: { event?: string; data?: { id?: number | string } };
  try {
    payload = await request.json();
  } catch {
    return json.error("Invalid payload");
  }

  if (payload.event !== "charge.completed" || !payload.data?.id) return json.ok({ received: true });

  try {
    // Never trust the webhook body for amounts — ask Flutterwave directly.
    const tx = await verifyById(String(payload.data.id));
    if (!tx) return json.error("Could not verify transaction", 502);

    const result = await fulfilTransaction(await getDb(), tx);
    if (!result.ok) console.warn("[webhook] not fulfilled:", result.reason);
    return json.ok({ received: true });
  } catch (error) {
    console.error("[webhook]", error);
    return json.error("Webhook processing failed", 500);
  }
}
