# Terraform AWS Infrastructure

Minimal Terraform configuration mirroring the Pulumi AWS stack.

## Setup

```bash
cd infra/terraform/aws

# Initialize
terraform init

# Create terraform.tfvars
cat > terraform.tfvars <<EOF
aws_region         = "us-east-1"
project_name       = "ai-agents"
environment        = "dev"
db_instance_class  = "db.t3.micro"
db_password        = "your-secure-password"
openai_api_key     = "sk-..."
anthropic_api_key  = "sk-ant-..."
EOF

# Plan
terraform plan

# Apply
terraform apply
```

## State Backend

Configure S3 backend for team usage:

```bash
# Create backend.hcl
cat > backend.hcl <<EOF
bucket = "your-terraform-state"
key    = "ai-agents/terraform.tfstate"
region = "us-east-1"
EOF

# Initialize with backend
terraform init -backend-config=backend.hcl
```

## Outputs

```bash
terraform output vpc_id
terraform output db_endpoint
```

## Cleanup

```bash
terraform destroy
```
