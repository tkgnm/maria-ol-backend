variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "us-east-1"
}

variable "project" {
  description = "Project name, used as a prefix for resource names and the SSM parameter path"
  type        = string
  default     = "maria-ol"
}

variable "environment" {
  description = "Environment name (e.g. development, production). Keeps SSM paths and resource names separate per environment."
  type        = string
  default     = "development"
}

variable "bucket_name" {
  description = "Name of the S3 bucket used for Strapi media uploads. Must be globally unique across all AWS accounts."
  type        = string
}

variable "frontend_api_token_placeholder" {
  description = <<-EOT
    Placeholder written to SSM for the frontend's Strapi API token. Strapi
    generates this token itself (Settings > API Tokens in the admin panel),
    so Terraform can't create the real value - apply once, generate the
    token in Strapi, then overwrite this parameter by hand:
      aws ssm put-parameter --name <path from output> --type SecureString --value <token> --overwrite
    Terraform ignores changes to this parameter's value after creation, so
    it won't clobber the real token on future applies.
  EOT
  type        = string
  default     = "REPLACE_ME_AFTER_CREATING_TOKEN_IN_STRAPI_ADMIN"
}
