# Terraform GCP Infrastructure

Minimal Terraform configuration mirroring the Pulumi GCP stack.

## Setup

```bash
# Authenticate
gcloud auth application-default login

# Build and push container
cd ../../..
docker build -t gcr.io/YOUR_PROJECT_ID/ai-agents:latest -f infra/docker/Dockerfile .
docker push gcr.io/YOUR_PROJECT_ID/ai-agents:latest

# Configure Terraform
cd infra/terraform/gcp
terraform init

# Create terraform.tfvars
cat > terraform.tfvars <<EOF
gcp_project      = "your-project-id"
gcp_region       = "us-central1"
environment      = "dev"
db_password      = "your-secure-password"
openai_api_key   = "sk-..."
container_image  = "gcr.io/YOUR_PROJECT_ID/ai-agents:latest"
EOF

# Apply
terraform plan
terraform apply
```

## Outputs

```bash
terraform output service_url
terraform output db_connection_name
```

## Cleanup

```bash
terraform destroy
```
