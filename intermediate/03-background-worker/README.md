# 03: Background Worker Agent with Convex

A background worker that processes tasks from a queue using Convex workflows.

## Learning Objectives

- Build async agents that run in the background
- Use Convex for serverless workflows
- Implement task queuing and processing
- Handle long-running agent tasks
- Implement retry logic and error handling

## Features

- Task queue management
- Async agent execution
- Progress tracking
- Retry on failure
- Result persistence
- Webhook notifications

## Architecture

```
[Client] -> [Enqueue Task] -> [Convex Queue]
                                     ↓
                              [Worker Agent]
                                     ↓
                              [Process Task]
                                     ↓
                          [Store Result & Notify]
```

## Setup

### 1. Convex Setup

```bash
# Install Convex CLI
npm install -g convex

# Initialize Convex (if not already)
cd intermediate/03-background-worker
npx convex dev
```

### 2. Environment Setup

```bash
cp .env.example .env

# Add Convex deployment URL and deploy key
CONVEX_DEPLOYMENT=your-deployment
CONVEX_DEPLOY_KEY=your-key
```

### 3. Deploy Functions

```bash
npx convex deploy
```

## Usage

```bash
# Enqueue a task
pnpm tsx intermediate/03-background-worker/enqueue-task.ts \
  --type "research" \
  --data '{"topic": "AI agents"}'

# Monitor queue
pnpm tsx intermediate/03-background-worker/monitor.ts

# Process tasks (runs automatically with Convex)
# Or test locally:
pnpm tsx intermediate/03-background-worker/worker.ts
```

## Project Structure

- `convex/` - Convex backend functions
  - `schema.ts` - Database schema
  - `tasks.ts` - Task management functions
  - `worker.ts` - Background worker
- `client/` - Client code
  - `enqueue.ts` - Task submission
  - `monitor.ts` - Queue monitoring
- `agents/` - Agent implementations
  - `research-agent.ts`
  - `data-processor.ts`

## Task Types

- **research**: Perform web research
- **data-processing**: Process large datasets
- **report-generation**: Generate comprehensive reports
- **api-integration**: Integrate with external APIs

## Next Steps

- Add scheduled tasks (cron-like)
- Implement task prioritization
- Add parallel task execution
- Build admin dashboard
- Add task cancellation
- Implement task dependencies
