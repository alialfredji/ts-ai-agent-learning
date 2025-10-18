# Agent Evaluation Guide

Systematic evaluation of AI agents for quality, performance, and cost.

## Why Evaluate?

AI agents are non-deterministic and can fail in subtle ways. Evaluation helps:

1. **Ensure quality**: Validate agent responses are accurate and helpful
2. **Detect regressions**: Catch issues when code or prompts change
3. **Compare approaches**: A/B test different models, prompts, or architectures
4. **Optimize costs**: Find the best quality/cost trade-off

## Evaluation Frameworks

### LangSmith

Comprehensive evaluation platform with:

- Dataset management
- Automatic evaluation runs
- Comparison views
- Cost tracking
- CI/CD integration

### Vitest

Standard testing framework for:

- Unit tests for agent components
- Integration tests for workflows
- Regression tests

## Setting Up Evaluations

### 1. Create Evaluation Dataset

```typescript
// templates/eval-harness/create-dataset.ts

interface EvalExample {
  input: string;
  expectedOutput?: string;
  criteria: string[];
}

const evalDataset: EvalExample[] = [
  {
    input: 'What is the capital of France?',
    expectedOutput: 'Paris',
    criteria: ['factually_correct', 'concise'],
  },
  {
    input: 'Explain how RAG works',
    expectedOutput: undefined, // No exact match required
    criteria: ['comprehensive', 'technically_accurate', 'clear'],
  },
  {
    input: 'Write a haiku about AI',
    criteria: ['creative', 'follows_haiku_format'],
  },
];

export default evalDataset;
```

### 2. Define Evaluation Metrics

```typescript
interface EvalMetrics {
  accuracy: number; // 0-1
  latency: number; // milliseconds
  tokenCount: number;
  cost: number; // USD
  quality: number; // 0-1, subjective
}

// Accuracy evaluator
async function evaluateAccuracy(actual: string, expected: string): Promise<number> {
  if (!expected) return 1.0; // No expected output

  // Simple exact match
  if (actual.toLowerCase() === expected.toLowerCase()) {
    return 1.0;
  }

  // Fuzzy match
  if (actual.toLowerCase().includes(expected.toLowerCase())) {
    return 0.8;
  }

  // Use LLM as judge
  return await llmJudge(actual, expected);
}

// LLM-as-judge evaluator
async function llmJudge(actual: string, expected: string): Promise<number> {
  const provider = getModelProvider();

  const response = await provider.complete({
    messages: [
      {
        role: 'system',
        content:
          'You are an evaluation judge. Rate the similarity between two texts on a scale of 0.0 to 1.0.',
      },
      {
        role: 'user',
        content: `Expected: ${expected}\n\nActual: ${actual}\n\nRating (0.0-1.0):`,
      },
    ],
    maxTokens: 10,
    temperature: 0,
  });

  const rating = parseFloat(response.content);
  return isNaN(rating) ? 0.0 : rating;
}
```

### 3. Run Evaluations

```typescript
// templates/eval-harness/run-eval.ts

import { describe, it, expect } from 'vitest';
import evalDataset from './create-dataset.js';
import { runAgent } from './agent.js';

describe('Agent Evaluation', () => {
  const results: EvalMetrics[] = [];

  for (const example of evalDataset) {
    it(`should handle: "${example.input.substring(0, 50)}..."`, async () => {
      const startTime = Date.now();

      // Run agent
      const response = await runAgent(example.input);

      const latency = Date.now() - startTime;

      // Evaluate accuracy
      const accuracy = example.expectedOutput
        ? await evaluateAccuracy(response.content, example.expectedOutput)
        : 1.0;

      // Record metrics
      const metrics: EvalMetrics = {
        accuracy,
        latency,
        tokenCount: response.usage.totalTokens,
        cost: response.usage.totalTokens * 0.00001, // Rough estimate
        quality: accuracy, // Simplified
      };

      results.push(metrics);

      // Assertions
      expect(accuracy).toBeGreaterThan(0.7); // At least 70% accurate
      expect(latency).toBeLessThan(10000); // Under 10 seconds

      console.log('Metrics:', metrics);
    });
  }

  it('should generate summary report', () => {
    const summary = {
      total: results.length,
      avgAccuracy: average(results.map((r) => r.accuracy)),
      avgLatency: average(results.map((r) => r.latency)),
      totalCost: sum(results.map((r) => r.cost)),
      passed: results.filter((r) => r.accuracy > 0.7).length,
    };

    console.log('\n' + '='.repeat(80));
    console.log('EVALUATION SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total Examples: ${summary.total}`);
    console.log(`Average Accuracy: ${(summary.avgAccuracy * 100).toFixed(1)}%`);
    console.log(`Average Latency: ${summary.avgLatency.toFixed(0)}ms`);
    console.log(`Total Cost: $${summary.totalCost.toFixed(4)}`);
    console.log(`Pass Rate: ${((summary.passed / summary.total) * 100).toFixed(1)}%`);
    console.log('='.repeat(80) + '\n');

    // Save to file for CI
    fs.writeFileSync('eval-results/summary.json', JSON.stringify(summary, null, 2));
  });
});

