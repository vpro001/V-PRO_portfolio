"use client";

import { ArrowRight, Check, Loader2 } from "lucide-react";
import { useState } from "react";

const topics = ["A new project", "An existing product", "Courses & mentorship", "Something else"];

export default function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setState("sending");
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      form.reset();
      setState("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setState("idle");
    }
  }

  if (state === "sent") {
    return (
      <div className="panel p-8 md:p-12" role="status">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-on-accent">
          <Check className="h-6 w-6" aria-hidden="true" />
        </span>
        <h2 className="display mt-8 text-4xl md:text-5xl">Message received.</h2>
        <p className="mt-4 max-w-md text-dim">
          Thanks for writing. I read everything myself and usually reply within a day or two.
        </p>
        <button type="button" onClick={() => setState("idle")} className="btn mt-8">
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="panel space-y-6 p-6 md:p-10" noValidate={false}>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="label">
            Your name
          </label>
          <input id="contact-name" name="name" required maxLength={100} autoComplete="name" className="field" />
        </div>
        <div>
          <label htmlFor="contact-email" className="label">
            Email
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="field"
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-topic" className="label">
          What&rsquo;s this about?
        </label>
        <select id="contact-topic" name="topic" className="field" defaultValue={topics[0]}>
          {topics.map((topic) => (
            <option key={topic}>{topic}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="contact-message" className="label">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={7}
          className="field"
          placeholder="What are you building, where is it now, and when do you need it?"
        />
      </div>

      {/* Honeypot — hidden from people, tempting for bots. */}
      <div className="hidden" aria-hidden="true">
        <label>
          Company
          <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {error && (
        <p className="notice notice-error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" disabled={state === "sending"} className="btn btn-primary w-full sm:w-auto">
        {state === "sending" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Sending…
          </>
        ) : (
          <>
            Send message
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </>
        )}
      </button>
    </form>
  );
}
