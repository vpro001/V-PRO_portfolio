import { Check, X } from "lucide-react";
import type { Metadata } from "next";
import PageHeader from "@/components/dash/PageHeader";
import { PasswordForm } from "@/components/dash/ProfileForms";
import { paymentsConfigured } from "@/lib/flutterwave";
import { getDb } from "@/lib/mongodb";
import { isHashed } from "@/lib/password";
import { requirePageUser, toObjectId } from "@/lib/session";

export const metadata: Metadata = { title: "Settings" };

export default async function AdminSettings() {
  const user = await requirePageUser("admin", "/admin/settings");
  const account = await (await getDb()).collection("users").findOne({ _id: toObjectId(user.id)! });

  const checks = [
    { ok: true, label: "Database connected", detail: "MONGODB_URI" },
    {
      ok: Boolean(process.env.NEXTAUTH_SECRET),
      label: "Session secret set",
      detail: "NEXTAUTH_SECRET",
    },
    {
      ok: Boolean(process.env.NEXTAUTH_URL),
      label: "Site address set",
      detail: "NEXTAUTH_URL — used for payment redirects and link previews",
    },
    {
      ok: paymentsConfigured(),
      label: "Flutterwave payments",
      detail: "FLUTTERWAVE_SECRET_KEY — needed to sell paid courses",
    },
    {
      ok: Boolean(process.env.FLUTTERWAVE_SECRET_HASH),
      label: "Flutterwave webhook",
      detail: "FLUTTERWAVE_SECRET_HASH — must match the secret hash in your Flutterwave dashboard",
    },
    {
      ok: isHashed(account?.password),
      label: "Admin password stored securely",
      detail: "Older accounts are upgraded automatically the next time you sign in",
    },
  ];

  return (
    <>
      <PageHeader title="Settings" description={`Signed in as @${user.username}.`} />

      <div className="grid max-w-3xl gap-6">
        <PasswordForm endpoint="/api/admin/account" minLength={10} withEmail={account?.email || ""} />

        <section className="panel p-6 md:p-8" aria-labelledby="health">
          <h2 id="health" className="font-display text-2xl font-semibold tracking-tight">
            Setup checklist
          </h2>
          <p className="mt-1 text-sm text-dim">
            What the site needs to run fully. Values live in your environment, never in the browser.
          </p>
          <ul className="mt-5 divide-y divide-line border-y border-line">
            {checks.map((check) => (
              <li key={check.label} className="flex items-start gap-3 py-3.5">
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                    check.ok ? "bg-accent text-on-accent" : "border border-ember text-ember"
                  }`}
                >
                  {check.ok ? (
                    <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                  ) : (
                    <X className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                  )}
                </span>
                <div>
                  <p className="font-medium">
                    {check.label}
                    <span className="sr-only">{check.ok ? " — ready" : " — not set up"}</span>
                  </p>
                  <p className="text-sm text-dim">{check.detail}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm text-dim">
            Your public copy — name, bio, services, stack and links — lives in{" "}
            <code className="font-mono text-ink">lib/site.ts</code>.
          </p>
        </section>
      </div>
    </>
  );
}
