# Security Guide

Security best practices for production AI agents.

## Threat Model

AI agents face unique security challenges:

1. **Prompt injection**: Malicious input manipulating agent behavior
2. **Data leakage**: Exposing sensitive information in responses
3. **Excessive costs**: Unbounded API usage
4. **Unauthorized access**: Lack of authentication/authorization
5. **Tool abuse**: Malicious use of agent tools
6. **PII exposure**: Leaking personal information

## API Key Security

### Storage

✅ **Do**:

- Store in environment variables
- Use secrets managers (AWS SSM, GCP Secret Manager)
- Rotate keys regularly
- Use different keys per environment

❌ **Don't**:

- Commit keys to git
- Hard-code in source files
- Share keys between projects
- Use production keys in development

### Access Control

```typescript
// Check key has proper scopes
function validateApiKey(key: string) {
  if (!key) {
    throw new Error('API key required');
  }

  if (key.startsWith('sk-proj-')) {
    // Project-scoped key (recommended)
    return true;
  }

  console.warn('Using account-level API key - consider using project keys');
  return true;
}
```

## Rate Limiting

Prevent abuse and manage costs.

### Implementation

```typescript
import { globalRateLimiter } from '@lib/security/rate-limiter';

async function handleRequest(userId: string, request: any) {
  // Check rate limit
  const allowed = await globalRateLimiter.checkLimit(userId);

  if (!allowed) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  // Process request
  return await processRequest(request);
}
```

### Configuration

```bash
# In .env
RATE_LIMIT_PER_MINUTE=60
RATE_LIMIT_PER_HOUR=1000
RATE_LIMIT_PER_DAY=10000
```

### Per-User Limits

```typescript
interface UserTier {
  requestsPerMinute: number;
  maxTokensPerRequest: number;
  dailyBudget: number;
}

const TIERS: Record<string, UserTier> = {
  free: {
    requestsPerMinute: 10,
    maxTokensPerRequest: 1000,
    dailyBudget: 0.1,
  },
  pro: {
    requestsPerMinute: 60,
    maxTokensPerRequest: 4000,
    dailyBudget: 5.0,
  },
  enterprise: {
    requestsPerMinute: 300,
    maxTokensPerRequest: 8000,
    dailyBudget: 50.0,
  },
};
```

## Input Validation

### Sanitize User Input

```typescript
import { z } from 'zod';

const userInputSchema = z.object({
  query: z
    .string()
    .min(1)
    .max(1000)
    .regex(/^[a-zA-Z0-9\s\.,!?-]+$/, 'Invalid characters detected'),
  context: z.string().max(5000).optional(),
});

function validateInput(input: unknown) {
  try {
    return userInputSchema.parse(input);
  } catch (error) {
    throw new Error('Invalid input format');
  }
}
```

### Detect Prompt Injection

```typescript
const INJECTION_PATTERNS = [
  /ignore (previous|all|above) (instructions|prompts)/i,
  /system:?\s*you are now/i,
  /\\n\\n# new (role|instruction)/i,
  /jailbreak/i,
  /grandma/i, // Common jailbreak technique
];

function detectPromptInjection(input: string): boolean {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(input));
}

function handleUserInput(input: string) {
  if (detectPromptInjection(input)) {
    console.warn('Potential prompt injection detected:', input);
    throw new Error('Invalid input detected');
  }

  return input;
}
```

## Tool Security

### Sandboxed Execution

```typescript
interface ToolPolicy {
  allowedTools: string[];
  deniedTools: string[];
  requireApproval: string[];
}

const POLICY: ToolPolicy = {
  allowedTools: ['search', 'calculator', 'weather'],
  deniedTools: ['execute_shell', 'write_file', 'delete_file'],
  requireApproval: ['send_email', 'make_purchase'],
};

async function executeTool(toolName: string, args: any, userId: string) {
  // Check if tool is denied
  if (POLICY.deniedTools.includes(toolName)) {
    throw new Error(`Tool ${toolName} is not allowed`);
  }

  // Check if tool requires approval
  if (POLICY.requireApproval.includes(toolName)) {
    await requestHumanApproval(userId, toolName, args);
  }

  // Execute in sandbox
  return await executeSandboxed(toolName, args);
}
```

### File System Access

```typescript
import path from 'path';

const ALLOWED_DIRS = [path.resolve('./data'), path.resolve('./uploads')];

function validatePath(filePath: string): boolean {
  const resolved = path.resolve(filePath);

  // Prevent directory traversal
  if (resolved.includes('..')) {
    return false;
  }

  // Check if in allowed directory
  return ALLOWED_DIRS.some((dir) => resolved.startsWith(dir));
}

async function readFile(filePath: string) {
  if (!validatePath(filePath)) {
    throw new Error('Access denied: Invalid file path');
  }

  // Safe to read
  return await fs.readFile(filePath, 'utf-8');
}
```

## Data Privacy

### PII Detection

```typescript
const PII_PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  creditCard: /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g,
};

function detectPII(text: string): string[] {
  const detected: string[] = [];

  for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
    if (pattern.test(text)) {
      detected.push(type);
    }
  }

  return detected;
}

function redactPII(text: string): string {
  let redacted = text;

  for (const pattern of Object.values(PII_PATTERNS)) {
    redacted = redacted.replace(pattern, '[REDACTED]');
  }

  return redacted;
}
```

