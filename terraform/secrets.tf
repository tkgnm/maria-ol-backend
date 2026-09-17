# Generates and stores every env var config/*.ts reads via env(...), plus
# the S3/CDN values, as SSM parameters under /{project}/{environment}/....
# `npm run secrets:pull` (scripts/fetch-env.mjs) reads this whole path back
# into a local .env.
#
# Values are generated with random_id(byte_length = 16).b64_std, which
# matches Strapi's own `openssl rand -base64 16` convention for these keys.

locals {
  backend_path  = "/${var.project}/${var.environment}/backend"
  frontend_path = "/${var.project}/${var.environment}/frontend"

  common_tags = {
    Project     = var.project
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

resource "random_id" "app_key" {
  count       = 2
  byte_length = 16
}

resource "random_id" "api_token_salt" {
  byte_length = 16
}

resource "random_id" "admin_jwt_secret" {
  byte_length = 16
}

resource "random_id" "transfer_token_salt" {
  byte_length = 16
}

resource "random_id" "jwt_secret" {
  byte_length = 16
}

resource "random_id" "encryption_key" {
  byte_length = 16
}

resource "aws_ssm_parameter" "app_keys" {
  name  = "${local.backend_path}/APP_KEYS"
  type  = "SecureString"
  value = join(",", [for k in random_id.app_key : k.b64_std])
  tags  = local.common_tags
}

resource "aws_ssm_parameter" "api_token_salt" {
  name  = "${local.backend_path}/API_TOKEN_SALT"
  type  = "SecureString"
  value = random_id.api_token_salt.b64_std
  tags  = local.common_tags
}

resource "aws_ssm_parameter" "admin_jwt_secret" {
  name  = "${local.backend_path}/ADMIN_JWT_SECRET"
  type  = "SecureString"
  value = random_id.admin_jwt_secret.b64_std
  tags  = local.common_tags
}

resource "aws_ssm_parameter" "transfer_token_salt" {
  name  = "${local.backend_path}/TRANSFER_TOKEN_SALT"
  type  = "SecureString"
  value = random_id.transfer_token_salt.b64_std
  tags  = local.common_tags
}

resource "aws_ssm_parameter" "jwt_secret" {
  name  = "${local.backend_path}/JWT_SECRET"
  type  = "SecureString"
  value = random_id.jwt_secret.b64_std
  tags  = local.common_tags
}

resource "aws_ssm_parameter" "encryption_key" {
  name  = "${local.backend_path}/ENCRYPTION_KEY"
  type  = "SecureString"
  value = random_id.encryption_key.b64_std
  tags  = local.common_tags
}

resource "aws_ssm_parameter" "aws_region" {
  name  = "${local.backend_path}/AWS_REGION"
  type  = "String"
  value = var.aws_region
  tags  = local.common_tags
}

resource "aws_ssm_parameter" "aws_bucket" {
  name  = "${local.backend_path}/AWS_BUCKET"
  type  = "String"
  value = aws_s3_bucket.uploads.bucket
  tags  = local.common_tags
}

resource "aws_ssm_parameter" "aws_access_key_id" {
  name  = "${local.backend_path}/AWS_ACCESS_KEY_ID"
  type  = "SecureString"
  value = aws_iam_access_key.strapi_uploads.id
  tags  = local.common_tags
}

resource "aws_ssm_parameter" "aws_access_secret" {
  name  = "${local.backend_path}/AWS_ACCESS_SECRET"
  type  = "SecureString"
  value = aws_iam_access_key.strapi_uploads.secret
  tags  = local.common_tags
}

resource "aws_ssm_parameter" "cdn_url" {
  name  = "${local.backend_path}/CDN_URL"
  type  = "String"
  value = "https://${aws_cloudfront_distribution.uploads.domain_name}"
  tags  = local.common_tags
}

# Strapi generates this token itself (admin panel > Settings > API
# Tokens) - see the frontend_api_token_placeholder variable description.
resource "aws_ssm_parameter" "frontend_api_key" {
  name  = "${local.frontend_path}/API_KEY"
  type  = "SecureString"
  value = var.frontend_api_token_placeholder
  tags  = local.common_tags

  lifecycle {
    ignore_changes = [value]
  }
}
