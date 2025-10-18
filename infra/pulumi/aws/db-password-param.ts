/**
 * Database password SSM parameter (separate file for clarity)
 */

import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';

const config = new pulumi.Config();
const projectName = pulumi.getProject();
const stack = pulumi.getStack();

// Store database password in SSM Parameter Store
export const dbPasswordParam = new aws.ssm.Parameter(`${projectName}-db-password`, {
  name: `/${projectName}/${stack}/db-password`,
  type: 'SecureString',
  value: config.requireSecret('dbPassword'),
  tags: {
    Environment: stack,
  },
});
