# Model Provider Guide

This curriculum supports multiple AI model providers through a unified abstraction layer.

**Updated October 2025** - Latest models and pricing.

## Supported Providers

- **OpenAI**: GPT-4o, GPT-4 Turbo, GPT-4o-mini
- **Anthropic**: Claude 3.5 Sonnet, Claude 3 Opus/Haiku
- **Google**: Gemini 1.5 Pro, Gemini 1.5 Flash

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
MODEL_PROVIDER=anthropic pnpm tsx curriculum/beginner/01-tool-calling-cli/index.ts
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

**Models** (October 2025):

- `gpt-4o` (default, most capable, multimodal)
- `gpt-4-turbo` (high quality, 128K context)
- `gpt-4o-mini` (fast, cost-effective)

**Configuration**:

```bash
MODEL_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o  # optional override
```

**Features**:

- ✅ Function calling (native)
- ✅ Streaming
- ✅ JSON mode
- ✅ Vision (GPT-4o)
- ✅ 128K context window

**Costs** (per 1M tokens, approximate):

- GPT-4o: $2.50 input / $10 output
- GPT-4 Turbo: $10 input / $30 output
- GPT-4o-mini: $0.15 input / $0.60 output

### Anthropic (Claude)

**Models** (October 2025):

- `claude-3-5-sonnet-20241022` (latest, most capable)
- `claude-3-opus-20240229` (previous flagship)
- `claude-3-haiku-20240307` (fast, affordable)

**Configuration**:

```bash
MODEL_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022  # optional
```

**Features**:

- ✅ Function calling (excellent)
- ✅ Streaming
- ✅ 200K context window
- ✅ Vision
- ✅ Computer use (beta)

**Costs** (per 1M tokens, approximate):

- Claude 3.5 Sonnet: $3 input / $15 output
- Claude 3 Opus: $15 input / $75 output
- Claude 3 Haiku: $0.25 input / $1.25 output

### Google (Gemini)

**Models** (October 2025):

- `gemini-1.5-pro` (most capable, 2M context)
- `gemini-1.5-flash` (fast, cost-effective)

**Configuration**:

```bash
MODEL_PROVIDER=google
GOOGLE_API_KEY=...
GOOGLE_MODEL=gemini-1.5-pro  # optional
```

**Features**:

- ✅ Function calling (improved)
- ✅ Streaming
- ✅ Multimodal (text + images + video)
- ✅ 2M token context window (Pro)
- ✅ Generous free tier

**Costs** (per 1M tokens, approximate):

- Gemini 1.5 Pro: $1.25 input / $5 output
- Gemini 1.5 Flash: $0.075 input / $0.30 output
- **Note**: Generous free tier available

## Provider Comparison (October 2025)

| Feature          | OpenAI (GPT-4o) | Anthropic (Claude 3.5) | Google (Gemini 1.5) |
| ---------------- | --------------- | ---------------------- | ------------------- |
| Function calling | Excellent       | Excellent              | Very Good           |
| Context window   | 128K            | 200K                   | 2M                  |
| Streaming        | Yes             | Yes                    | Yes                 |
| Cost (relative)  | Medium          | Medium                 | Low                 |
| Latency          | Fast            | Fast                   | Very Fast           |
| Quality          | Excellent       | Excellent              | Very Good           |
| Multimodal       | Yes             | Yes                    | Yes (extensive)     |

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

### Choose Cost-Effective Models (October 2025)

For development and prototyping:

- OpenAI: `gpt-4o-mini` (best value)
- Anthropic: `claude-3-haiku-20240307`
- Google: `gemini-1.5-flash` (free tier available)

For production:

- OpenAI: `gpt-4o` (best overall)
- Anthropic: `claude-3-5-sonnet-20241022` (excellent reasoning)
- Google: `gemini-1.5-pro` (cost-effective, huge context)

## Best Practices (October 2025)

1. **Start with GPT-4o-mini or Gemini 1.5 Flash** for rapid development
2. **Upgrade to GPT-4o or Claude 3.5 Sonnet** when quality matters
3. **Use Gemini 1.5 Pro** for very long context or cost-sensitive applications
4. **Always set budget guards** in production
5. **Monitor token usage** with the token logger
6. **Test with multiple providers** to find the best fit for your use case
7. **Consider Gemini 1.5 Pro** for tasks requiring 1M+ token context windows

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
