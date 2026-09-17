data "aws_caller_identity" "current" {}

data "aws_kms_alias" "ssm" {
  name = "alias/aws/ssm"
}

# --- Strapi's own S3 credentials (AWS_ACCESS_KEY_ID / AWS_ACCESS_SECRET) ---
# Scoped to just this one bucket, matching config/plugins.ts.

data "aws_iam_policy_document" "strapi_uploads" {
  statement {
    sid       = "AllowObjectReadWrite"
    effect    = "Allow"
    actions   = ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"]
    resources = ["${aws_s3_bucket.uploads.arn}/*"]
  }

  statement {
    sid       = "AllowListBucket"
    effect    = "Allow"
    actions   = ["s3:ListBucket"]
    resources = [aws_s3_bucket.uploads.arn]
  }
}

resource "aws_iam_user" "strapi_uploads" {
  name = "${var.project}-${var.environment}-strapi-uploads"

  tags = {
    Project     = var.project
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

resource "aws_iam_user_policy" "strapi_uploads" {
  name   = "${var.project}-${var.environment}-strapi-uploads-s3"
  user   = aws_iam_user.strapi_uploads.name
  policy = data.aws_iam_policy_document.strapi_uploads.json
}

resource "aws_iam_access_key" "strapi_uploads" {
  user = aws_iam_user.strapi_uploads.name
}

# --- Developer-facing policy: read (and decrypt) this project's SSM
# parameters. Attach this to your own IAM user/role so `npm run
# secrets:pull` can fetch env vars onto your machine. Not attached to
# anyone automatically - do that by hand (or in your identity provider). ---

data "aws_iam_policy_document" "read_secrets" {
  statement {
    sid       = "ReadMariaOlParameters"
    effect    = "Allow"
    actions   = ["ssm:GetParameter", "ssm:GetParametersByPath"]
    resources = ["arn:aws:ssm:${var.aws_region}:${data.aws_caller_identity.current.account_id}:parameter/${var.project}/${var.environment}/*"]
  }

  statement {
    sid       = "DecryptMariaOlSecureStrings"
    effect    = "Allow"
    actions   = ["kms:Decrypt"]
    resources = [data.aws_kms_alias.ssm.target_key_arn]
  }
}

resource "aws_iam_policy" "read_secrets" {
  name        = "${var.project}-${var.environment}-read-secrets"
  description = "Read access to ${var.project} ${var.environment} SSM parameters, for pulling env vars onto a dev machine"
  policy      = data.aws_iam_policy_document.read_secrets.json
}