### Data Retention

```typescript
interface DataRetentionPolicy {
  conversationHistoryDays: number;
  logRetentionDays: number;
  deletePIIAfterDays: number;
}

const RETENTION: DataRetentionPolicy = {
  conversationHistoryDays: 30,
  logRetentionDays: 90,
  deletePIIAfterDays: 7,
};

async function cleanupOldData() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - RETENTION.conversationHistoryDays);

  // Delete old conversations
  await db.conversations.deleteMany({
    createdAt: { $lt: cutoffDate },
  });
}
```

## Authentication & Authorization

### API Key Authentication

```typescript
function authenticateRequest(req: Request): string | null {
  const authHeader = req.headers.get('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  // Validate token (implement your logic)
  const userId = validateToken(token);

  return userId;
}

async function handleRequest(req: Request) {
  const userId = authenticateRequest(req);

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Process authenticated request
  return processRequest(req, userId);
}
```

### Role-Based Access Control

```typescript
enum Role {
  User = 'user',
  Admin = 'admin',
  Developer = 'developer',
}

const PERMISSIONS: Record<Role, string[]> = {
  [Role.User]: ['query', 'view_history'],
  [Role.Developer]: ['query', 'view_history', 'view_logs', 'test'],
  [Role.Admin]: ['query', 'view_history', 'view_logs', 'test', 'manage_users', 'view_costs'],
};

function checkPermission(userId: string, action: string): boolean {
  const userRole = getUserRole(userId);
  const permissions = PERMISSIONS[userRole];

  return permissions.includes(action);
}
```

## Audit Logging

### Log Security Events

```typescript
interface AuditLog {
  timestamp: Date;
  userId: string;
  action: string;
  resource: string;
  status: 'success' | 'failure';
  metadata?: Record<string, any>;
}

function logSecurityEvent(event: Omit<AuditLog, 'timestamp'>) {
  const log: AuditLog = {
    ...event,
    timestamp: new Date(),
  };

  // Write to secure audit log
  console.log('[AUDIT]', JSON.stringify(log));

  // Also send to SIEM if available
  // await sendToSIEM(log);
}

// Usage
logSecurityEvent({
  userId: 'user-123',
  action: 'tool_execution',
  resource: 'send_email',
  status: 'success',
  metadata: { toolArgs: { to: 'user@example.com' } },
});
```

## Secure Configuration

### Environment Variables

```typescript
// Validate required environment variables on startup
function validateEnvironment() {
  const required = ['OPENAI_API_KEY', 'DATABASE_URL', 'JWT_SECRET'];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

validateEnvironment();
```

### Secrets Rotation

```typescript
// Check key age and warn if old
function checkKeyAge(keyCreatedAt: Date) {
  const ageInDays = (Date.now() - keyCreatedAt.getTime()) / (1000 * 60 * 60 * 24);

  if (ageInDays > 90) {
    console.warn('API key is over 90 days old. Consider rotating.');
  }
}
```

## HTTPS & TLS

### Enforce HTTPS

```typescript
// Middleware to redirect HTTP to HTTPS
function enforceHTTPS(req: Request): Response | null {
  const url = new URL(req.url);

  if (url.protocol === 'http:' && process.env.NODE_ENV === 'production') {
    url.protocol = 'https:';
    return Response.redirect(url.toString(), 301);
  }

  return null;
}
```

## Dependency Security

### Regular Updates

```bash
# Check for vulnerabilities
pnpm audit

# Update dependencies
pnpm update

# Check for outdated packages
pnpm outdated
```

### Dependency Scanning

Add to CI/CD:

```yaml
# .github/workflows/security.yml
- name: Run security audit
  run: pnpm audit --audit-level=moderate
```

## Production Checklist

- [ ] Store API keys in secrets manager
- [ ] Implement rate limiting
- [ ] Add input validation and sanitization
- [ ] Detect and prevent prompt injection
- [ ] Implement budget guards
- [ ] Set up audit logging
- [ ] Enable HTTPS/TLS
- [ ] Configure CORS properly
- [ ] Implement authentication
- [ ] Add PII detection and redaction
- [ ] Set up data retention policies
- [ ] Regular dependency updates
- [ ] Security monitoring and alerts

## Incident Response

### Security Incident Plan

1. **Detect**: Monitor for suspicious activity
2. **Contain**: Disable compromised keys/accounts
3. **Investigate**: Review audit logs
4. **Remediate**: Fix vulnerability
5. **Recover**: Restore normal operations
6. **Document**: Post-mortem analysis

### Example Runbook

```typescript
async function handleSecurityIncident(incidentType: string) {
  // 1. Log incident
  logSecurityEvent({
    userId: 'system',
    action: 'security_incident',
    resource: incidentType,
    status: 'failure',
  });

  // 2. Notify team
  await notifySecurityTeam(incidentType);

  // 3. Take automated action
  switch (incidentType) {
    case 'rate_limit_exceeded':
      await temporaryBan(userId, '1h');
      break;
    case 'potential_data_breach':
      await disableAllApiKeys();
      break;
  }
}
```

## Next Steps

- Review [OBSERVABILITY.md](./OBSERVABILITY.md) for monitoring
- Implement security measures from this guide
- Regular security audits
- Keep dependencies updated
