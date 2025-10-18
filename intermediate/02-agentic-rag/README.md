# 02: Agentic RAG with Critique-Refine Loop

An advanced RAG system that uses a critique-refine loop to improve answer quality and detect hallucinations.

## Learning Objectives

- Implement iterative refinement loops
- Detect and reduce hallucinations
- Use self-critique for answer validation
- Build confidence scoring
- Implement answer grounding checks

## Features

- Initial answer generation with RAG
- Self-critique agent that evaluates the answer
- Refinement loop with additional retrieval
- Hallucination detection
- Citation verification
- Confidence scoring

## Architecture

```
[Query] -> [Retrieve Docs] -> [Generate Answer]
                                      ↓
                                [Critique]
                                      ↓
                         Is answer satisfactory?
                            /              \
                          Yes               No
                           ↓                 ↓
                    [Final Answer]    [Refine Query]
                                           ↓
                                    [Retrieve More]
                                           ↓
                                    [Generate Again]
                                           ↓
                                      [Critique]
                                      (iterate)
```

## Setup

```bash
# Uses same database as beginner/02-local-rag
# Make sure documents are indexed first

# Run agentic RAG
pnpm tsx intermediate/02-agentic-rag/index.ts "Your question here"
```

## Project Structure

- `index.ts` - Main entry point
- `agentic-loop.ts` - Critique-refine implementation
- `hallucination-checker.ts` - Hallucination detection
- `citation-validator.ts` - Citation verification

## Example

```typescript
import { agenticRAG } from './agentic-loop';

const result = await agenticRAG({
  query: 'What are the benefits of RAG?',
  maxIterations: 3,
});

console.log('Answer:', result.answer);
console.log('Confidence:', result.confidence);
console.log('Iterations:', result.iterationCount);
console.log('Hallucinations detected:', result.hallucinationsDetected);
```

## Next Steps

- Add multi-hop reasoning
- Implement query decomposition
- Add uncertainty quantification
- Support contradicting sources
- Implement source credibility scoring
