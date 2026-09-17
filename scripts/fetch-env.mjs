#!/usr/bin/env node
// Pulls this project's secrets from SSM Parameter Store into a local
// .env file. Requires AWS credentials configured locally (env vars,
// `aws configure`, or SSO) for an identity that has the `read_secrets`
// IAM policy from terraform/ attached. See terraform/README.md.

import { SSMClient, GetParametersByPathCommand } from '@aws-sdk/client-ssm';
import { writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(scriptDir, '..', '.env');

const project = process.env.SSM_PROJECT ?? 'maria-ol';
const environment = process.env.SSM_ENVIRONMENT ?? 'development';
const region = process.env.AWS_REGION ?? 'us-east-1';
const ssmPath = `/${project}/${environment}/backend`;

if (existsSync(envPath) && !process.argv.includes('--force')) {
  console.error(`Refusing to overwrite existing ${envPath}. Pass --force to overwrite.`);
  process.exit(1);
}

const client = new SSMClient({ region });
const params = {};
let nextToken;

do {
  const response = await client.send(
    new GetParametersByPathCommand({
      Path: ssmPath,
      WithDecryption: true,
      NextToken: nextToken,
    })
  );
  for (const param of response.Parameters ?? []) {
    params[param.Name.slice(ssmPath.length + 1)] = param.Value ?? '';
  }
  nextToken = response.NextToken;
} while (nextToken);

if (Object.keys(params).length === 0) {
  console.error(`No parameters found under ${ssmPath}. Has \`terraform apply\` been run for environment "${environment}"?`);
  process.exit(1);
}

const lines = Object.entries(params)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([key, value]) => `${key}=${JSON.stringify(value)}`);

writeFileSync(envPath, lines.join('\n') + '\n');
console.log(`Wrote ${lines.length} variables to ${envPath} from ${ssmPath}`);
