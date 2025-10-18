# Deployment Guide

Production deployment options for AI agents.

## Deployment Options

1. **Vercel** - For Next.js frontends (RAG projects)
2. **Convex** - For background workers
3. **AWS** - Full-stack with Pulumi or Terraform
4. **GCP** - Serverless with Cloud Run
5. **Docker** - Self-hosted

## 1. Vercel Deployment

Perfect for RAG projects with Next.js UIs.

### Setup

```bash
# Install Vercel CLI
pnpm install -g vercel

# Login
vercel login

# Deploy
cd beginner/02-local-rag/app
vercel

# Set environment variables
vercel env add OPENAI_API_KEY
vercel env add DATABASE_URL
```

### Environment Variables

Required in Vercel dashboard:
- `OPENAI_API_KEY` (or your provider's key)
- `DATABASE_URL` (Neon or Supabase recommended)
- `MODEL_PROVIDER`
- `LANGCHAIN_API_KEY` (optional)

### GitHub Integration

1. Import project in Vercel dashboard
2. Connect to GitHub repository
3. Configure environment variables
4. Auto-deploy on push to main

## 2. Convex Deployment

For background worker agents.

### Setup

```bash
cd intermediate/03-background-worker

# Initialize
npx convex dev

# Deploy
npx convex deploy
```

### Environment Variables

Set in Convex dashboard:
- API keys for model providers
- Database connection strings
- Webhook secrets

## 3. AWS Deployment (Pulumi)

Full infrastructure on AWS.

### Prerequisites

- AWS account with credentials configured
- Pulumi account (free tier available)

### Deploy

```bash
cd infra/pulumi/aws

# Install Pulumi
curl -fsSL https://get.pulumi.com | sh

# Login
pulumi login

# Create stack
pulumi stack init production

# Configure secrets
pulumi config set --secret dbPassword <password>
pulumi config set --secret openaiApiKey <key>
pulumi config set --secret anthropicApiKey <key>

# Deploy
pulumi up
```

### Costs

- ~$45/month for App Runner + RDS
- Use Neon/Supabase instead of RDS to save ~$15/month

### Monitoring

View logs in CloudWatch:
```bash
aws logs tail /aws/apprunner/<service-name> --follow
```

## 4. GCP Deployment (Pulumi)

Serverless deployment on Google Cloud.

### Prerequisites

- GCP account with billing enabled
- gcloud CLI installed

### Deploy

```bash
# Build and push container
docker build -t gcr.io/PROJECT_ID/ai-agents:latest -f infra/docker/Dockerfile .
docker push gcr.io/PROJECT_ID/ai-agents:latest

# Deploy with Pulumi
cd infra/pulumi/gcp
pulumi stack init production
pulumi config set gcpProject PROJECT_ID
pulumi config set containerImage gcr.io/PROJECT_ID/ai-agents:latest
pulumi config set --secret dbPassword <password>
pulumi config set --secret openaiApiKey <key>
pulumi up
```

### Costs

- ~$7-12/month (Cloud Run scales to zero)
- More cost-effective than AWS for variable workloads

### Monitoring

```bash
gcloud run services logs read ai-agents-production --limit=50
```

## 5. Terraform Deployment

Alternative to Pulumi using Terraform.

### AWS

```bash
cd infra/terraform/aws

terraform init
terraform plan -var-file=production.tfvars
terraform apply -var-file=production.tfvars
```

### GCP

```bash
cd infra/terraform/gcp

terraform init
terraform plan -var-file=production.tfvars
terraform apply -var-file=production.tfvars
```

## 6. Docker Self-Hosted

Run on any Docker host.

### Setup

```bash
cd infra/docker

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api
```

Services:
- API: http://localhost:3000
- Postgres: localhost:5432
- Jaeger UI: http://localhost:16686

### Production Considerations

For production self-hosting:
1. Use proper secrets management
2. Set up reverse proxy (nginx/Caddy)
3. Enable HTTPS
4. Configure backup strategy
5. Set up monitoring (Prometheus + Grafana)

## Database Options

### Neon (Recommended)

Serverless Postgres with pgvector support.

1. Sign up at [neon.tech](https://neon.tech)
2. Create project with pgvector enabled
3. Copy connection string
4. Add to environment variables

**Pros**:
- Free tier available
- Serverless (no idle costs)
- Automatic backups
- Easy setup

### Supabase

Full backend platform with Postgres + pgvector.

1. Sign up at [supabase.com](https://supabase.com)
2. Create project
3. Enable pgvector extension
4. Copy connection string

**Pros**:
- Free tier generous
- Additional features (auth, storage, realtime)
- Good dashboard

### Self-Hosted PostgreSQL

For full control:

```bash
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=agents_db \
  -p 5432:5432 \
  ankane/pgvector:latest
```

## CI/CD

### GitHub Actions

Pre-configured workflows in `.github/workflows/`:

1. **CI** (`ci.yml`): Runs on every push
   - Linting
   - Type checking
   - Tests

2. **Evals** (`evals.yml`): Runs on PRs
   - Agent evaluations
   - LangSmith integration
   - Performance metrics

3. **Deploy** (`deploy-pulumi.yml`): Deploys to cloud
   - AWS or GCP
   - OIDC authentication
   - Automatic rollback on failure

### Setup OIDC

#### AWS

```bash
# Create OIDC provider
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com

# Create role and add to GitHub secrets as AWS_ROLE_ARN
```

#### GCP

```bash
# Create workload identity pool and provider
gcloud iam workload-identity-pools create github \
  --location=global

# Add to GitHub secrets:
# - GCP_WORKLOAD_IDENTITY_PROVIDER
# - GCP_SERVICE_ACCOUNT
```

## Environment Management

### Development

```bash
# Local .env file
MODEL_PROVIDER=openai
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://localhost:5432/agents_db
```

### Staging

Use separate API keys and database:
```bash
MODEL_PROVIDER=openai
OPENAI_API_KEY=sk-staging-...
DATABASE_URL=postgresql://staging-db/agents_db
```

### Production

Best practices:
1. Use secrets manager (AWS SSM, GCP Secret Manager)
2. Separate API keys per environment
3. Enable budget guards
4. Set up monitoring and alerts
5. Use read replicas for database

## Monitoring

### OpenTelemetry

Enable tracing:
```bash
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
OTEL_SERVICE_NAME=ai-agent
```

View traces in Jaeger:
```bash
docker-compose up -d jaeger
open http://localhost:16686
```

### LangSmith

Enable for all agents:
```bash
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=...
LANGCHAIN_PROJECT=production
```

### Custom Metrics

Track important metrics:
- Request latency
- Token usage
- Error rates
- Cost per request

## Security Checklist

- [ ] Use HTTPS in production
- [ ] Store secrets in secrets manager
- [ ] Enable rate limiting
- [ ] Set up budget guards
- [ ] Configure CORS properly
- [ ] Use API key authentication
- [ ] Enable audit logging
- [ ] Regular security updates

## Scaling

### Horizontal Scaling

- Cloud Run: Auto-scales (0-1000 instances)
- App Runner: Configure scaling (1-25 instances)
- Convex: Automatically scales

### Database Scaling

- Use connection pooling (PgBouncer)
- Add read replicas for RAG queries
- Consider Neon for serverless scaling

### Caching

Add Redis for:
- Embedding cache
- Rate limiting
- Session storage

## Cost Optimization

1. **Choose right model**:
   - Dev: GPT-3.5, Claude Haiku, Gemini
   - Prod: GPT-4, Claude Opus/Sonnet

2. **Enable budget guards**:
   ```bash
   ENABLE_BUDGET_GUARD=true
   MAX_COST_PER_DAY=10.00
   ```

3. **Use serverless databases**: Neon, Supabase

4. **Scale to zero**: Cloud Run, Vercel

5. **Cache embeddings**: Avoid re-computing

## Troubleshooting

### Build failures

```bash
# Clean and rebuild
pnpm clean
pnpm install
pnpm build
```

### Database connection issues

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check firewall rules
# - AWS: Security groups
# - GCP: Firewall rules
```

### High costs

Check token usage:
```typescript
import { globalTokenLogger } from '@lib/utils/token-counter';
console.log(globalTokenLogger.getSummary());
```

## Next Steps

- Review [OBSERVABILITY.md](./OBSERVABILITY.md)
- Check [SECURITY.md](./SECURITY.md)
- Set up monitoring and alerts
