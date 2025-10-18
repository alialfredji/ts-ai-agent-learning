# TypeScript AI Agents Curriculum

A production-grade learning curriculum for building AI agents with TypeScript, complete with infrastructure templates and deployment guides.

## 🎯 Overview

This repository provides a structured path from beginner to advanced AI agent development, covering:

- **Multiple model providers** (OpenAI, Anthropic, Google)
- **Beginner to advanced projects** with working code
- **Production infrastructure** (Docker, Pulumi, Terraform)
- **Best practices** for security, observability, and evaluation
- **Reusable templates** to kickstart your projects

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ (use [nvm](https://github.com/nvm-sh/nvm))
- pnpm: `npm install -g pnpm`
- API key from [OpenAI](https://platform.openai.com), [Anthropic](https://console.anthropic.com), or [Google](https://makersuite.google.com)

### Setup

```bash
# Clone repository
git clone <repo-url>
cd typescript-ai-agents-curriculum

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Edit .env and add your API keys

# Verify setup
pnpm typecheck

# Run your first agent
pnpm tsx templates/agent-basic/index.ts "Hello!"
```

## 📚 Curriculum Map

### 🟢 Beginner Level

Start here if you're new to AI agents.

#### [01: Tool Calling CLI](beginner/01-tool-calling-cli)

Build a CLI agent with function calling capabilities.

**Learn**: Tool schemas with Zod, function execution, multi-provider support

```bash
pnpm tsx beginner/01-tool-calling-cli/index.ts
```

#### [02: Local RAG](beginner/02-local-rag)

Create a RAG system over local Markdown documents with pgvector.

**Learn**: Embeddings, vector search, RAG architecture, Next.js UI

```bash
# Index documents
pnpm tsx beginner/02-local-rag/scripts/index.ts

# Start UI
cd beginner/02-local-rag/app && pnpm dev
```

#### [03: Inbox Triager](beginner/03-inbox-triager)

Build an email triaging agent with structured outputs.

**Learn**: Structured outputs, rule-based planning, JSON schemas

```bash
pnpm tsx beginner/03-inbox-triager/index.ts
```

### 🟡 Intermediate Level

Level up with more complex workflows.

#### [01: Research Agent](intermediate/01-research-agent)

Multi-step research agent with LangGraph and citations.

**Learn**: LangGraph state machines, web search integration, LangSmith evaluation

```bash
pnpm tsx intermediate/01-research-agent/index.ts "Query here"
```

#### [02: Agentic RAG](intermediate/02-agentic-rag)

RAG with critique-refine loop and hallucination detection.

**Learn**: Iterative refinement, self-critique, confidence scoring

```bash
pnpm tsx intermediate/02-agentic-rag/index.ts "Question here"
```

#### [03: Background Worker](intermediate/03-background-worker)

Async task processing agent with Convex workflows.

**Learn**: Background jobs, queue management, Convex integration

```bash
npx convex dev
pnpm tsx intermediate/03-background-worker/enqueue-task.ts
```

### 🔴 Advanced Level

Production-grade multi-agent systems.

#### [01: Multi-Agent PR Reviewer](advanced/01-multi-agent-pr-reviewer)

Specialized agents (planner, reviewer, tester, fixer) with OpenTelemetry tracing.

**Learn**: Multi-agent coordination, LangGraph orchestration, distributed tracing

```bash
pnpm tsx advanced/01-multi-agent-pr-reviewer/index.ts
```

#### [02: Autonomous Data Pipeline](advanced/02-autonomous-data-pipeline)

Self-managing ETL pipeline with AI validation and reporting.

**Learn**: Autonomous operations, data validation, error recovery

```bash
pnpm tsx advanced/02-autonomous-data-pipeline/index.ts
```

#### [03: Guarded Execution](advanced/03-guarded-execution)

Secure agent environment with policies, sandboxing, and safety checks.

**Learn**: Security policies, sandboxed tools, guardrails

```bash
pnpm tsx advanced/03-guarded-execution/index.ts
```

## 🎨 Templates

Jump-start your projects with production-ready templates.

### [Basic Agent](templates/agent-basic)

Minimal agent with rate limiting and budget guards.

```bash
pnpm tsx templates/agent-basic/index.ts "Your message"
```

### [Evaluation Harness](templates/eval-harness)

Test and evaluate your agents with LangSmith + Vitest.

```bash
pnpm tsx templates/eval-harness/run-eval.ts
```

## 🏗️ Infrastructure

Production deployment made easy.

### Docker

Local development environment with PostgreSQL, OpenTelemetry, and Jaeger.

```bash
cd infra/docker
docker-compose up -d
```

**Includes**:

- PostgreSQL with pgvector
- OpenTelemetry Collector
- Jaeger for trace visualization

### Pulumi

Infrastructure as code for AWS and GCP.

```bash
# AWS
cd infra/pulumi/aws
pulumi up

# GCP
cd infra/pulumi/gcp
pulumi up
```

**Provisions**:

- Container service (App Runner / Cloud Run)
- PostgreSQL database
- Secrets management
- Logging and monitoring

### Terraform

Alternative IaC with Terraform.

```bash
# AWS
cd infra/terraform/aws
terraform apply

# GCP
cd infra/terraform/gcp
terraform apply
```

### GitHub Actions

CI/CD workflows included:

- **Lint & Test**: Runs on every push
- **Deploy**: Automatic deployment with OIDC
- **Evals**: Agent evaluation on PRs

## 🔑 Model Providers

Switch between providers seamlessly.

### Supported Providers

- **OpenAI**: GPT-4, GPT-3.5-turbo
- **Anthropic**: Claude 3 (Opus, Sonnet, Haiku)
- **Google**: Gemini Pro

### Configuration

```bash
# In .env
MODEL_PROVIDER=openai  # or anthropic, google
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
```

### Usage

```typescript
import { getModelProvider } from '@lib/models/provider';

// Use configured provider
const provider = getModelProvider();

// Or specify explicitly
const claude = new AnthropicProvider();
```

See [docs/MODELS.md](docs/MODELS.md) for details.

## 📖 Documentation

Comprehensive guides for every aspect:

- **[Setup Guide](docs/SETUP.md)**: Get started quickly
- **[Model Guide](docs/MODELS.md)**: Switch between providers
- **[Deployment Guide](docs/DEPLOYMENT.md)**: Deploy to production
- **[Observability](docs/OBSERVABILITY.md)**: Monitoring and tracing
- **[Security](docs/SECURITY.md)**: Best practices
- **[Evaluation](docs/EVALUATION.md)**: Testing and quality assurance

## 🛡️ Security & Safety

Built-in safety features:

### Rate Limiting

```bash
RATE_LIMIT_PER_MINUTE=60
```

### Budget Guards

```bash
ENABLE_BUDGET_GUARD=true
MAX_COST_PER_DAY=10.00
```

### Input Validation

```typescript
import { validateInput, detectPromptInjection } from '@lib/security';
```

See [docs/SECURITY.md](docs/SECURITY.md) for complete guide.

## 📊 Observability

Track performance and debug issues:

### LangSmith Integration

```bash
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=...
```

### OpenTelemetry

```bash
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

### Token Usage Tracking

```typescript
import { globalTokenLogger } from '@lib/utils/token-counter';
console.log(globalTokenLogger.getSummary());
```

## 🧪 Testing & Evaluation

Ensure quality with systematic evaluation:

```bash
# Run evaluation suite
pnpm tsx templates/eval-harness/run-eval.ts

# View results in LangSmith
open https://smith.langchain.com
```

See [docs/EVALUATION.md](docs/EVALUATION.md) for details.

## 💰 Cost Optimization

Keep costs under control:

1. **Use appropriate models**:
   - Development: GPT-3.5-turbo, Claude Haiku, Gemini
   - Production: GPT-4, Claude Opus/Sonnet

2. **Enable budget guards**: Automatic spend limits

3. **Monitor usage**: Track tokens and costs

4. **Serverless databases**: Neon or Supabase (free tier)

5. **Cache embeddings**: Avoid recomputation

## 🗺️ Learning Path

### Choose Your Journey

**🎓 Student / Hobbyist**

1. Start with [beginner projects](#-beginner-level)
2. Use free tiers (Gemini, Neon, Vercel)
3. Focus on learning concepts
4. Deploy to Vercel for showcasing

**👨‍💻 Professional Developer**

1. Review all beginner projects
2. Deep dive into intermediate projects
3. Study infrastructure templates
4. Practice evaluation and monitoring

**🏢 Building for Production**

1. Review security and observability docs
2. Set up proper infrastructure (Pulumi/Terraform)
3. Implement evaluation pipeline
4. Use advanced patterns from advanced projects

## 🚢 Deployment Options

### Development

```bash
# Local with Docker
docker-compose up -d
```

### Vercel (Next.js UIs)

```bash
vercel deploy
```

### Convex (Background Workers)

```bash
npx convex deploy
```

### AWS / GCP (Full Stack)

```bash
# With Pulumi
pulumi up

# With Terraform
terraform apply
```

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for complete guide.

## 📦 Project Structure

```
├── beginner/              # Beginner projects
│   ├── 01-tool-calling-cli
│   ├── 02-local-rag
│   └── 03-inbox-triager
├── intermediate/          # Intermediate projects
│   ├── 01-research-agent
│   ├── 02-agentic-rag
│   └── 03-background-worker
├── advanced/              # Advanced projects
│   ├── 01-multi-agent-pr-reviewer
│   ├── 02-autonomous-data-pipeline
│   └── 03-guarded-execution
├── templates/             # Reusable templates
│   ├── agent-basic
│   ├── agentic-rag
│   ├── multi-agent-graph
│   └── eval-harness
├── infra/                 # Infrastructure
│   ├── docker/
│   ├── pulumi/
│   ├── terraform/
│   └── github-actions/
├── docs/                  # Documentation
│   ├── SETUP.md
│   ├── MODELS.md
│   ├── DEPLOYMENT.md
│   ├── OBSERVABILITY.md
│   ├── SECURITY.md
│   └── EVALUATION.md
└── src/                   # Shared libraries
    └── lib/
        ├── models/        # Model provider abstraction
        ├── security/      # Security utilities
        └── utils/         # Common utilities
```

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with:

- [LangChain](https://langchain.com) & [LangGraph](https://langchain-ai.github.io/langgraph/)
- [OpenAI](https://openai.com), [Anthropic](https://anthropic.com), [Google AI](https://ai.google)
- [Vercel AI SDK](https://sdk.vercel.ai)
- [Convex](https://convex.dev)
- [Pulumi](https://pulumi.com) & [Terraform](https://terraform.io)

## 📞 Support

- 📖 [Documentation](docs/)
- 🐛 [Report Issues](https://github.com/your-repo/issues)
- 💬 [Discussions](https://github.com/your-repo/discussions)
- 🐦 [Twitter](https://twitter.com/your-handle)

## 🗓️ Roadmap

- [ ] Add more intermediate projects
- [ ] Support for additional model providers (Mistral, Cohere)
- [ ] Video tutorials for each project
- [ ] Kubernetes deployment templates
- [ ] Advanced evaluation techniques
- [ ] Multi-modal agent examples

---

**Ready to build amazing AI agents?** Start with the [Setup Guide](docs/SETUP.md)!
