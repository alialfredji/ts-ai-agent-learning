# Evaluation Harness Template

A template for evaluating AI agents using LangSmith and Vitest.

## Features

- LangSmith integration for tracing
- Vitest for test execution
- Evaluation metrics (accuracy, latency, cost)
- Dataset management
- Regression testing

## Usage

```bash
# Create eval dataset
pnpm tsx templates/eval-harness/create-dataset.ts

# Run evaluation
pnpm tsx templates/eval-harness/run-eval.ts

# Run with Vitest
pnpm vitest templates/eval-harness

# View results in LangSmith
# https://smith.langchain.com
```

## Metrics

- **Accuracy**: Correctness of responses
- **Latency**: Response time
- **Cost**: Token usage and API costs
- **Quality**: Human eval scores (optional)

## Example Test

```typescript
import { describe, it, expect } from 'vitest';
import { runAgent } from './agent';

describe('Agent Evaluation', () => {
  it('should answer factual questions correctly', async () => {
    const result = await runAgent('What is the capital of France?');
    expect(result.toLowerCase()).toContain('paris');
  });

  it('should complete within latency budget', async () => {
    const start = Date.now();
    await runAgent('Quick question');
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(5000); // 5 seconds
  });
});
```
