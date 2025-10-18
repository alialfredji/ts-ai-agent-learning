# Observability Guide

Comprehensive observability setup for AI agents.

## Overview

Observability is critical for AI agents to:
- Debug complex multi-step workflows
- Track token usage and costs
- Monitor performance and latency
- Detect errors and failures
- Understand agent behavior

## Tracing with LangSmith

LangSmith provides end-to-end tracing for agent executions.

### Setup

```bash
# Enable in .env
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=lsv2_pt_...
LANGCHAIN_PROJECT=my-agents
```

### Features

- **Automatic tracing**: All LangChain calls traced
- **Token tracking**: Input/output tokens per step
- **Cost estimation**: Approximate costs
- **Error capture**: Stack traces and error messages
- **Comparison**: Compare runs side-by-side

### View Traces

1. Visit [smith.langchain.com](https://smith.langchain.com)
2. Select your project
3. Browse traces and filter by status, duration, cost

### Example

```typescript
import { getModelProvider } from '@lib/models/provider';

// Tracing is automatic when LANGCHAIN_TRACING_V2=true
const provider = getModelProvider();
const response = await provider.complete({
  messages: [/* ... */]
});

// View trace in LangSmith dashboard
```

## OpenTelemetry

For custom instrumentation and distributed tracing.

### Setup

```bash
# Start collector and Jaeger
cd infra/docker
docker-compose up -d otel-collector jaeger

# Configure in .env
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
OTEL_SERVICE_NAME=my-agent
```

### Instrumentation

```typescript
import { trace, SpanStatusCode } from '@opentelemetry/api';

const tracer = trace.getTracer('my-agent');

async function myFunction() {
  return tracer.startActiveSpan('operation-name', async (span) => {
    try {
      span.setAttribute('input', 'some-value');
      
      // Your code here
      const result = await doWork();
      
      span.setAttribute('result', result);
      span.setStatus({ code: SpanStatusCode.OK });
      
      return result;
    } catch (error) {
      span.setStatus({ 
        code: SpanStatusCode.ERROR, 
        message: (error as Error).message 
      });
      throw error;
    } finally {
      span.end();
    }
  });
}
```

### View Traces

Open Jaeger UI: http://localhost:16686

## Token Usage Tracking

Track token usage and costs across all requests.

### Setup

```typescript
import { globalTokenLogger } from '@lib/utils/token-counter';
import { globalBudgetGuard } from '@lib/security/budget-guard';

// After each request
const response = await provider.complete({ messages });

globalTokenLogger.log({
  model: provider.name,
  inputTokens: response.usage.inputTokens,
  outputTokens: response.usage.outputTokens,
  totalTokens: response.usage.totalTokens,
  estimatedCost: globalBudgetGuard.estimateCost(
    provider.name,
    response.usage.inputTokens,
    response.usage.outputTokens
  ).estimatedCost,
});
```

### View Summary

```typescript
const summary = globalTokenLogger.getSummary();

console.log('Total Requests:', summary.totalRequests);
console.log('Total Tokens:', summary.totalTokens);
console.log('Total Cost:', summary.totalCost.toFixed(4));

// By model
Object.entries(summary.byModel).forEach(([model, stats]) => {
  console.log(`\n${model}:`);
  console.log(`  Requests: ${stats.requests}`);
  console.log(`  Tokens: ${stats.totalTokens}`);
  console.log(`  Cost: $${stats.cost.toFixed(4)}`);
});
```

## Budget Monitoring

Prevent runaway costs with budget guards.

### Setup

```bash
# Enable in .env
ENABLE_BUDGET_GUARD=true
MAX_COST_PER_DAY=10.00
```

### Usage

```typescript
import { globalBudgetGuard } from '@lib/security/budget-guard';

// Check budget before request
const estimate = globalBudgetGuard.estimateCost('gpt-4', 1000, 500);
const canProceed = await globalBudgetGuard.checkBudget(estimate.estimatedCost);

if (!canProceed) {
  throw new Error('Daily budget exceeded');
}

// After request, record actual spend
globalBudgetGuard.recordSpend(actualCost);

// Get current status
const summary = globalBudgetGuard.getSpendSummary();
console.log(`Spent: $${summary.dailySpend.toFixed(2)} / $${summary.maxDailySpend}`);
console.log(`Remaining: $${summary.remainingBudget.toFixed(2)}`);
```

## Performance Monitoring

Track latency and throughput.

### Metrics to Track

1. **End-to-end latency**: Total request duration
2. **LLM latency**: Time spent in model API calls
3. **Token rate**: Tokens per second
4. **Error rate**: Failed requests / total requests
5. **Cost per request**: Average cost

### Example

```typescript
class PerformanceMonitor {
  private metrics: {
    latency: number[];
    tokenRate: number[];
    costs: number[];
  } = { latency: [], tokenRate: [], costs: [] };

  async track<T>(fn: () => Promise<T>, label: string): Promise<T> {
    const start = Date.now();
    
    try {
      const result = await fn();
      const duration = Date.now() - start;
      
      this.metrics.latency.push(duration);
      console.log(`[${label}] Duration: ${duration}ms`);
      
      return result;
    } catch (error) {
      console.error(`[${label}] Error:`, error);
      throw error;
    }
  }

  getStats() {
    const avgLatency = 
      this.metrics.latency.reduce((a, b) => a + b, 0) / this.metrics.latency.length;
    
    return {
      avgLatency: avgLatency.toFixed(2),
      p95Latency: this.percentile(this.metrics.latency, 95).toFixed(2),
      requests: this.metrics.latency.length,
    };
  }

  private percentile(arr: number[], p: number): number {
    const sorted = arr.slice().sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[index];
  }
}

const monitor = new PerformanceMonitor();

await monitor.track(async () => {
  return await provider.complete({ messages });
}, 'agent-completion');

console.log(monitor.getStats());
```

## Logging Best Practices

### Structured Logging

```typescript
interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  context?: Record<string, any>;
}

function log(level: LogEntry['level'], message: string, context?: Record<string, any>) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
  };
  
  console.log(JSON.stringify(entry));
}

// Usage
log('info', 'Agent started', { userId: '123', model: 'gpt-4' });
log('error', 'API call failed', { error: err.message, retryCount: 3 });
```

### Log Levels

- **DEBUG**: Detailed diagnostic information
- **INFO**: General informational messages
- **WARN**: Warning messages (non-critical issues)
- **ERROR**: Error messages (failures)

### What to Log

✅ **Do log**:
- Request start/completion
- Important state changes
- Errors with context
- Performance metrics
- Cost information

❌ **Don't log**:
- API keys or secrets
- Full request/response bodies (use IDs instead)
- PII (unless necessary and secured)

## Alerting

Set up alerts for critical issues.

### Alert Conditions

1. **Error rate > 5%**
2. **Latency p95 > 10s**
3. **Daily cost > 80% of budget**
4. **API rate limit errors**
5. **Database connection failures**

### Implementation

```typescript
class AlertManager {
  private thresholds = {
    errorRate: 0.05,
    latencyP95: 10000,
    budgetPercentage: 0.8,
  };

  checkErrorRate(errors: number, total: number) {
    const rate = errors / total;
    if (rate > this.thresholds.errorRate) {
      this.sendAlert('Error rate exceeded', { rate, errors, total });
    }
  }

  checkBudget(spent: number, max: number) {
    const percentage = spent / max;
    if (percentage > this.thresholds.budgetPercentage) {
      this.sendAlert('Budget threshold exceeded', { spent, max, percentage });
    }
  }

  private sendAlert(message: string, data: any) {
    console.error('[ALERT]', message, data);
    // Send to Slack, PagerDuty, etc.
  }
}
```

## Dashboards

### Grafana + Prometheus

```bash
# Add to docker-compose.yml
docker-compose up -d prometheus grafana
```

### Metrics to Display

1. **Request volume**: Requests per minute
2. **Latency distribution**: Histogram
3. **Token usage**: Time series
4. **Cost**: Cumulative daily spend
5. **Error rate**: Percentage over time

## Production Checklist

- [ ] Enable LangSmith tracing
- [ ] Set up OpenTelemetry
- [ ] Configure structured logging
- [ ] Implement budget guards
- [ ] Set up performance monitoring
- [ ] Create alerts for critical issues
- [ ] Build observability dashboard
- [ ] Document runbooks for common issues

## Next Steps

- Review [SECURITY.md](./SECURITY.md)
- Set up [EVALUATION.md](./EVALUATION.md) metrics
- Configure production monitoring
