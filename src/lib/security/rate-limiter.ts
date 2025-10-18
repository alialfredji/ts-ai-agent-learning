/**
 * Rate Limiter
 * 
 * Simple in-memory rate limiter for API calls.
 * For production, consider using Redis-backed rate limiting.
 */

export interface RateLimiterOptions {
  maxRequests: number;
  windowMs: number;
}

export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(options: RateLimiterOptions) {
    this.maxRequests = options.maxRequests;
    this.windowMs = options.windowMs;
  }

  async checkLimit(key: string): Promise<boolean> {
    const now = Date.now();
    const requests = this.requests.get(key) || [];

    // Remove expired timestamps
    const validRequests = requests.filter((timestamp) => now - timestamp < this.windowMs);

    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }

  async getRemainingRequests(key: string): Promise<number> {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    const validRequests = requests.filter((timestamp) => now - timestamp < this.windowMs);
    return Math.max(0, this.maxRequests - validRequests.length);
  }

  reset(key: string): void {
    this.requests.delete(key);
  }

  resetAll(): void {
    this.requests.clear();
  }
}

/**
 * Global rate limiter instance
 */
export const globalRateLimiter = new RateLimiter({
  maxRequests: parseInt(process.env.RATE_LIMIT_PER_MINUTE || '60'),
  windowMs: 60 * 1000, // 1 minute
});
