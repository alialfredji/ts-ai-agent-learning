/**
 * Budget Guard
 *
 * Tracks API usage costs and enforces budget limits.
 */

export interface CostEstimate {
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
}

export interface BudgetGuardOptions {
  maxDailySpend: number;
  alertThreshold: number; // percentage (e.g., 0.8 for 80%)
}

export class BudgetGuard {
  private dailySpend: number = 0;
  private lastReset: Date = new Date();
  private maxDailySpend: number;
  private alertThreshold: number;

  // Rough cost estimates per 1K tokens (in USD)
  private static readonly COSTS = {
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
    'claude-3-opus': { input: 0.015, output: 0.075 },
    'claude-3-sonnet': { input: 0.003, output: 0.015 },
    'gemini-pro': { input: 0.00025, output: 0.0005 },
  };

  constructor(options: BudgetGuardOptions) {
    this.maxDailySpend = options.maxDailySpend;
    this.alertThreshold = options.alertThreshold;
  }

  private resetIfNewDay(): void {
    const now = new Date();
    if (now.getDate() !== this.lastReset.getDate()) {
      this.dailySpend = 0;
      this.lastReset = now;
    }
  }

  estimateCost(model: string, inputTokens: number, outputTokens: number): CostEstimate {
    const modelKey = this.normalizeModelName(model);
    const costs = BudgetGuard.COSTS[modelKey as keyof typeof BudgetGuard.COSTS] || {
      input: 0.001,
      output: 0.002,
    };

    const estimatedCost = (inputTokens / 1000) * costs.input + (outputTokens / 1000) * costs.output;

    return {
      inputTokens,
      outputTokens,
      estimatedCost,
    };
  }

  async checkBudget(estimatedCost: number): Promise<boolean> {
    this.resetIfNewDay();

    if (this.dailySpend + estimatedCost > this.maxDailySpend) {
      console.error(
        `Budget exceeded: Current spend $${this.dailySpend.toFixed(2)}, ` +
          `estimated cost $${estimatedCost.toFixed(4)}, max daily $${this.maxDailySpend}`
      );
      return false;
    }

    const projectedSpend = this.dailySpend + estimatedCost;
    if (projectedSpend / this.maxDailySpend >= this.alertThreshold) {
      console.warn(
        `Budget alert: ${((projectedSpend / this.maxDailySpend) * 100).toFixed(1)}% of daily budget used`
      );
    }

    return true;
  }

  recordSpend(actualCost: number): void {
    this.resetIfNewDay();
    this.dailySpend += actualCost;
  }

  getRemainingBudget(): number {
    this.resetIfNewDay();
    return Math.max(0, this.maxDailySpend - this.dailySpend);
  }

  getSpendSummary() {
    this.resetIfNewDay();
    return {
      dailySpend: this.dailySpend,
      maxDailySpend: this.maxDailySpend,
      remainingBudget: this.getRemainingBudget(),
      percentageUsed: (this.dailySpend / this.maxDailySpend) * 100,
    };
  }

  private normalizeModelName(model: string): string {
    const lower = model.toLowerCase();
    if (lower.includes('gpt-4-turbo')) return 'gpt-4-turbo';
    if (lower.includes('gpt-4')) return 'gpt-4';
    if (lower.includes('gpt-3.5')) return 'gpt-3.5-turbo';
    if (lower.includes('claude-3-opus')) return 'claude-3-opus';
    if (lower.includes('claude-3-sonnet')) return 'claude-3-sonnet';
    if (lower.includes('gemini')) return 'gemini-pro';
    return model;
  }
}

/**
 * Global budget guard instance
 */
export const globalBudgetGuard = new BudgetGuard({
  maxDailySpend: parseFloat(process.env.MAX_COST_PER_DAY || '10.00'),
  alertThreshold: 0.8,
});
