# GMS v3.1 — 翻訳用語管理システム

## Overview

GMSは、日本語・英語を中心とした専門用語を検索・管理するための
Java / Spring Boot Webアプリケーションです。

現在のGMS v3.1は、既存のGMS v2をBaselineとして再構成したうえで、
以下の技術検証を統合したシステムです。

- Infrastructure as Code
- Reproducible infrastructure
- Application observability
- Automated CI
- Automated production deployment
- Artifact integrity verification
- Infrastructure / application recovery design

GMS v3.1は継続的な商用サービスではなく、
既存Webアプリケーションを題材とした個人技術検証用システムとして運用しています。

---

## Architecture

Public request path:

```text
Client
  |
  | HTTPS
  v
DreamHost DNS
  |
  v
Amazon CloudFront
  |
  +-- ACM
  +-- AWS WAF
  |
  | HTTP / IPv6
  v
origin.sunlightjetrans.com
  |
  v
Persistent ENI / IPv6
  |
  v
EC2
  |
  v
Nginx :80
  |
  v
Spring Boot :8080
  |
  v
MySQL
  |
  v
Dedicated EBS
/var/lib/mysql
```

Public URL:

```text
https://sunlightjetrans.com
```

AWS Region:

```text
ap-northeast-1
```

CloudFront用ACM CertificateおよびWAFは `us-east-1` に存在します。

DreamHost DNSは現在のAWS Terraform管理境界外です。

---

## Application Stack

| Component | Technology |
|---|---|
| Language | Java 17 |
| Framework | Spring Boot |
| ORM | Hibernate |
| Connection Pool | HikariCP |
| Database | MySQL |
| Web Server | Nginx |
| Build | Maven Wrapper |
| Process Management | systemd |
| Metrics | Spring Boot Actuator / Micrometer |
| Metrics Collection | Prometheus |
| Visualization | Grafana |

Production application:

```text
/home/ec2-user/GMS-v3.1.jar
```

systemd service:

```text
tgms.service
```

---

## Infrastructure as Code

AWS infrastructure is managed from:

```text
infra/terraform/
```

The Terraform configuration manages the current GMS production infrastructure,
including the core networking, compute, persistent database storage,
CloudFront, ACM, WAF, IAM, GitHub OIDC, and deployment artifact S3 resources.

Verification:

```bash
cd infra/terraform

terraform fmt -check
terraform validate
terraform plan
```

Final integration testing confirmed:

```text
No changes. Your infrastructure matches the configuration.
```

The MySQL data EBS is treated as persistent data and is protected independently
from disposable compute.

---

## Database Persistence and Recovery

MySQL data is stored on a dedicated EBS volume mounted at:

```text
/var/lib/mysql
```

Recovery order for GMS v3.1:

```text
1. Existing MySQL EBS
2. Restore EBS from MySQL snapshot
3. SQL dump is not part of the current recovery design
```

Compute and persistent database data intentionally have separate lifecycles.

---

## Observability

GMS exposes Spring Boot metrics through:

```text
/actuator/health
/actuator/prometheus
```

Monitoring configuration is stored in Git:

```text
infra/monitoring/
├── prometheus/
│   └── prometheus.yml
└── grafana/
    ├── dashboards/
    │   └── gms-overview.json
    └── provisioning/
        ├── dashboards/
        │   └── dashboards.yml
        └── datasources/
            └── prometheus.yml
```

The Grafana dashboard contains:

- JVM Heap Memory Used
- HTTP Request Rate
- HTTP Average Latency
- HikariCP Connection Pool

Prometheus and Grafana are currently intended to run locally on a Mac when
monitoring is required.

They are not deployed as 24/7 production monitoring services in GMS v3.1.

A typical monitoring path is:

```text
Production GMS
    |
    | /actuator/prometheus
    v
SSH tunnel
    |
    v
Local Prometheus
    |
    v
Local Grafana
```

The monitoring configuration can be reconstructed from the Git-managed files.

---

## Continuous Integration

GitHub Actions workflow:

```text
.github/workflows/ci.yml
```

CI runs on pushes and pull requests targeting the `v3.1` branch.

Build environment:

```text
Java 17
MySQL 8.0.44
Maven
```

Primary verification command:

```bash
./mvnw clean verify
```

A successful build produces the JAR artifact used by the deployment job.

---

## Continuous Deployment

Production deployment runs after a successful CI build on pushes to:

```text
v3.1
```

Deployment path:

```text
Git push
   |
   v
GitHub Actions CI
   |
   v
Verified JAR artifact
   |
   v
GitHub OIDC
   |
   v
AWS IAM Role
   |
   v
S3 release ledger
   |
   v
AWS Systems Manager Run Command
   |
   v
Production EC2
   |
   v
SHA256 verification
   |
   v
GMS-v3.1.jar
   |
   v
tgms.service restart
   |
   v
/actuator/health
```

No long-lived AWS access key or EC2 SSH private key is stored in GitHub Actions.

Release artifacts are stored under:

```text
s3://gms-artifacts-180294215932-ap-northeast-1/releases/<commit-sha>/
```

Each release contains:

```text
GMS-v3.1.jar
SHA256
```

The deployment process verifies SHA256 before switching the production JAR.

A previous JAR is retained during deployment so that a failed health check can
trigger rollback.

---

## Build

Run tests and build:

```bash
./mvnw clean verify
```

Build without tests when explicitly required:

```bash
./mvnw clean package -DskipTests
```

Generated artifacts are written under:

```text
target/
```

---

## Repository Structure

```text
.
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── infra/
│   ├── bootstrap/
│   ├── docs/
│   ├── legacy-v2/
│   ├── monitoring/
│   ├── reconstruction-test/
│   └── terraform/
│
├── src/
│   ├── main/
│   └── test/
│
├── .gitignore
├── pom.xml
├── mvnw
└── README.md
```

---

## Historical Baseline

GMS v3.1 was built from the reconstructed and production-verified GMS v2
baseline.

The v2 reconstruction and original runtime configuration remain preserved for
historical and recovery reference under:

```text
infra/legacy-v2/
```

The detailed AWS discovery, dependency analysis, reconstruction process, and
architecture investigation are retained under:

```text
infra/docs/
infra/reconstruction-test/
```

These documents intentionally preserve parts of the investigation history.
When older candidate or pending states conflict with later confirmed sections,
the later confirmed state takes precedence.

---

## GMS v3.1 Final Integration Test

The final integration test verifies the system as a whole rather than individual
features in isolation.

Verified areas:

```text
Git source of truth
Terraform / AWS infrastructure
Production EC2 runtime
Dedicated MySQL EBS
Spring Boot health
Actuator / Micrometer metrics
Prometheus scraping
Grafana provisioning
GitHub Actions CI
GitHub Actions CD
GitHub OIDC
S3 release ledger
SSM production deployment
Artifact SHA256 integrity
External HTTPS path
Application database-backed search
```

The final completion condition is:

```text
Git
 -> CI
 -> Artifact
 -> OIDC
 -> S3
 -> SSM
 -> EC2
 -> Spring Boot
 -> Metrics
 -> Prometheus
 -> Grafana
```

with production functionality verified and Terraform reporting no unintended
infrastructure differences.

---

## Version

Current development line:

```text
GMS v3.1
```

Previous reconstructed baseline:

```text
GMS v2
```
