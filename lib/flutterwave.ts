import { randomUUID } from "crypto";
import { Db } from "mongodb";
import { enrollUser } from "@/lib/enrollment";

const API = process.env.FLUTTERWAVE_API_URL || "https://api.flutterwave.com/v3";
export const CURRENCY = "NGN";

export function paymentsConfigured(): boolean {
  return Boolean(process.env.FLUTTERWAVE_SECRET_KEY);
}

async function flw<T = Record<string, unknown>>(
  path: string,
  init?: RequestInit
): Promise<{ status?: string; message?: string; data?: T }> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
  });
  return res.json().catch(() => ({ status: "error", message: `Flutterwave returned ${res.status}` }));
}

export interface FlwTransaction {
  id: number;
  tx_ref: string;
  status: string;
  amount: number;
  charged_amount?: number;
  currency: string;
  payment_type?: string;
  created_at?: string;
  customer?: { email?: string; name?: string; phone_number?: string };
}

/** Creates a hosted checkout link. `txRef` is ours; we look the order up by it later. */
export async function createCheckout(input: {
  amount: number;
  email: string;
  name: string;
  phone?: string;
  title: string;
  redirectUrl: string;
  logoUrl?: string;
}): Promise<{ ok: true; link: string; txRef: string } | { ok: false; error: string }> {
  const txRef = `vpro-${randomUUID()}`;
  try {
    const result = await flw<{ link?: string }>("/payments", {
      method: "POST",
      body: JSON.stringify({
        tx_ref: txRef,
        amount: input.amount,
        currency: CURRENCY,
        redirect_url: input.redirectUrl,
        customer: { email: input.email, name: input.name, phonenumber: input.phone || undefined },
        customizations: {
          title: input.title.slice(0, 100),
          description: `Enrolment: ${input.title}`.slice(0, 200),
          ...(input.logoUrl ? { logo: input.logoUrl } : {}),
        },
      }),
    });
    if (result.status === "success" && result.data?.link) {
      return { ok: true, link: result.data.link, txRef };
    }
    return { ok: false, error: result.message || "Could not start checkout" };
  } catch (error) {
    console.error("[flutterwave] createCheckout", error);
    return { ok: false, error: "The payment provider could not be reached. Please try again." };
  }
}

export async function verifyById(transactionId: string): Promise<FlwTransaction | null> {
  if (!/^\d+$/.test(transactionId)) return null;
  try {
    const result = await flw<FlwTransaction>(`/transactions/${transactionId}/verify`);
    return result.status === "success" && result.data ? result.data : null;
  } catch (error) {
    console.error("[flutterwave] verifyById", error);
    return null;
  }
}

export async function verifyByReference(txRef: string): Promise<FlwTransaction | null> {
  try {
    const result = await flw<FlwTransaction>(
      `/transactions/verify_by_reference?tx_ref=${encodeURIComponent(txRef)}`
    );
    return result.status === "success" && result.data ? result.data : null;
  } catch (error) {
    console.error("[flutterwave] verifyByReference", error);
    return null;
  }
}

export type FulfilResult =
  | { ok: true; courseId: string; alreadyProcessed: boolean }
  | { ok: false; reason: string; courseId?: string };

/**
 * Turns a transaction that Flutterwave has confirmed into a payment record and
 * an enrolment. Who is buying what comes from the order we stored at checkout
 * (matched by tx_ref), never from anything the browser sends. Idempotent.
 */
export async function fulfilTransaction(db: Db, tx: FlwTransaction): Promise<FulfilResult> {
  const order = await db.collection("payment_initializations").findOne({ txRef: tx.tx_ref });
  if (!order) return { ok: false, reason: "We couldn't match this payment to an order." };

  const courseId = String(order.courseId);

  if (tx.status !== "successful") {
    await db
      .collection("payment_initializations")
      .updateOne({ _id: order._id }, { $set: { status: tx.status || "failed", updatedAt: new Date() } });
    return { ok: false, reason: "The payment was not completed.", courseId };
  }

  if (tx.currency !== CURRENCY || Number(tx.amount) < Number(order.amount)) {
    console.error("[flutterwave] amount mismatch", { txRef: tx.tx_ref, paid: tx.amount, due: order.amount });
    return { ok: false, reason: "The amount paid doesn't match the course price.", courseId };
  }

  const now = new Date();
  const payment = await db.collection("payments").updateOne(
    { txRef: tx.tx_ref },
    {
      $setOnInsert: {
        userId: order.userId,
        courseId: order.courseId,
        txRef: tx.tx_ref,
        // `paymentId` keeps an older unique index on this field satisfied.
        paymentId: tx.tx_ref,
        transactionId: String(tx.id),
        amount: Number(tx.amount),
        currency: tx.currency,
        status: "successful",
        paymentMethod: tx.payment_type || "flutterwave",
        customer: {
          email: tx.customer?.email || "",
          name: tx.customer?.name || "",
          phone: tx.customer?.phone_number || "",
        },
        createdAt: tx.created_at ? new Date(tx.created_at) : now,
        verifiedAt: now,
      },
    },
    { upsert: true }
  );

  await enrollUser(db, order.userId, order.courseId, { paymentRef: tx.tx_ref });
  await db
    .collection("payment_initializations")
    .updateOne(
      { _id: order._id },
      { $set: { status: "successful", transactionId: String(tx.id), verifiedAt: now } }
    );

  return { ok: true, courseId, alreadyProcessed: payment.upsertedCount === 0 };
}
