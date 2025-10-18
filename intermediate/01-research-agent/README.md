# 01: Research Agent with LangGraph

A research agent that performs web searches, synthesizes information, and provides cited summaries using LangGraph state machine.

## Learning Objectives

- Build multi-step agents with LangGraph
- Implement state machines for agent workflows
- Perform web searches and extract information
- Generate summaries with citations
- Evaluate agent performance with LangSmith

## Features

- Multi-step research workflow
- Web search integration (Tavily, SerpAPI, or mock)
- Information synthesis and summarization
- Citation tracking and formatting
- LangSmith integration for evaluation
- State-based execution with LangGraph

## Architecture

```
[User Query] -> [Plan Research]
                    ↓
             [Execute Searches]
                    ↓
             [Extract Info]
                    ↓
             [Synthesize & Cite]
                    ↓
             [Final Report]
```

## Setup

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env

# Add API keys:
# - TAVILY_API_KEY or SERPAPI_KEY (for web search)
# - LANGCHAIN_API_KEY (for LangSmith evaluation)
# - Model provider keys (OpenAI, Anthropic, etc.)

# Run the research agent
pnpm tsx intermediate/01-research-agent/index.ts "What are the latest developments in AI agents?"
```

## Project Structure

- `index.ts` - Main entry point
- `graph.ts` - LangGraph state machine definition
- `tools/` - Search and extraction tools
- `prompts/` - Agent prompts
- `evals/` - Evaluation datasets and metrics

## Example Usage

```typescript
import { createResearchAgent } from './graph';

const agent = createResearchAgent();
const result = await agent.invoke({
  query: 'What are the latest developments in quantum computing?',
});

console.log(result.report);
console.log('Citations:', result.citations);
```

## Evaluation

```bash
# Run evaluation suite
pnpm tsx intermediate/01-research-agent/evals/run-eval.ts

# View results in LangSmith
# https://smith.langchain.com
```

## Next Steps

- Add multi-source verification
- Implement fact-checking
- Add iterative refinement
- Support image and video sources
- Add domain-specific research modes
