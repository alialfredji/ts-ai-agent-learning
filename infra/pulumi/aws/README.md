# Pulumi AWS Infrastructure

Deploys the AI Agents application to AWS using:
- **AWS App Runner**: Containerized application service
- **RDS PostgreSQL**: Database with pgvector extension
- **SSM Parameter Store**: Secrets management
- **CloudWatch**: Logging and monitoring

## Prerequisites

1. Install Pulumi CLI: `curl -fsSL https://get.pulumi.com | sh`
2. Install AWS CLI and configure credentials
3. Install Node.js dependencies: `pnpm install`

## Setup

### 1. Create a new Pulumi stack

```bash
cd infra/pulumi/aws
pulumi stack init dev
```

### 2. Configure secrets

```bash
# Database password
pulumi config set --secret dbPassword <your-secure-password>

# API Keys
pulumi config set --secret openaiApiKey <your-openai-key>
pulumi config set --secret anthropicApiKey <your-anthropic-key>

# Optional: model provider
pulumi config set modelProvider openai

# Optional: database instance class
pulumi config set dbInstanceClass db.t3.micro
```

### 3. Deploy

```bash
pulumi up
```

Review the preview and confirm. The deployment takes ~10-15 minutes.

### 4. Get outputs

```bash
pulumi stack output appRunnerUrl
```

## Alternative: Use Managed Database

Instead of RDS, you can use Neon or Supabase:

```bash
# Set external database URL
pulumi config set --secret databaseUrl postgresql://user:pass@host:5432/db

# Modify index.ts to skip RDS creation
```

## Update

```bash
# After code changes
pulumi up
```

## Destroy

```bash
pulumi destroy
```

## Costs

Estimated monthly costs (us-east-1, minimal usage):
- App Runner: ~$25/month (1 vCPU, 2GB RAM)
- RDS db.t3.micro: ~$15/month
- Data transfer: ~$5/month
- **Total: ~$45/month**

Use Neon/Supabase free tier to reduce costs.

## Monitoring

View logs in CloudWatch:
```bash
aws logs tail /aws/apprunner/<service-name> --follow
```
