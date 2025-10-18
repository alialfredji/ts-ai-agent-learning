/**
 * Token counting utilities
 *
 * Simple approximation for token counting.
 * For production, use tiktoken or provider-specific APIs.
 */

export function estimateTokens(text: string): number {
  // Rough approximation: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

export function estimateMessagesTokens(messages: Array<{ role: string; content: string }>): number {
  let total = 0;

  for (const message of messages) {
    // Account for message formatting overhead
    total += 4; // role, name, etc.
    total += estimateTokens(message.content);
  }

  // Account for reply priming
  total += 3;

  return total;
}

export interface TokenUsageLog {
  timestamp: Date;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
}

export class TokenLogger {
  private logs: TokenUsageLog[] = [];

  log(entry: Omit<TokenUsageLog, 'timestamp'>) {
    this.logs.push({
      ...entry,
      timestamp: new Date(),
    });
  }

  getLogs(): TokenUsageLog[] {
    return [...this.logs];
  }

  getSummary() {
    const summary = {
      totalRequests: this.logs.length,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalTokens: 0,
      totalCost: 0,
      byModel: {} as Record<string, any>,
    };

    for (const log of this.logs) {
      summary.totalInputTokens += log.inputTokens;
      summary.totalOutputTokens += log.outputTokens;
      summary.totalTokens += log.totalTokens;
      summary.totalCost += log.estimatedCost;

      if (!summary.byModel[log.model]) {
        summary.byModel[log.model] = {
          requests: 0,
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
          cost: 0,
        };
      }

      const modelStats = summary.byModel[log.model];
      modelStats.requests++;
      modelStats.inputTokens += log.inputTokens;
      modelStats.outputTokens += log.outputTokens;
      modelStats.totalTokens += log.totalTokens;
      modelStats.cost += log.estimatedCost;
    }

    return summary;
  }

  clear() {
    this.logs = [];
  }
}

export const globalTokenLogger = new TokenLogger();
