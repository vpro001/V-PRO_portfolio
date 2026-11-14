"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { api } from "@/lib/client";

/**
 * One-click actions and two-step destructive ones. With `confirm`, the first
 * click arms the button ("Really delete?") and the second performs the request.
 */
export default function ActionButton({
  url,
  method,
  body,
  children,
  confirm,
  className = "btn btn-sm",
  redirectTo,
  label,
}: {
  url: string;
  method: "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  children: ReactNode;
  confirm?: string;
  className?: string;
  redirectTo?: string;
  label?: string;
}) {
  const router = useRouter();
  const [armed, setArmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!armed) return;
    const id = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(id);
  }, [armed]);

  async function run() {
    if (confirm && !armed) {
      setArmed(true);
      setError("");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api(url, method, body);
      setArmed(false);
      if (redirectTo) router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That didn't work.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={run}
        disabled={busy}
        aria-label={armed ? undefined : label}
        className={armed ? "btn btn-sm btn-danger" : className}
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : armed ? confirm : children}
      </button>
      {error && (
        <span role="alert" className="max-w-[16rem] text-right text-xs text-danger">
          {error}
        </span>
      )}
    </span>
  );
}
