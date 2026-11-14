"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { api } from "@/lib/client";

function useSubmit() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const run = async (task: () => Promise<string>) => {
    setBusy(true);
    setMessage(null);
    try {
      setMessage({ ok: true, text: await task() });
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : "Something went wrong." });
    } finally {
      setBusy(false);
    }
  };
  return { busy, message, run };
}

function Feedback({ message }: { message: { ok: boolean; text: string } | null }) {
  if (!message) return null;
  return (
    <p className={`notice ${message.ok ? "notice-ok" : "notice-error"}`} role={message.ok ? "status" : "alert"}>
      {message.text}
    </p>
  );
}

function SaveButton({ busy, children }: { busy: boolean; children: React.ReactNode }) {
  return (
    <button type="submit" disabled={busy} className="btn btn-primary">
      {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}

export interface ProfileValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  bio: string;
}

export function ProfileForm({ initial }: { initial: ProfileValues }) {
  const router = useRouter();
  const { update } = useSession();
  const { busy, message, run } = useSubmit();

  return (
    <form
      className="panel space-y-5 p-6 md:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        const values = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
        run(async () => {
          await api("/api/student/profile", "PUT", { profile: true, ...values });
          await update({ name: `${values.firstName} ${values.lastName}`.trim() });
          router.refresh();
          return "Profile saved.";
        });
      }}
    >
      <h2 className="font-display text-2xl font-semibold tracking-tight">Your details</h2>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="label">First name</label>
          <input id="firstName" name="firstName" required maxLength={60} defaultValue={initial.firstName} autoComplete="given-name" className="field" />
        </div>
        <div>
          <label htmlFor="lastName" className="label">Last name</label>
          <input id="lastName" name="lastName" required maxLength={60} defaultValue={initial.lastName} autoComplete="family-name" className="field" />
        </div>
      </div>
      <p className="hint !mt-2">This is the name printed on your certificates.</p>
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" required defaultValue={initial.email} autoComplete="email" className="field" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className="label">Phone <span className="font-normal text-dim">(optional)</span></label>
          <input id="phone" name="phone" type="tel" maxLength={30} defaultValue={initial.phone} autoComplete="tel" className="field" />
        </div>
        <div>
          <label htmlFor="country" className="label">Country <span className="font-normal text-dim">(optional)</span></label>
          <input id="country" name="country" maxLength={60} defaultValue={initial.country} autoComplete="country-name" className="field" />
        </div>
      </div>
      <div>
        <label htmlFor="bio" className="label">About you <span className="font-normal text-dim">(optional)</span></label>
        <textarea id="bio" name="bio" maxLength={600} rows={3} defaultValue={initial.bio} className="field" />
      </div>
      <Feedback message={message} />
      <SaveButton busy={busy}>Save changes</SaveButton>
    </form>
  );
}

/** Used by both students and the admin; `endpoint` decides which account changes. */
export function PasswordForm({
  endpoint,
  minLength = 8,
  withEmail,
}: {
  endpoint: string;
  minLength?: number;
  withEmail?: string;
}) {
  const { busy, message, run } = useSubmit();

  return (
    <form
      className="panel space-y-5 p-6 md:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const values = Object.fromEntries(new FormData(form)) as Record<string, string>;
        run(async () => {
          if (values.newPassword !== values.confirm) throw new Error("The new passwords don't match.");
          await api(endpoint, "PUT", {
            currentPassword: values.currentPassword,
            newPassword: values.newPassword,
            ...(withEmail !== undefined ? { email: values.email } : {}),
          });
          form.querySelectorAll<HTMLInputElement>("input[type=password]").forEach((i) => (i.value = ""));
          return withEmail !== undefined ? "Account updated." : "Password changed.";
        });
      }}
    >
      <h2 className="font-display text-2xl font-semibold tracking-tight">
        {withEmail !== undefined ? "Account" : "Password"}
      </h2>
      {withEmail !== undefined && (
        <div>
          <label htmlFor="account-email" className="label">Email</label>
          <input id="account-email" name="email" type="email" defaultValue={withEmail} autoComplete="email" className="field" />
        </div>
      )}
      <div>
        <label htmlFor="currentPassword" className="label">Current password</label>
        <input id="currentPassword" name="currentPassword" type="password" required autoComplete="current-password" className="field" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="newPassword" className="label">New password</label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            required={withEmail === undefined}
            minLength={minLength}
            autoComplete="new-password"
            className="field"
          />
          <p className="hint">
            At least {minLength} characters{withEmail !== undefined ? ". Leave blank to keep your current one." : "."}
          </p>
        </div>
        <div>
          <label htmlFor="confirm" className="label">Repeat new password</label>
          <input id="confirm" name="confirm" type="password" required={withEmail === undefined} autoComplete="new-password" className="field" />
        </div>
      </div>
      <Feedback message={message} />
      <SaveButton busy={busy}>{withEmail !== undefined ? "Save account" : "Change password"}</SaveButton>
    </form>
  );
}
