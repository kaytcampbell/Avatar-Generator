interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  resetAt: number;
}

/**
 * In-memory only — correct within one warm serverless instance's lifetime,
 * not across horizontally-scaled instances. Real deterrence against
 * accidental loops/casual abuse, not a hard guarantee. Upgrade to Upstash
 * Redis (@upstash/ratelimit) if that gap ever matters in practice.
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, resetAt: now + windowMs };
  }

  if (existing.count >= limit) {
    return { allowed: false, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { allowed: true, resetAt: existing.resetAt };
}
