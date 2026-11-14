import { ArrowRight, Check, X } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import SiteFrame from "@/components/site/SiteFrame";
import { fulfilTransaction, paymentsConfigured, verifyById, verifyByReference } from "@/lib/flutterwave";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Payment", robots: { index: false } };

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string; tx_ref?: string; transaction_id?: string }>;
};

/**
 * Flutterwave sends buyers back here. Nothing in the URL is trusted: we ask
 * Flutterwave what happened to the transaction and enrol only if it was paid.
 */
async function settle(query: Awaited<Props["searchParams"]>): Promise<{ ok: boolean; message: string }> {
  if (query.status === "cancelled") {
    return { ok: false, message: "You cancelled the payment. Nothing was charged." };
  }
  if (!paymentsConfigured()) {
    return { ok: false, message: "Payments aren't configured on this site yet." };
  }
  if (!query.transaction_id && !query.tx_ref) {
    return { ok: false, message: "We didn't receive a payment reference." };
  }

  try {
    const tx =
      (query.transaction_id && (await verifyById(query.transaction_id))) ||
      (query.tx_ref && (await verifyByReference(query.tx_ref))) ||
      null;
    if (!tx) {
      return {
        ok: false,
        message:
          "We couldn't confirm this payment with Flutterwave yet. If you were charged, your access will be activated automatically within a few minutes.",
      };
    }
    const result = await fulfilTransaction(await getDb(), tx);
    return result.ok
      ? { ok: true, message: "Your payment is confirmed and you're enrolled." }
      : { ok: false, message: result.reason };
  } catch (error) {
    console.error("[payment/success]", error);
    return {
      ok: false,
      message:
        "Something went wrong while confirming your payment. If you were charged, your access will be activated automatically — or contact me and I'll sort it out.",
    };
  }
}

export default async function PaymentResultPage({ params, searchParams }: Props) {
  const { id } = await params;
  const outcome = await settle(await searchParams);

  return (
    <SiteFrame cta={false}>
      <div className="shell flex min-h-[70dvh] flex-col justify-center py-20">
        <span
          className={`flex h-14 w-14 items-center justify-center rounded-full ${
            outcome.ok ? "bg-accent text-on-accent" : "border border-danger text-danger"
          }`}
        >
          {outcome.ok ? <Check className="h-7 w-7" aria-hidden="true" /> : <X className="h-7 w-7" aria-hidden="true" />}
        </span>
        <h1 className="display mt-8 text-[clamp(3rem,9vw,8rem)]">
          {outcome.ok ? (
            <>
              You&rsquo;re <span className="serif-accent text-accent">in</span>
            </>
          ) : (
            <>
              Not <span className="serif-accent text-ember">quite</span>
            </>
          )}
        </h1>
        <p className="mt-6 max-w-xl text-lg text-dim md:text-xl" role="status">
          {outcome.message}
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          {outcome.ok ? (
            <Link href={`/courses/${id}/learn`} className="btn btn-primary">
              Start learning
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          ) : (
            <>
              <Link href={`/courses/${id}`} className="btn btn-primary">
                Back to the course
              </Link>
              <Link href="/contact" className="btn">
                Contact support
              </Link>
            </>
          )}
        </div>
      </div>
    </SiteFrame>
  );
}
