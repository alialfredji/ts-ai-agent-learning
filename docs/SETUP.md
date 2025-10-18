# Setup Guide

Complete setup instructions for the TypeScript AI Agents curriculum.

## Prerequisites

- **Node.js 20+**: Use nvm or install from [nodejs.org](https://nodejs.org)
- **pnpm**: `npm install -g pnpm`
- **Git**: For version control
- **Docker** (optional): For local PostgreSQL and observability tools

## Quick Start

### 1. Clone and Install

```bash
git clone <repo-url>
cd typescript-ai-agents-curriculum
pnpm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```bash
# Required: Choose your model provider
MODEL_PROVIDER=openai  # or anthropic, google

# Add corresponding API key
OPENAI_API_KEY=sk-...
# OR
ANTHROPIC_API_KEY=sk-ant-...
# OR
GOOGLE_API_KEY=...
```

### 3. Verify Setup

```bash
# Typecheck
pnpm typecheck

# Run a simple example
pnpm tsx templates/agent-basic/index.ts "Hello!"
```

## API Keys

### OpenAI

1. Sign up at [platform.openai.com](https://platform.openai.com)
2. Navigate to API Keys
3. Create a new secret key
4. Add to `.env`: `OPENAI_API_KEY=sk-...`

### Anthropic (Claude)

1. Sign up at [console.anthropic.com](https://console.anthropic.com)
2. Go to API Keys
3. Create a new key
4. Add to `.env`: `ANTHROPIC_API_KEY=sk-ant-...`

### Google (Gemini)

1. Get an API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add to `.env`: `GOOGLE_API_KEY=...`

### LangSmith (Optional - for evaluation)

1. Sign up at [smith.langchain.com](https://smith.langchain.com)
2. Create an API key
3. Add to `.env`:
   ```bash
   LANGCHAIN_TRACING_V2=true
   LANGCHAIN_API_KEY=...
   LANGCHAIN_PROJECT=ai-agents-curriculum
   ```

## Database Setup (for RAG projects)

### Option 1: Docker (Recommended)

```bash
cd infra/docker
docker-compose up -d postgres
```

Database URL: `postgresql://postgres:postgres@localhost:5432/agents_db`

### Option 2: Managed Services

**Neon** (Recommended for production):
1. Sign up at [neon.tech](https://neon.tech)
2. Create a project with pgvector
3. Copy connection string to `.env`

**Supabase**:
1. Sign up at [supabase.com](https://supabase.com)
2. Create a project
3. Enable pgvector extension
4. Copy connection string to `.env`

### Option 3: Local PostgreSQL

```bash
# macOS
brew install postgresql pgvector
brew services start postgresql

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib
# Install pgvector from https://github.com/pgvector/pgvector

# Create database
createdb agents_db
psql agents_db -c "CREATE EXTENSION vector;"
```

## Project Structure

```
├── beginner/          # Beginner-level projects
├── intermediate/      # Intermediate projects
├── advanced/          # Advanced projects
├── templates/         # Reusable templates
├── infra/            # Infrastructure as code
├── docs/             # Documentation
└── src/              # Shared libraries
    └── lib/
        ├── models/   # Model provider abstraction
        ├── security/ # Rate limiting, budget guards
        └── utils/    # Utilities
```

## Development Workflow

```bash
# Run TypeScript directly with tsx
pnpm tsx path/to/file.ts

# Watch mode
pnpm tsx watch path/to/file.ts

# Run tests
pnpm test

# Lint
pnpm lint

# Format
pnpm format
```

## Troubleshooting

### "Cannot find module"

Make sure dependencies are installed:
```bash
pnpm install
```

### TypeScript errors

```bash
pnpm typecheck
```

### API Rate Limits

Adjust rate limits in `.env`:
```bash
RATE_LIMIT_PER_MINUTE=30
MAX_COST_PER_DAY=5.00
```

### Database connection issues

Test connection:
```bash
psql $DATABASE_URL -c "SELECT version();"
```

## Next Steps

- Read [MODELS.md](./MODELS.md) to learn about switching providers
- Check out [beginner/01-tool-calling-cli](../beginner/01-tool-calling-cli) for your first project
- Review [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment

## Support

- 📖 [Full Documentation](./README.md)
- 🐛 [Report Issues](https://github.com/your-repo/issues)
- 💬 [Discussions](https://github.com/your-repo/discussions)
