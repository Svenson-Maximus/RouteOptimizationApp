# Deployment View

## Purpose
Describe runtime deployment across local and cloud environments.

## Local
- Docker Compose: PostgreSQL (+ optional pgAdmin)
- Services and UI run locally during development

## AWS Target
- UI: S3 + CloudFront
- Services: ECS Fargate
- Database: RDS PostgreSQL
- Artifacts/uploads: S3
- Secrets: AWS Secrets Manager
- Observability: CloudWatch

## To Finalize Later
- VPC and subnet model
- Security groups and IAM role mapping
- Staging vs production separation
