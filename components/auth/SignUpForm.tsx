"use client";

import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SignUpForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const callback = params.get("callbackUrl");
  const destination =
    callback && callback.startsWith("/") && !callback.startsWith("//") ? callback : "/student/dashboard";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;
    setBusy(true);
    setError("");

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "We couldn't create your account.");

      // Sign straight in so a new student lands where they were headed.
      const result = await signIn("credentials", {
        username: values.username,
        password: values.password,
        userType: "student",
        redirect: false,
      });
      router.push(result?.ok ? destination : "/auth/signin?registered=1");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't create your account.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="label">
            First name
          </label>
          <input id="firstName" name="firstName" required maxLength={60} autoComplete="given-name" className="field" />
        </div>
        <div>
          <label htmlFor="lastName" className="label">
            Last name
          </label>
          <input id="lastName" name="lastName" required maxLength={60} autoComplete="family-name" className="field" />
        </div>
      </div>
      <p className="hint !mt-2">Your name appears on your certificates exactly as written here.</p>

      <div>
        <label htmlFor="email" className="label">
          Email
        </label>
        <input id="email" name="email" type="email" required autoComplete="email" className="field" />
      </div>

      <div>
        <label htmlFor="username" className="label">
          Username
        </label>
        <input
          id="username"
          name="username"
          required
          minLength={3}
          maxLength={30}
          pattern="[A-Za-z0-9_.\-]+"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          className="field"
          aria-describedby="username-hint"
        />
        <p id="username-hint" className="hint">
          3–30 letters, numbers, dots, dashes or underscores.
        </p>
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
            minLength={8}
            autoComplete="new-password"
            className="field !pr-12"
            aria-describedby="password-hint"
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
        <p id="password-hint" className="hint">
          At least 8 characters.
        </p>
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
            Creating your account…
          </>
        ) : (
          <>
            Create account
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </>
        )}
      </button>
    </form>
  );
}
