output "s3_bucket_name" {
  description = "Name of the uploads bucket"
  value       = aws_s3_bucket.uploads.bucket
}

output "cloudfront_domain_name" {
  description = "CloudFront domain to use as CDN_URL"
  value       = "https://${aws_cloudfront_distribution.uploads.domain_name}"
}

output "ssm_backend_path" {
  description = "SSM path prefix holding the backend's env vars"
  value       = local.backend_path
}

output "ssm_frontend_path" {
  description = "SSM path prefix holding the frontend's env vars"
  value       = local.frontend_path
}

output "read_secrets_policy_arn" {
  description = "Attach this IAM policy to a developer's IAM user/role so they can run `npm run secrets:pull`"
  value       = aws_iam_policy.read_secrets.arn
}

output "frontend_api_key_parameter_name" {
  description = "SSM parameter to overwrite once a real Strapi API token exists"
  value       = aws_ssm_parameter.frontend_api_key.name
}
