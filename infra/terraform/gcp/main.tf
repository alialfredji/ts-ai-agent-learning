terraform {
  required_version = ">= 1.5"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }

  backend "gcs" {
    # Configure with: terraform init -backend-config=backend.hcl
    # bucket = "your-terraform-state"
    # prefix = "ai-agents"
  }
}

provider "google" {
  project = var.gcp_project
  region  = var.gcp_region
}

# Enable required APIs
resource "google_project_service" "services" {
  for_each = toset([
    "run.googleapis.com",
    "sqladmin.googleapis.com",
    "secretmanager.googleapis.com",
  ])

  service            = each.key
  disable_on_destroy = false
}

# Cloud SQL PostgreSQL
resource "google_sql_database_instance" "main" {
  name             = "${var.project_name}-${var.environment}"
  database_version = "POSTGRES_15"
  region           = var.gcp_region

  settings {
    tier = var.db_tier

    # WARNING: This allows public access for demo purposes only
    # In production, use Cloud SQL Proxy or restrict to specific IPs
    ip_configuration {
      ipv4_enabled = true

      authorized_networks {
        name  = "allow-all-demo-only"
        value = "0.0.0.0/0"
      }
    }

    database_flags {
      name  = "cloudsql.enable_pgvector"
      value = "on"
    }
  }

  deletion_protection = var.environment == "production"

  depends_on = [google_project_service.services]
}

resource "google_sql_database" "database" {
  name     = "agents_db"
  instance = google_sql_database_instance.main.name
}

resource "google_sql_user" "user" {
  name     = "postgres"
  instance = google_sql_database_instance.main.name
  password = var.db_password
}

# Secret Manager
resource "google_secret_manager_secret" "openai_key" {
  secret_id = "${var.project_name}-${var.environment}-openai-key"

  replication {
    auto {}
  }

  depends_on = [google_project_service.services]
}

resource "google_secret_manager_secret_version" "openai_key_version" {
  secret      = google_secret_manager_secret.openai_key.id
  secret_data = var.openai_api_key
}

# Cloud Run service (requires pre-built container image)
resource "google_cloud_run_v2_service" "main" {
  name     = "${var.project_name}-${var.environment}"
  location = var.gcp_region

  template {
    containers {
      image = var.container_image

      ports {
        container_port = 3000
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }

      env {
        name  = "MODEL_PROVIDER"
        value = var.model_provider
      }

      env {
        name  = "DATABASE_URL"
        value = "postgresql://postgres:${var.db_password}@${google_sql_database_instance.main.public_ip_address}/agents_db"
      }

      env {
        name = "OPENAI_API_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.openai_key.secret_id
            version = "latest"
          }
        }
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "2Gi"
        }
      }
    }

    scaling {
      min_instance_count = 0
      max_instance_count = 10
    }
  }

  depends_on = [
    google_project_service.services,
    google_sql_database_instance.main,
    google_secret_manager_secret_version.openai_key_version
  ]
}

# Allow unauthenticated access
resource "google_cloud_run_v2_service_iam_member" "invoker" {
  name     = google_cloud_run_v2_service.main.name
  location = google_cloud_run_v2_service.main.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Outputs
output "service_url" {
  value = google_cloud_run_v2_service.main.uri
}

output "db_instance_name" {
  value = google_sql_database_instance.main.name
}

output "db_connection_name" {
  value = google_sql_database_instance.main.connection_name
}

output "db_public_ip" {
  value = google_sql_database_instance.main.public_ip_address
}