function average(nums: number[]) {
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function sum(nums: number[]) {
  return nums.reduce((a, b) => a + b, 0);
}
```

## Evaluation Criteria

### Factual Accuracy

Does the agent provide correct information?

```typescript
async function evaluateFactualAccuracy(response: string): Promise<number> {
  // Check against known facts
  // Use retrieval to verify claims
  // LLM-as-judge for complex topics
  return score;
}
```

### Helpfulness

Is the response useful to the user?

```typescript
async function evaluateHelpfulness(query: string, response: string): Promise<number> {
  // Does it answer the question?
  // Is it actionable?
  // Is it comprehensive?
  return score;
}
```

### Safety

Does the agent avoid harmful outputs?

```typescript
async function evaluateSafety(response: string): Promise<boolean> {
  const harmfulPatterns = [
    /(?:how to|guide to) (?:make|create|build) (?:bomb|weapon|poison)/i,
    // Add more patterns
  ];

  return !harmfulPatterns.some((pattern) => pattern.test(response));
}
```

### Conciseness

Is the response appropriately detailed?

```typescript
function evaluateConciseness(response: string, expectedLength: number): number {
  const length = response.split(' ').length;
  const ratio = length / expectedLength;

  if (ratio > 1.5 || ratio < 0.5) {
    return 0.5; // Too verbose or too brief
  }

  return 1.0;
}
```

## A/B Testing

Compare different approaches.

### Example: Model Comparison

```typescript
const models = ['gpt-3.5-turbo', 'gpt-4', 'claude-3-opus'];

for (const model of models) {
  console.log(`\nEvaluating ${model}...`);

  const results = await runEvaluation(dataset, { model });

  console.log(`Average accuracy: ${results.avgAccuracy}`);
  console.log(`Average cost: $${results.avgCost}`);
  console.log(`Quality/cost ratio: ${results.avgAccuracy / results.avgCost}`);
}
```

### Example: Prompt Comparison

```typescript
const prompts = {
  basic: 'You are a helpful assistant.',
  detailed: 'You are a helpful assistant that provides accurate, concise answers with citations.',
  cot: 'You are a helpful assistant. Think step-by-step before answering.',
};

for (const [name, systemPrompt] of Object.entries(prompts)) {
  console.log(`\nEvaluating prompt: ${name}`);
  const results = await runEvaluation(dataset, { systemPrompt });
  console.log(`Accuracy: ${results.avgAccuracy}`);
}
```

## Regression Testing

Prevent quality degradation.

### Set Up Baseline

```bash
# Run evals and save baseline
pnpm tsx templates/eval-harness/run-eval.ts
cp eval-results/summary.json eval-results/baseline.json
```

### Compare Against Baseline

```typescript
function compareToBaseline() {
  const baseline = JSON.parse(fs.readFileSync('eval-results/baseline.json', 'utf-8'));
  const current = JSON.parse(fs.readFileSync('eval-results/summary.json', 'utf-8'));

  const accuracyDelta = current.avgAccuracy - baseline.avgAccuracy;
  const latencyDelta = current.avgLatency - baseline.avgLatency;
  const costDelta = current.totalCost - baseline.totalCost;

  console.log('Comparison to baseline:');
  console.log(`Accuracy: ${accuracyDelta > 0 ? '+' : ''}${(accuracyDelta * 100).toFixed(1)}%`);
  console.log(`Latency: ${latencyDelta > 0 ? '+' : ''}${latencyDelta.toFixed(0)}ms`);
  console.log(`Cost: ${costDelta > 0 ? '+' : ''}$${costDelta.toFixed(4)}`);

  if (accuracyDelta < -0.05) {
    console.error('❌ Accuracy regression detected!');
    process.exit(1);
  }
}
```

## LangSmith Integration

### Enable Tracing

```bash
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=...
LANGCHAIN_PROJECT=eval-runs
```

### Create Evaluation Dataset

1. Go to [smith.langchain.com](https://smith.langchain.com)
2. Create new dataset
3. Add examples manually or programmatically:

```typescript
import { Client } from 'langsmith';

const client = new Client();

// Create dataset
const dataset = await client.createDataset('agent-eval', {
  description: 'Evaluation dataset for AI agents',
});

// Add examples
for (const example of evalDataset) {
  await client.createExample(dataset.id, {
    inputs: { query: example.input },
    outputs: { expected: example.expectedOutput },
  });
}
```

### Run Evaluation

```typescript
import { runOnDataset } from 'langchain/smith';

await runOnDataset((input) => runAgent(input.query), 'agent-eval', {
  evaluationConfig: {
    evaluators: ['accuracy', 'latency', 'cost'],
  },
});
```

## CI/CD Integration

Run evaluations on every PR.

### GitHub Actions

```yaml
# .github/workflows/evals.yml
name: Agent Evaluations

on:
  pull_request:
    branches: [main]

jobs:
  evaluate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run evaluations
        run: pnpm tsx templates/eval-harness/run-eval.ts
      - name: Compare to baseline
        run: pnpm tsx templates/eval-harness/compare.ts
```

## Best Practices

1. **Diverse dataset**: Cover edge cases, common queries, and failure modes
2. **Automated evals**: Run on every code change
3. **Multiple metrics**: Don't optimize for a single metric
4. **Human review**: Spot-check results periodically
5. **Track over time**: Monitor trends, not just snapshots
6. **Cost-aware**: Balance quality and cost
7. **Realistic scenarios**: Test with production-like data

## Next Steps

- Create your evaluation dataset
- Set up automated evaluation runs
- Integrate with CI/CD
- Monitor metrics in LangSmith
- Iterate based on results
