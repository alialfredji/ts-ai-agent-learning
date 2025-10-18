# 01: Tool Calling CLI Agent

A command-line agent that uses function calling with Zod schemas to interact with external tools.

## Learning Objectives

- Understand function calling / tool use patterns
- Define tool schemas with Zod for type safety
- Handle tool execution and response formatting
- Switch between model providers (OpenAI, Anthropic, Google)

## Features

- Calculator tool with Zod validation
- Weather lookup (mock data)
- File operations (read, list)
- Switchable model providers via environment

## Usage

```bash
# Install dependencies (from root)
pnpm install

# Set up environment
cp .env.example .env
# Edit .env to add your API keys

# Run the agent
pnpm tsx beginner/01-tool-calling-cli/index.ts

# Or with a specific provider
MODEL_PROVIDER=anthropic pnpm tsx beginner/01-tool-calling-cli/index.ts
```

## Project Structure

- `index.ts` - Main CLI agent loop
- `tools.ts` - Tool definitions with Zod schemas
- `agent.ts` - Agent logic for tool calling

## Next Steps

- Add more tools (web search, database queries)
- Implement multi-turn conversations
- Add conversation history persistence
- Explore structured output modes
