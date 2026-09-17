# Media upload bucket for the Strapi "upload" plugin (aws-s3 provider,
# see config/plugins.ts). Private bucket, served publicly only through
# the CloudFront distribution in cloudfront.tf.

resource "aws_s3_bucket" "uploads" {
  bucket = var.bucket_name

  tags = {
    Project     = var.project
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

resource "aws_s3_bucket_public_access_block" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# "Bucket owner enforced" - matches the ACL: null setting already in
# config/plugins.ts, which assumes ACLs are disabled on the bucket.
resource "aws_s3_bucket_ownership_controls" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}
