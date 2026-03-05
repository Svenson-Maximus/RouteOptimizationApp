# AWS Deployment Runbook

## Target Runtime
- UI: S3 + CloudFront
- Business services: ECS Fargate
- Optimizer engine: ECS task/service
- Database: RDS PostgreSQL

## Recommended deployment sequence
1. Provision base network (VPC/subnets/security groups).
2. Provision RDS PostgreSQL.
3. Provision ECR repositories.
4. Build and push service images.
5. Deploy ECS services (private subnets).
6. Deploy UI to S3 + CloudFront.
7. Configure secrets in AWS Secrets Manager.
8. Configure CloudWatch alarms and dashboards.

## CI/CD (GitLab)
- Build/test on every merge request.
- Build container images on main branch.
- Deploy to dev automatically.
- Promote to staging/prod with approvals.
