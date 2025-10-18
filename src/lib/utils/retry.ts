/**
 * Retry utility with exponential backoff
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  retryableErrors?: string[];
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  retryableErrors: [
    'rate_limit_exceeded',
    'timeout',
    'service_unavailable',
    'ECONNRESET',
    'ETIMEDOUT',
  ],
};

export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Check if error is retryable
      const isRetryable = opts.retryableErrors.some(
        (errType) =>
          lastError?.message.includes(errType) ||
          (lastError as any)?.code?.includes(errType) ||
          (lastError as any)?.type?.includes(errType)
      );

      if (!isRetryable || attempt === opts.maxRetries) {
        throw lastError;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        opts.initialDelayMs * Math.pow(opts.backoffMultiplier, attempt),
        opts.maxDelayMs
      );

      console.warn(
        `Attempt ${attempt + 1}/${opts.maxRetries + 1} failed: ${lastError.message}. ` +
          `Retrying in ${delay}ms...`
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error(lastError?.message || 'Max retries exceeded');
}
