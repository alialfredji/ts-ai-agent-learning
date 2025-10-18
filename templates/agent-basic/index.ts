/**
 * Basic Agent Template
 * 
 * A minimal starting point for building AI agents.
 */

import { getModelProvider } from '../../src/lib/models/provider.js';
import { globalRateLimiter } from '../../src/lib/security/rate-limiter.js';
import { globalBudgetGuard } from '../../src/lib/security/budget-guard.js';

async function runAgent(userInput: string) {
  // Rate limiting check
  const canProceed = await globalRateLimiter.checkLimit('user-1');
  if (!canProceed) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  // Get model provider
  const provider = getModelProvider();

  // Budget check (optional)
  if (process.env.ENABLE_BUDGET_GUARD === 'true') {
    const estimate = globalBudgetGuard.estimateCost(
      provider.name,
      1000, // estimated input tokens
      500 // estimated output tokens
    );
    const withinBudget = await globalBudgetGuard.checkBudget(estimate.estimatedCost);
    if (!withinBudget) {
      throw new Error('Daily budget exceeded');
    }
  }

  // Generate response
  const response = await provider.complete({
    messages: [
      { role: 'system', content: 'You are a helpful AI assistant.' },
      { role: 'user', content: userInput },
    ],
    maxTokens: 500,
    temperature: 0.7,
  });

  // Record usage
  if (process.env.ENABLE_BUDGET_GUARD === 'true') {
    const actualCost = globalBudgetGuard.estimateCost(
      provider.name,
      response.usage.inputTokens,
      response.usage.outputTokens
    );
    globalBudgetGuard.recordSpend(actualCost.estimatedCost);
  }

  return response.content;
}

// Example usage
async function main() {
  const userInput = process.argv[2] || 'Hello! How can you help me?';

  console.log('🤖 Basic Agent Template\n');
  console.log(`User: ${userInput}\n`);

  const response = await runAgent(userInput);

  console.log(`Assistant: ${response}\n`);
}

main().catch(console.error);
