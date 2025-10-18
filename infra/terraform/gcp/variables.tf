variable "gcp_project" {
  description = "GCP project ID"
  type        = string
}

variable "gcp_region" {
  description = "GCP region"
  type        = string
  default     = "us-central1"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "ai-agents"
}

variable "environment" {
  description = "Environment (dev, staging, production)"
  type        = string
  default     = "dev"
}

variable "db_tier" {
  description = "Cloud SQL tier"
  type        = string
  default     = "db-f1-micro"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "openai_api_key" {
  description = "OpenAI API key"
  type        = string
  sensitive   = true
}

variable "container_image" {
  description = "Container image URL"
  type        = string
}

variable "model_provider" {
  description = "Model provider (openai, anthropic, google)"
  type        = string
  default     = "openai"
}
