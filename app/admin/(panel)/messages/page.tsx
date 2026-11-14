import { Reply } from "lucide-react";
import type { Metadata } from "next";
import ActionButton from "@/components/admin/ConfirmButton";
import PageHeader, { Empty } from "@/components/dash/PageHeader";
import { getDb } from "@/lib/mongodb";

export const metadata: Metadata = { title: "Messages" };

export default async function AdminMessages() {
  const messages = await (await getDb())
    .collection("messages")
    .find({})
    .sort({ createdAt: -1 })
    .limit(300)
    .toArray();
  const unread = messages.filter((m) => !m.read).length;

  return (
    <>
      <PageHeader
        title="Messages"
        description={
          messages.length
            ? `${unread} unread of ${messages.length}, from the contact form.`
            : "Everything sent through the contact form lands here."
        }
      />

      {messages.length === 0 ? (
        <Empty title="Inbox zero">
          <p>When someone writes to you from the Contact page, you&rsquo;ll see it here.</p>
        </Empty>
      ) : (
        <ul className="space-y-4">
          {messages.map((m) => {
            const id = String(m._id);
            const subject = encodeURIComponent(`Re: ${m.topic || "Your message"}`);
            return (
              <li
                key={id}
                className={`panel p-5 md:p-6 ${m.read ? "" : "border-l-2 !border-l-accent"}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">
                      {m.name}
                      {!m.read && <span className="tag tag-accent ml-2 align-middle">New</span>}
                    </p>
                    <a href={`mailto:${m.email}`} className="link text-sm text-dim hover:text-ink">
                      {m.email}
                    </a>
                  </div>
                  <p className="eyebrow">
                    {m.topic} ·{" "}
                    {new Date(m.createdAt).toLocaleString("en-GB", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <p className="mt-4 max-w-3xl whitespace-pre-line break-words">{m.message}</p>
                <div className="mt-5 flex flex-wrap items-start gap-2">
                  <a href={`mailto:${m.email}?subject=${subject}`} className="btn btn-primary btn-sm">
                    <Reply className="h-4 w-4" aria-hidden="true" />
                    Reply by email
                  </a>
                  <ActionButton url={`/api/admin/messages/${id}`} method="PATCH" body={{ read: !m.read }}>
                    Mark as {m.read ? "unread" : "read"}
                  </ActionButton>
                  <ActionButton url={`/api/admin/messages/${id}`} method="DELETE" confirm="Delete for good?">
                    Delete
                  </ActionButton>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
