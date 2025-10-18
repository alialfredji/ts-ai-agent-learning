# Model Provider Guide

This curriculum supports multiple AI model providers through a unified abstraction layer.

## Supported Providers

- **OpenAI**: GPT-4, GPT-3.5
- **Anthropic**: Claude 3 (Opus, Sonnet, Haiku)
- **Google**: Gemini Pro

## Quick Start

### Global Configuration

Set the provider in `.env`:

```bash
MODEL_PROVIDER=openai  # or anthropic, google
```

All projects will use this provider by default.

### Per-Project Override

Override for a specific run:

```bash
MODEL_PROVIDER=anthropic pnpm tsx beginner/01-tool-calling-cli/index.ts
```

### Programmatic Usage

```typescript
import { getModelProvider, OpenAIProvider, AnthropicProvider } from '@lib/models/provider';

// Use environment default
const provider = getModelProvider();

// Or specify explicitly
const openai = new OpenAIProvider();
const claude = new AnthropicProvider('sk-ant-...', 'claude-3-opus-20240229');
const gemini = new GoogleProvider('api-key', 'gemini-pro');

// Make completion request
const response = await provider.complete({
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Hello!' },
  ],
  maxTokens: 500,
  temperature: 0.7,
});

console.log(response.content);
console.log(`Tokens used: ${response.usage.totalTokens}`);
```

## Provider Details

### OpenAI

**Models**:

- `gpt-4-turbo-preview` (default, most capable)
- `gpt-4` (stable, high quality)
- `gpt-3.5-turbo` (fast, cost-effective)

**Configuration**:

```bash
MODEL_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo-preview  # optional override
```

**Features**:

- ✅ Function calling
- ✅ Streaming
- ✅ JSON mode
- ✅ Vision (GPT-4V)

**Costs** (per 1M tokens):

- GPT-4 Turbo: $10 input / $30 output
- GPT-3.5 Turbo: $0.50 input / $1.50 output

### Anthropic (Claude)

**Models**:

- `claude-3-opus-20240229` (most capable)
- `claude-3-sonnet-20240229` (balanced)
- `claude-3-haiku-20240307` (fast, affordable)

**Configuration**:

```bash
MODEL_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-opus-20240229  # optional
```

**Features**:

- ✅ Function calling
- ✅ Streaming
- ✅ 200K context window
- ✅ Vision

**Costs** (per 1M tokens):

- Claude 3 Opus: $15 input / $75 output
- Claude 3 Sonnet: $3 input / $15 output
- Claude 3 Haiku: $0.25 input / $1.25 output

### Google (Gemini)

**Models**:

- `gemini-pro` (default)
- `gemini-pro-vision` (multimodal)

**Configuration**:

```bash
MODEL_PROVIDER=google
GOOGLE_API_KEY=...
GOOGLE_MODEL=gemini-pro  # optional
```

**Features**:

- ✅ Function calling
- ✅ Streaming
- ✅ Multimodal (text + images)
- ⚠️ Limited function calling vs OpenAI/Anthropic

**Costs** (per 1M tokens):

- Gemini Pro: $0.50 input / $1.50 output (generous free tier)

## Provider Comparison

| Feature          | OpenAI    | Anthropic | Google    |
| ---------------- | --------- | --------- | --------- |
| Function calling | Excellent | Excellent | Good      |
| Context window   | 128K      | 200K      | 32K       |
| Streaming        | Yes       | Yes       | Yes       |
| Cost (relative)  | Medium    | High      | Low       |
| Latency          | Fast      | Fast      | Very Fast |
| Quality          | Excellent | Excellent | Good      |

## Switching Providers

### Example: Trying Different Providers

```bash
# Test with OpenAI
MODEL_PROVIDER=openai pnpm tsx templates/agent-basic/index.ts "Explain RAG"

# Same query with Claude
MODEL_PROVIDER=anthropic pnpm tsx templates/agent-basic/index.ts "Explain RAG"

# Same query with Gemini
MODEL_PROVIDER=google pnpm tsx templates/agent-basic/index.ts "Explain RAG"
```

### Provider-Specific Features

Some features may not be available across all providers:

```typescript
// Tool calling works across all providers
const response = await provider.complete({
  messages: [...],
  tools: [...],
});

// Streaming
if (provider.streamComplete) {
  for await (const chunk of provider.streamComplete({ messages })) {
    process.stdout.write(chunk);
  }
}
```

## Cost Optimization

### Use Budget Guards

```bash
ENABLE_BUDGET_GUARD=true
MAX_COST_PER_DAY=5.00
```

The budget guard will track spend and prevent exceeding limits:

```typescript
import { globalBudgetGuard } from '@lib/security/budget-guard';

const summary = globalBudgetGuard.getSpendSummary();
console.log(`Daily spend: $${summary.dailySpend.toFixed(2)}`);
console.log(`Remaining: $${summary.remainingBudget.toFixed(2)}`);
```

### Choose Cost-Effective Models

For development:

- OpenAI: `gpt-3.5-turbo`
- Anthropic: `claude-3-haiku-20240307`
- Google: `gemini-pro` (free tier)

For production:

- OpenAI: `gpt-4-turbo-preview`
- Anthropic: `claude-3-opus-20240229` or `claude-3-sonnet-20240229`
- Google: `gemini-pro` (cost-effective)

## Best Practices

1. **Start with GPT-3.5-turbo** for rapid development
2. **Upgrade to GPT-4 or Claude** when quality matters
3. **Use Gemini** for cost-sensitive applications
4. **Always set budget guards** in production
5. **Monitor token usage** with the token logger
6. **Test with multiple providers** to find the best fit

## Custom Provider

To add a custom provider, implement the `ModelProvider` interface:

```typescript
import { ModelProvider, CompletionRequest, CompletionResponse } from '@lib/models/provider';

export class CustomProvider implements ModelProvider {
  name = 'custom';

  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    // Your implementation
    return {
      content: '...',
      finishReason: 'stop',
      usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
    };
  }
}
```

## Next Steps

- Read [EVALUATION.md](./EVALUATION.md) to compare provider performance
- Check [SECURITY.md](./SECURITY.md) for best practices
- Review cost optimization in each project README
