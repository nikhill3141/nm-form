const buckets = new Map<string, { count: number; resetAt: number }>();

type RateLimitInput = {
  key: string;
  limit: number;
  windowMs: number;
  message?: string;
};

async function hitRedisBucket(key: string, windowMs: number) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return undefined;
  }

  const redisKey = `rate-limit:${key}`;
  const response = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", redisKey],
      ["PEXPIRE", redisKey, String(windowMs), "NX"],
    ]),
  });

  if (!response.ok) {
    throw new Error(`Redis rate limiter failed with ${response.status}`);
  }

  const [incrementResult] = (await response.json()) as Array<{ result: number }>;
  return Number(incrementResult?.result ?? 0);
}

function hitMemoryBucket(key: string, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return 1;
  }

  bucket.count += 1;
  return bucket.count;
}

export async function assertRateLimit({
  key,
  limit,
  windowMs,
  message = "Too many requests. Please wait a moment and try again.",
}: RateLimitInput) {
  let count: number;

  try {
    count = (await hitRedisBucket(key, windowMs)) ?? hitMemoryBucket(key, windowMs);
  } catch {
    count = hitMemoryBucket(key, windowMs);
  }

  if (count > limit) {
    throw new Error(message);
  }
}
