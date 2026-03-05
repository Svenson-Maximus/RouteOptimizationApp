# AWS Infrastructure Blueprint

This folder defines the target cloud deployment model for Focus Project 2.

## Target Services
- UI: S3 + CloudFront
- APIs/services: ECS Fargate
- Database: Amazon RDS PostgreSQL
- Object storage: S3
- Container registry: ECR
- Secrets: AWS Secrets Manager
- Messaging (optional but recommended): SQS
- Observability: CloudWatch

## Planned IaC Modules
- `network` (VPC, public/private subnets, routing)
- `security` (security groups, IAM roles)
- `data` (RDS PostgreSQL)
- `compute` (ECS cluster/services/tasks)
- `storage` (S3 buckets)
- `edge` (CloudFront)
- `secrets` (Secrets Manager)

## Notes
- Keep runtime services private where possible.
- Use ALB/API Gateway for controlled ingress.
- Use separate environments: `dev`, `staging`, `prod`.
