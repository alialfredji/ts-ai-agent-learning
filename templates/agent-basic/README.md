# Basic Agent Template

A minimal, production-ready template for building AI agents with TypeScript.

## Features

- Model provider abstraction (OpenAI, Anthropic, Google)
- Rate limiting
- Budget guards
- Error handling
- Usage tracking

## Usage

```bash
# Copy template to new project
cp -r templates/agent-basic my-new-agent

# Install dependencies (from root)
pnpm install

# Run
pnpm tsx my-new-agent/index.ts "Your message here"
```

## Customization

1. Modify system prompt in `index.ts`
2. Add tools/functions as needed
3. Customize rate limits and budget in `.env`
4. Add conversation history for multi-turn chats
5. Implement streaming for real-time responses

## Next Steps

- Add tool calling (see beginner/01-tool-calling-cli)
- Add RAG (see beginner/02-local-rag)
- Build a UI (Next.js + Vercel AI SDK)
- Deploy to Vercel/AWS/GCP (see infra/)
