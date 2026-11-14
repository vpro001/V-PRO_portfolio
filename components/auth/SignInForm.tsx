"use client";

import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

/** Only same-site paths are accepted as a post-login destination. */
function safePath(value: string | null, fallback: string) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : fallback;
}

export default function SignInForm({ userType }: { userType: "admin" | "student" }) {
  const router = useRouter();
  const params = useSearchParams();
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const destination = safePath(
    params.get("callbackUrl"),
    userType === "admin" ? "/admin" : "/student/dashboard"
  );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");

    const result = await signIn("credentials", {
      username: form.get("username"),
      password: form.get("password"),
      userType,
      redirect: false,
    });

    if (result?.ok) {
      router.push(destination);
      router.refresh();
      return;
    }
    setError(
      result?.error === "CredentialsSignin"
        ? "That username and password don't match. Check them and try again."
        : "We couldn't sign you in right now. Please try again in a moment."
    );
    setBusy(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {params.get("registered") && (
        <p className="notice notice-ok" role="status">
          Account created. Sign in to continue.
        </p>
      )}

      <div>
        <label htmlFor="username" className="label">
          {userType === "admin" ? "Username" : "Username or email"}
        </label>
        <input
          id="username"
          name="username"
          required
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          className="field"
        />
      </div>

      <div>
        <label htmlFor="password" className="label">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={show ? "text" : "password"}
            required
            autoComplete="current-password"
            className="field !pr-12"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-dim hover:text-ink"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error && (
        <p className="notice notice-error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" disabled={busy} className="btn btn-primary w-full">
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Signing in…
          </>
        ) : (
          <>
            Sign in
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </>
        )}
      </button>
    </form>
  );
}
