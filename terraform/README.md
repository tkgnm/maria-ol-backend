# maria-ol infrastructure

Terraform that provisions the AWS side of maria-ol and stores every secret
it and the app need in **SSM Parameter Store**, so a new machine can go
from `git clone` to a running app with one `terraform apply` (by whoever
owns the AWS account) and one `npm run secrets:pull` (everyone else).

## What this creates

- **S3 bucket** for Strapi media uploads (private, bucket-owner-enforced).
- **CloudFront distribution + Origin Access Control** in front of it, so
  the bucket itself never has to be public.
- **IAM user** with S3 access scoped to just that bucket - its access key
  becomes `AWS_ACCESS_KEY_ID` / `AWS_ACCESS_SECRET` for the Strapi
  `aws-s3` upload provider (see `../config/plugins.ts`).
- **IAM policy** (`read_secrets` output) that grants read access to this
  project's SSM parameters - attach it to your own IAM user/role so you
  can pull secrets. Terraform does not attach it to anyone automatically.
- **SSM parameters** under `/{project}/{environment}/backend/*` and
  `/{project}/{environment}/frontend/*` for every secret in
  `../.env.example` (`APP_KEYS`, `JWT_SECRET`, etc. are generated for you)
  plus the frontend's `API_KEY`.

**Not included:** a database. Locally the app defaults to sqlite; whatever
manages your production Postgres (Fly Postgres, etc.) is unrelated to AWS
and out of scope here.

## ⚠️ Before you run this

If the S3 bucket / CloudFront distribution mentioned in `plugins.ts`'s
comments ("Images are served through CloudFront (private bucket + OAC)")
were created by hand, `terraform apply` will try to create **new**,
separate resources rather than adopt them. Either:

- pick a fresh `bucket_name` / `environment` and treat this as a new
  environment (migrate uploads over later), or
- `terraform import` the existing bucket and distribution into this state
  before running `apply` - ask if you want help writing the import
  commands for your specific resource IDs.

This also creates a CloudFront distribution, which costs money and takes
~10-15 minutes to deploy or tear down - don't run `apply`/`destroy` as a
quick experiment.

## One-time setup (whoever owns the AWS account)

```bash
brew install terraform awscli   # or your platform's equivalent
aws configure                   # or `aws sso login` if you use SSO
```

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# edit terraform.tfvars: bucket_name must be globally unique

terraform init
terraform plan    # review every resource before creating anything
terraform apply
```

Then, for each teammate who needs to pull secrets, attach the policy from
the `read_secrets_policy_arn` output to their IAM user/role:

```bash
aws iam attach-user-policy \
  --user-name <their-iam-username> \
  --policy-arn "$(terraform output -raw read_secrets_policy_arn)"
```

Finally, create a real Strapi API token (admin panel > Settings > API
Tokens) and overwrite the placeholder Terraform wrote for it:

```bash
aws ssm put-parameter \
  --name "$(terraform output -raw ssm_frontend_path)/API_KEY" \
  --type SecureString \
  --value "<the real token>" \
  --overwrite
```

## Pulling secrets onto any machine

Once your IAM identity has the `read_secrets` policy attached and AWS
credentials configured locally:

```bash
# in maria-ol-backend/
npm run secrets:pull

# in maria-ol-frontend/
npm run secrets:pull
```

This writes `.env` in each project from the corresponding SSM path (see
`../scripts/fetch-env.mjs`). `.env` is gitignored in both repos - it's
never meant to be committed.

## Notes / next hardening steps

- Terraform state (`terraform.tfstate`, gitignored) contains every
  generated secret in plaintext. Fine for a single-operator setup; before
  adding collaborators, move to a remote backend (S3 bucket with
  encryption + a DynamoDB lock table) instead of a local state file.
- `environment` defaults to `development`. Run `terraform apply
  -var environment=production` (with its own `bucket_name`) to stand up a
  separate, real production environment under its own SSM path once
  you're ready - it won't collide with development's resources or secrets.
