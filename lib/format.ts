export function formatNaira(amount: number): string {
  if (!Number.isFinite(amount) || amount <= 0) return "Free";
  return `₦${new Intl.NumberFormat("en-NG", { maximumFractionDigits: 2 }).format(amount)}`;
}

export function formatMoney(amount: number, currency = "NGN"): string {
  const value = new Intl.NumberFormat("en-NG", { maximumFractionDigits: 2 }).format(amount || 0);
  return currency === "NGN" ? `₦${value}` : `${currency} ${value}`;
}

export function formatDate(value?: string | Date | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateLong(value?: string | Date | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

/** 95 → "1h 35m" */
export function formatMinutes(minutes: number): string {
  const total = Math.max(0, Math.round(minutes || 0));
  if (!total) return "—";
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (!h) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}
