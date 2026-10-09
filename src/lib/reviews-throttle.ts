// Server-only usage: this module retains timestamps and an in-flight request,
// never settled Places content. This is NOT a deployment-wide Vercel quota.
export function createReviewsThrottle(now = Date.now) {
  let nextAttemptAt = 0;
  let pending: Promise<unknown> | undefined;
  return async function run<T>(operation: () => Promise<T>, intervalMs: number): Promise<T | null> {
    if (pending) return pending as Promise<T>;
    if (now() < nextAttemptAt) return null;
    nextAttemptAt = now() + intervalMs;
    pending = Promise.resolve().then(operation);
    try { return await pending as T; }
    finally { pending = undefined; }
  };
}

export const runReviewsRequest = createReviewsThrottle();

export function reviewsIntervalMs(value: string | undefined) {
  const seconds = Number(value);
  return (Number.isFinite(seconds) && seconds >= 60 ? seconds : 86400) * 1000;
}
