import type { Metadata } from "next";
import PageHeader, { Empty, Stat } from "@/components/dash/PageHeader";
import { displayName } from "@/lib/auth";
import { formatDate, formatMoney } from "@/lib/format";
import { paymentsConfigured } from "@/lib/flutterwave";
import { getDb } from "@/lib/mongodb";

export const metadata: Metadata = { title: "Payments" };

const isPaid = (status: unknown) => status === "successful" || status === "completed";

export default async function AdminPayments() {
  const db = await getDb();
  const payments = await db.collection("payments").find({}).sort({ createdAt: -1 }).limit(500).toArray();
  const [students, courses] = await Promise.all([
    db.collection("students").find({ _id: { $in: payments.map((p) => p.userId) } }).project({ password: 0 }).toArray(),
    db.collection("courses").find({ _id: { $in: payments.map((p) => p.courseId) } }).project({ title: 1 }).toArray(),
  ]);
  const studentById = new Map(students.map((s) => [String(s._id), s]));
  const courseById = new Map(courses.map((c) => [String(c._id), c]));

  const paid = payments.filter((p) => isPaid(p.status));
  const total = paid.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const thisMonth = paid
    .filter((p) => new Date(p.createdAt) >= monthStart)
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const ready = paymentsConfigured();
  const webhookReady = Boolean(process.env.FLUTTERWAVE_SECRET_HASH);

  return (
    <>
      <PageHeader title="Payments" description="Every payment confirmed with Flutterwave." />

      {(!ready || !webhookReady) && (
        <div className="notice mb-6 border-ember/50 bg-ember/10">
          <p className="font-semibold text-ember">
            {ready ? "Webhook not configured" : "Online payments are switched off"}
          </p>
          <p className="mt-1 text-dim">
            {ready
              ? "Payments work, but set FLUTTERWAVE_SECRET_HASH (and the same secret hash in your Flutterwave dashboard, pointing at /api/payments/webhook) so buyers who close the tab before returning are still enrolled."
              : "Add FLUTTERWAVE_SECRET_KEY to your environment to accept card, transfer and USSD payments. Until then, paid courses show a “contact me” message and you can grant access from Enrolments."}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Stat label="Total revenue" value={formatMoney(total)} />
        <Stat label="This month" value={formatMoney(thisMonth)} />
        <Stat label="Payments" value={paid.length} />
      </div>

      <div className="mt-8">
        {payments.length === 0 ? (
          <Empty title="No payments yet">
            <p>Confirmed payments for paid courses will be listed here.</p>
          </Empty>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Reference</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => {
                  const student = studentById.get(String(p.userId));
                  return (
                    <tr key={String(p._id)}>
                      <td className="tabular whitespace-nowrap text-dim">{formatDate(p.createdAt)}</td>
                      <td>
                        <p className="font-medium">{student ? displayName(student) : p.customer?.name || "—"}</p>
                        <p className="text-xs text-dim">{student?.email || p.customer?.email}</p>
                      </td>
                      <td>{courseById.get(String(p.courseId))?.title || "Deleted course"}</td>
                      <td className="tabular whitespace-nowrap font-medium">
                        {formatMoney(Number(p.amount) || 0, p.currency || "NGN")}
                      </td>
                      <td className="capitalize text-dim">{p.paymentMethod || "—"}</td>
                      <td>
                        <span className={`tag ${isPaid(p.status) ? "tag-accent" : "tag-ember"}`}>
                          {isPaid(p.status) ? "Paid" : String(p.status || "unknown")}
                        </span>
                      </td>
                      <td className="max-w-[10rem] truncate font-mono text-xs text-dim" title={p.txRef || p.paymentId}>
                        {p.transactionId || p.txRef || p.paymentId || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
