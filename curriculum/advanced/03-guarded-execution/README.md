# 03: Guarded Execution with Policy Agent

A secure agent execution environment with policy enforcement, sandboxing, and rate limits.

## Learning Objectives

- Implement security policies for agents
- Build sandboxed tool execution
- Add guardrails and safety checks
- Implement rate limiting and budget controls
- Handle malicious or unsafe agent actions

## Features

- Policy-based access control
- Sandboxed tool execution (Docker/VM)
- Rate limiting per user/agent
- Budget enforcement
- Audit logging
- Automatic policy violation detection
- Rollback on unsafe operations

## Security Policies

```typescript
{
  allowedTools: ['read_file', 'web_search'],
  deniedTools: ['execute_shell', 'write_file'],
  rateLimit: { requests: 100, windowMs: 60000 },
  budget: { maxCostPerDay: 5.0 },
  auditLog: true,
  sandboxed: true
}
```

## Setup

```bash
# Run with policy enforcement
pnpm tsx advanced/03-guarded-execution/index.ts \
  --policy policies/strict.json \
  --sandbox docker

# Monitor violations
pnpm tsx advanced/03-guarded-execution/monitor.ts
```

## Next Steps

- Add custom policy language
- Implement ML-based anomaly detection
- Add human-in-the-loop approval
- Build policy management UI
- Add compliance reporting
