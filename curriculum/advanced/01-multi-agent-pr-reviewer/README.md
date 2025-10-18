# 01: Multi-Agent PR Reviewer

A sophisticated multi-agent system that reviews pull requests using specialized agents (planner, reviewer, tester, fixer) with LangGraph orchestration and OpenTelemetry tracing.

## Learning Objectives

- Build multi-agent systems with LangGraph
- Implement agent specialization and coordination
- Use OpenTelemetry for distributed tracing
- Integrate with GitHub API
- Implement iterative improvement loops

## Architecture

```
[PR Event] -> [Planner Agent] -> [Review Strategy]
                                       ↓
                  ┌──────────────────────────────────┐
                  ↓                 ↓                ↓
           [Code Reviewer]   [Test Analyzer]  [Security Scanner]
                  ↓                 ↓                ↓
                  └──────────────────────────────────┘
                                    ↓
                            [Synthesizer Agent]
                                    ↓
                            [Generate Feedback]
                                    ↓
                     ┌──────────────┴──────────────┐
                     ↓                             ↓
              [Auto-Fix Agent]              [Submit Review]
```

## Features

- Specialized agents for different review aspects
- Automatic issue detection and fixing
- Security vulnerability scanning
- Test coverage analysis
- GitHub integration via webhooks
- OpenTelemetry traces for debugging
- Configurable review rules

## Setup

```bash
# Environment setup
cp .env.example .env

# Add GitHub token
GITHUB_TOKEN=ghp_...
GITHUB_WEBHOOK_SECRET=...

# OpenTelemetry endpoint (optional)
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318

# Run the PR reviewer
pnpm tsx advanced/01-multi-agent-pr-reviewer/index.ts \
  --repo owner/repo \
  --pr 123
```

## Agents

### 1. Planner Agent

- Analyzes PR scope and complexity
- Creates review strategy
- Assigns tasks to specialized agents

### 2. Code Reviewer Agent

- Reviews code quality and style
- Checks for anti-patterns
- Suggests improvements

### 3. Test Analyzer Agent

- Evaluates test coverage
- Checks test quality
- Suggests missing tests

### 4. Security Scanner Agent

- Scans for vulnerabilities
- Checks dependencies
- Reviews authentication/authorization

### 5. Auto-Fix Agent

- Generates fix suggestions
- Creates fix commits (optional)
- Validates fixes

## OpenTelemetry Tracing

View traces in Jaeger or your preferred backend:

```bash
# Start Jaeger locally
docker run -d --name jaeger \
  -p 16686:16686 \
  -p 4318:4318 \
  jaegertracing/all-in-one:latest

# Open Jaeger UI
open http://localhost:16686
```

## Next Steps

- Add custom review rules
- Implement learning from feedback
- Add support for more languages
- Build web dashboard
- Add Slack/Discord notifications
