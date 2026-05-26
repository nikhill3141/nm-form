const buckets = new Map<string, { count: number; resetAt: number }>();

export function assertRateLimit({
  key,
  limit,
  windowMs,
  message = "Too many requests. Please wait a moment and try again.",
}: {
  key: string;
  limit: number;
  windowMs: number;
  message?: string;
}) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (bucket.count >= limit) {
    throw new Error(message);
  }

  bucket.count += 1;
}
