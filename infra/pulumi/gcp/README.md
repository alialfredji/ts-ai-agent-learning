# Pulumi GCP Infrastructure

Deploys the AI Agents application to Google Cloud Platform using:

- **Cloud Run**: Serverless container platform
- **Cloud SQL**: PostgreSQL with pgvector
- **Secret Manager**: Secrets management
- **Cloud Logging**: Centralized logging

## Prerequisites

1. Install Pulumi CLI: `curl -fsSL https://get.pulumi.com | sh`
2. Install gcloud CLI and authenticate: `gcloud auth login`
3. Create a GCP project
4. Enable billing for the project

## Setup

### 1. Configure GCP

```bash
gcloud config set project YOUR_PROJECT_ID
gcloud auth application-default login
```

### 2. Build and push container

```bash
# Build locally
cd ../../..
docker build -t gcr.io/YOUR_PROJECT_ID/ai-agents:latest -f infra/docker/Dockerfile .

# Push to Container Registry
docker push gcr.io/YOUR_PROJECT_ID/ai-agents:latest
```

### 3. Create Pulumi stack

```bash
cd infra/pulumi/gcp
pulumi stack init prod
```

### 4. Configure

```bash
# Required
pulumi config set gcpProject YOUR_PROJECT_ID
pulumi config set containerImage gcr.io/YOUR_PROJECT_ID/ai-agents:latest
pulumi config set --secret dbPassword <secure-password>
pulumi config set --secret openaiApiKey <your-openai-key>

# Optional
pulumi config set gcpRegion us-central1
pulumi config set dbTier db-f1-micro
pulumi config set modelProvider openai
```

### 5. Deploy

```bash
pulumi up
```

### 6. Access your service

```bash
SERVICE_URL=$(pulumi stack output serviceUrl)
curl $SERVICE_URL/health
```

## Alternative: Artifact Registry

For newer projects, use Artifact Registry instead of Container Registry:

```bash
# Create repository
gcloud artifacts repositories create ai-agents \
  --repository-format=docker \
  --location=us-central1

# Build and push
docker build -t us-central1-docker.pkg.dev/YOUR_PROJECT_ID/ai-agents/app:latest .
docker push us-central1-docker.pkg.dev/YOUR_PROJECT_ID/ai-agents/app:latest

# Update Pulumi config
pulumi config set containerImage us-central1-docker.pkg.dev/YOUR_PROJECT_ID/ai-agents/app:latest
```

## Costs

Estimated monthly costs (us-central1, minimal usage):

- Cloud Run: ~$0-5/month (pay-per-use)
- Cloud SQL db-f1-micro: ~$7/month
- Secret Manager: ~$0.06/month
- **Total: ~$7-12/month**

Cloud Run is cheaper due to scale-to-zero.

## Monitoring

View logs:

```bash
gcloud run services logs read ai-agents-prod --limit=50
```

## Cleanup

```bash
pulumi destroy
```
