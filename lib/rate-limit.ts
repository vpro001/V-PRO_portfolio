const buckets = new Map<string, number[]>();

/** Small in-memory limiter for public forms. Returns false when over the limit. */
export function allow(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    buckets.set(key, recent);
    return false;
  }
  recent.push(now);
  buckets.set(key, recent);
  if (buckets.size > 5000) buckets.clear();
  return true;
}

export function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
