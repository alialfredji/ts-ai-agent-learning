/**
 * Pulumi GCP Infrastructure for AI Agents
 * 
 * Provisions:
 * - Cloud Run service (containerized agents)
 * - Cloud SQL PostgreSQL with pgvector
 * - Secret Manager for secrets
 * - Cloud Logging
 */

import * as pulumi from '@pulumi/pulumi';
import * as gcp from '@pulumi/gcp';

const config = new pulumi.Config();
const projectName = pulumi.getProject();
const stack = pulumi.getStack();
const gcpProject = config.require('gcpProject');
const region = config.get('gcpRegion') || 'us-central1';

// Enable required APIs
const enabledApis = [
  'run.googleapis.com',
  'sql-component.googleapis.com',
  'secretmanager.googleapis.com',
  'cloudresourcemanager.googleapis.com',
].map(
  (api, index) =>
    new gcp.projects.Service(`enable-${api}`, {
      project: gcpProject,
      service: api,
      disableOnDestroy: false,
    })
);

// Cloud SQL PostgreSQL instance
const dbInstance = new gcp.sql.DatabaseInstance(
  `${projectName}-db`,
  {
    project: gcpProject,
    region,
    databaseVersion: 'POSTGRES_15',
    settings: {
      tier: config.get('dbTier') || 'db-f1-micro',
      ipConfiguration: {
        ipv4Enabled: true,
        authorizedNetworks: [
          {
            name: 'allow-all',
            value: '0.0.0.0/0',
          },
        ],
      },
      databaseFlags: [
        {
          name: 'cloudsql.enable_pgvector',
          value: 'on',
        },
      ],
    },
    deletionProtection: false,
  },
  { dependsOn: enabledApis }
);

// Database
const database = new gcp.sql.Database(`${projectName}-database`, {
  project: gcpProject,
  instance: dbInstance.name,
  name: 'agents_db',
});

// Database user
const dbPassword = config.requireSecret('dbPassword');
const dbUser = new gcp.sql.User(`${projectName}-db-user`, {
  project: gcpProject,
  instance: dbInstance.name,
  name: 'postgres',
  password: dbPassword,
});

// Secret Manager secrets
const openaiSecret = new gcp.secretmanager.Secret(
  `${projectName}-openai-key`,
  {
    project: gcpProject,
    secretId: `${projectName}-${stack}-openai-key`,
    replication: {
      auto: {},
    },
  },
  { dependsOn: enabledApis }
);

const openaiSecretVersion = new gcp.secretmanager.SecretVersion(
  `${projectName}-openai-key-version`,
  {
    secret: openaiSecret.id,
    secretData: config.requireSecret('openaiApiKey'),
  }
);

// Cloud Run service
const service = new gcp.cloudrunv2.Service(
  `${projectName}-service`,
  {
    project: gcpProject,
    location: region,
    name: `${projectName}-${stack}`,
    template: {
      containers: [
        {
          image: config.require('containerImage'),
          ports: [{ containerPort: 3000 }],
          envs: [
            { name: 'NODE_ENV', value: 'production' },
            { name: 'MODEL_PROVIDER', value: config.get('modelProvider') || 'openai' },
            {
              name: 'DATABASE_URL',
              value: pulumi.interpolate`postgresql://postgres:${dbPassword}@${dbInstance.publicIpAddress}/agents_db`,
            },
            {
              name: 'OPENAI_API_KEY',
              valueSource: {
                secretKeyRef: {
                  secret: openaiSecret.secretId,
                  version: 'latest',
                },
              },
            },
          ],
          resources: {
            limits: {
              cpu: '1',
              memory: '2Gi',
            },
          },
        },
      ],
      scaling: {
        minInstanceCount: 0,
        maxInstanceCount: 10,
      },
    },
  },
  { dependsOn: [dbInstance, openaiSecretVersion, ...enabledApis] }
);

// Allow unauthenticated access (adjust for production)
const iamPolicy = new gcp.cloudrunv2.ServiceIamMember(`${projectName}-invoker`, {
  project: gcpProject,
  location: region,
  name: service.name,
  role: 'roles/run.invoker',
  member: 'allUsers',
});

// Exports
export const serviceUrl = service.uri;
export const dbInstanceName = dbInstance.name;
export const dbConnectionName = dbInstance.connectionName;
export const dbPublicIp = dbInstance.publicIpAddress;
