# 02: Local RAG (Retrieval-Augmented Generation)

A RAG system that indexes local Markdown documents and provides semantic search with a Next.js UI using Vercel AI SDK.

## Learning Objectives

- Understand RAG architecture (indexing + retrieval + generation)
- Work with embeddings and vector similarity
- Use pgvector for vector storage
- Build a chat UI with Vercel AI SDK
- Stream responses to the client

## Features

- Index local Markdown documents
- pgvector for semantic search (PostgreSQL extension)
- Next.js 14 with App Router
- Vercel AI SDK for streaming responses
- Optional: Neon or Supabase for managed PostgreSQL

## Architecture

```
[Markdown Docs] -> [Embeddings] -> [pgvector DB]
                                         ↓
[User Query] -> [Embedding] -> [Similarity Search] -> [LLM + Context] -> [Response]
```

## Setup

### 1. Database Setup

**Option A: Local PostgreSQL with pgvector**

```bash
# Using Docker (see root docker-compose.yml)
docker-compose up -d postgres

# Or install locally
brew install postgresql pgvector  # macOS
# Follow https://github.com/pgvector/pgvector for other platforms
```

**Option B: Managed Services**

- [Neon](https://neon.tech) - Serverless Postgres with pgvector
- [Supabase](https://supabase.com) - Full-stack with pgvector support

### 2. Environment Setup

```bash
# Copy example env
cp .env.example .env

# Add your keys
DATABASE_URL=postgresql://user:password@localhost:5432/rag_db
OPENAI_API_KEY=sk-...
```

### 3. Run

```bash
# Index documents
pnpm tsx beginner/02-local-rag/scripts/index.ts

# Start Next.js dev server
cd beginner/02-local-rag/app
pnpm install
pnpm dev
```

## Project Structure

- `scripts/index.ts` - Document indexing script
- `lib/embeddings.ts` - Embedding generation
- `lib/vector-store.ts` - pgvector operations
- `app/` - Next.js application
  - `app/api/chat/route.ts` - Chat API with RAG
  - `app/page.tsx` - Chat UI
- `docs/` - Sample Markdown documents to index

## Next Steps

- Add document metadata filtering
- Implement hybrid search (vector + keyword)
- Add citation tracking
- Experiment with chunking strategies
- Add re-ranking
