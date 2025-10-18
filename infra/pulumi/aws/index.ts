/**
 * Pulumi AWS Infrastructure for AI Agents
 * 
 * Provisions:
 * - AWS App Runner service (containerized agents)
 * - RDS PostgreSQL with pgvector (or reference to Neon/Supabase)
 * - SSM Parameter Store for secrets
 * - CloudWatch Logs
 * 
 * SECURITY NOTE: This is a learning example. In production:
 * - Use IAM authentication for database access
 * - Store DATABASE_URL components separately, not as a single string
 * - Enable VPC endpoints and private networking
 * - Use AWS Secrets Manager rotation for credentials
 */

import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';

const config = new pulumi.Config();
const projectName = pulumi.getProject();
const stack = pulumi.getStack();

// VPC for database
const vpc = new awsx.ec2.Vpc(`${projectName}-vpc`, {
  numberOfAvailabilityZones: 2,
  natGateways: { strategy: 'Single' },
});

// RDS PostgreSQL with pgvector
const dbSubnetGroup = new aws.rds.SubnetGroup(`${projectName}-db-subnet`, {
  subnetIds: vpc.privateSubnetIds,
  tags: { Name: `${projectName}-${stack}-db-subnet` },
});

const dbSecurityGroup = new aws.ec2.SecurityGroup(`${projectName}-db-sg`, {
  vpcId: vpc.vpcId,
  ingress: [
    {
      protocol: 'tcp',
      fromPort: 5432,
      toPort: 5432,
      cidrBlocks: ['10.0.0.0/16'],
    },
  ],
  egress: [
    {
      protocol: '-1',
      fromPort: 0,
      toPort: 0,
      cidrBlocks: ['0.0.0.0/0'],
    },
  ],
});

const db = new aws.rds.Instance(`${projectName}-db`, {
  engine: 'postgres',
  engineVersion: '15.4',
  instanceClass: config.get('dbInstanceClass') || 'db.t3.micro',
  allocatedStorage: 20,
  dbName: 'agents_db',
  username: 'postgres',
  password: config.requireSecret('dbPassword'),
  dbSubnetGroupName: dbSubnetGroup.name,
  vpcSecurityGroupIds: [dbSecurityGroup.id],
  skipFinalSnapshot: true,
  publiclyAccessible: false,
  tags: { Name: `${projectName}-${stack}-db` },
});

// SSM Parameters for secrets
const openaiKey = new aws.ssm.Parameter(`${projectName}-openai-key`, {
  type: 'SecureString',
  value: config.requireSecret('openaiApiKey'),
});

const anthropicKey = new aws.ssm.Parameter(`${projectName}-anthropic-key`, {
  type: 'SecureString',
  value: config.requireSecret('anthropicApiKey'),
});

// ECR Repository for container images
const repo = new awsx.ecr.Repository(`${projectName}-repo`, {
  forceDelete: true,
});

// Build and push Docker image
const image = new awsx.ecr.Image(`${projectName}-image`, {
  repositoryUrl: repo.url,
  context: '../../..',
  dockerfile: '../../docker/Dockerfile',
});

// IAM Role for App Runner
const appRunnerRole = new aws.iam.Role(`${projectName}-apprunner-role`, {
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
    Service: 'tasks.apprunner.amazonaws.com',
  }),
});

// Attach policies for SSM access
new aws.iam.RolePolicyAttachment(`${projectName}-apprunner-ssm`, {
  role: appRunnerRole.name,
  policyArn: 'arn:aws:iam::aws:policy/AmazonSSMReadOnlyAccess',
});

// App Runner Service
const appRunner = new aws.apprunner.Service(`${projectName}-service`, {
  serviceName: `${projectName}-${stack}`,
  sourceConfiguration: {
    imageRepository: {
      imageIdentifier: image.imageUri,
      imageRepositoryType: 'ECR',
      imageConfiguration: {
        port: '3000',
        runtimeEnvironmentVariables: {
          NODE_ENV: 'production',
          MODEL_PROVIDER: config.get('modelProvider') || 'openai',
          // NOTE: In production, use connection string without embedded password
          // and configure Cloud SQL Auth Proxy or VPC peering instead
          DATABASE_HOST: db.endpoint,
          DATABASE_NAME: db.dbName,
          DATABASE_USER: 'postgres',
        },
        runtimeEnvironmentSecrets: {
          OPENAI_API_KEY: openaiKey.arn,
          ANTHROPIC_API_KEY: anthropicKey.arn,
          // Database password stored securely in SSM Parameter Store
          DATABASE_PASSWORD: pulumi.interpolate`arn:aws:ssm:${aws.getRegionOutput().name}:${aws.getCallerIdentityOutput().accountId}:parameter/${projectName}/${stack}/db-password`,
        },
      },
    },
    autoDeploymentsEnabled: true,
  },
  instanceConfiguration: {
    cpu: '1024',
    memory: '2048',
    instanceRoleArn: appRunnerRole.arn,
  },
  healthCheckConfiguration: {
    protocol: 'HTTP',
    path: '/health',
    interval: 10,
    timeout: 5,
    healthyThreshold: 1,
    unhealthyThreshold: 5,
  },
});

// Exports
export const vpcId = vpc.vpcId;
export const dbEndpoint = db.endpoint;
export const dbName = db.dbName;
export const appRunnerUrl = appRunner.serviceUrl;
export const imageUri = image.imageUri;
