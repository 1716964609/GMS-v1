# GMS AWS Inventory

## 1. 目的

この文書は、既存 GMS v2 AWS Environment を Terraform 管理へ移行する前の Resource Inventory を記録する。

現在の作業順:

~~~text
AWS Resource Discovery
        ↓
Dependency Analysis
        ↓
Terraform Management Boundary
        ↓
Terraform Import
        ↓
Generated HCL Review / Cleanup
        ↓
terraform plan
        ↓
No unintended changes
~~~

AWS 上に存在する Resource を無条件ですべて import してはいけない。

各 Resource は以下の4分類で判断する。

| Classification | 意味 |
|---|---|
| A | 現在の GMS に必要 |
| B | 過去の GMS 構成の残骸 |
| C | AWS Default / AWS Managed Resource |
| D | 現時点では不明、追加調査が必要 |

---

## 2. Resource Explorer

対象 Region:

~~~text
ap-northeast-1
~~~

Resource Explorer:

~~~text
TotalResources: 54
Complete: true
~~~

これは現在の Tokyo Local Resource Explorer View が確認できる Resource の一覧。

CloudFront、IAM などの Global Resource や、別 Region の Resource をすべて表しているわけではない。

---

## 3. Compute

### EC2

~~~text
Resource Type:
ec2:instance

Instance ID:
i-08e35c2a08562e6e7

Classification:
A candidate

Status:
Dependency verification required
~~~

### AMI

~~~text
Resource Type:
ec2:image

AMI ID:
ami-084a581e02ce361c7

Classification:
D

Status:
用途を確認する
~~~

### EC2 Key Pair

~~~text
Resource Type:
ec2:key-pair

Key Pair ID:
key-0fe6a7ba6713a593e

Classification:
D

Status:
EC2 が実際に使用している Key Pair か確認する
~~~

### Spot Instance Request

~~~text
Resource Type:
ec2:spot-instances-request

ID:
sir-8smfdayg

Classification:
D

Status:
現行 EC2 との関係を確認する
~~~

---

## 4. EBS

確認済み Volume:

~~~text
vol-00547ee69f9364ec0
vol-0320ea45ddeed577c
~~~

現時点では以下を調査する。

- EC2 Attachment
- Device Name
- Root Device
- /var/lib/mysql 用 Volume
- Volume Type
- Size
- Availability Zone
- Encryption
- KMS Key

Classification:

~~~text
A candidate
~~~

ただし Root EBS と DB EBS では Terraform 上の保護方針を分ける。

---

## 5. Snapshot

### MySQL Baseline Snapshot

~~~text
Snapshot ID:
snap-01f0e460273843840

Name:
GMS-v2-fixed-mysql-data

Project:
GMS

Purpose:
baseline

Version:
v2

MountPoint:
/var/lib/mysql

Classification:
A
~~~

### Root Baseline Snapshot

~~~text
Snapshot ID:
snap-00ebdd9048a27089e

Name:
GMS-v2-fixed-root

Project:
GMS

Purpose:
baseline

Version:
v2

MountPoint:
/

Classification:
A
~~~

### Unknown Snapshot

~~~text
Snapshot ID:
snap-0fcfdb221e827affe

Classification:
D

Status:
用途確認が必要
~~~

---

## 6. VPC

~~~text
Resource Type:
ec2:vpc

VPC ID:
vpc-0a798b79427124107

Name:
プロジェクトnew tgms-vpc

Classification:
A candidate
~~~

GMS EC2 が実際にこの VPC に存在することを確認してから確定する。

---

## 7. Subnet

~~~text
Resource Type:
ec2:subnet

Subnet ID:
subnet-0661039664bcdb978

Name:
プロジェクトnew tgms-subnet-public1-ap-northeast-1a

Classification:
A candidate
~~~

EC2 の SubnetId と照合する。

---

## 8. Internet Gateway

~~~text
Resource Type:
ec2:internet-gateway

Internet Gateway ID:
igw-097835adb8ee089a7

Name:
プロジェクトnew tgms-igw

Classification:
A candidate
~~~

VPC Attachment を確認する。

---

## 9. Route Table

Resource Explorer で3件確認。

### Public Route Table Candidate

~~~text
Route Table ID:
rtb-0a458b7a383a5e645

Name:
プロジェクトnew tgms-rtb-public

Classification:
A candidate
~~~

### Unknown Route Table

~~~text
Route Table ID:
rtb-098826c1a531386ca

Classification:
D
~~~

### Legacy RDS Candidate

~~~text
Route Table ID:
rtb-0013506415efc892c

Name:
RDS-Pvt-rt

Classification:
B candidate
~~~

以前の RDS 構成の残骸である可能性がある。

Route Table は Name だけでは判断せず、Subnet Association と Route を確認してから分類を確定する。

---

## 10. Security Group

確認済み Security Group:

~~~text
sg-08b17e8ef60021448
sg-0603e1bce6fe132af
~~~

Resource Explorer では Security Group Rule が10件存在する。

現時点では:

~~~text
Classification:
D
~~~

次に確認するもの:

- EC2 に Attach されている Security Group
- Ingress Rule
- Egress Rule
- IPv4 / IPv6 Rule
- GMS 公開に必要な Port
- SSH access
- CloudFront Origin access

Terraform import 時には Security Group 本体と Rule の管理方法を先に決定する。

---

## 11. Network Interface

~~~text
Resource Type:
ec2:network-interface

ENI ID:
eni-0c26b8c26d885b76f

Classification:
D
~~~

以下を確認する。

- Attachment Instance ID
- Subnet
- Security Groups
- IPv6 Address
- Public connectivity

特に DreamHost DNS の origin AAAA:

~~~text
2406:da14:190f:d6a8:6c4a:da24:5520:8a7e
~~~

との対応を確認する。

---

## 12. Network ACL

~~~text
Resource Type:
ec2:network-acl

Network ACL ID:
acl-0eebbe8a340fe0b23

Classification:
D
~~~

Default NACL なのか、GMS 用に変更された NACL なのかを確認する。

AWS Default Resource の場合、Terraform で積極的に管理する必要がない可能性がある。

---

## 13. DHCP Options

~~~text
Resource Type:
ec2:dhcp-options

DHCP Options ID:
dopt-0ecfbe765106b620f

Classification:
D
~~~

Default DHCP Options である可能性があるため、Terraform 対象と即断しない。

---

## 14. CloudFront

~~~text
Distribution ID:
E1EF0DWDYA2XH8

ARN:
arn:aws:cloudfront::180294215932:distribution/E1EF0DWDYA2XH8

Status:
Deployed

CloudFront Domain:
d2yxdtkikux26e.cloudfront.net

Alias:
sunlightjetrans.com

Origin:
origin.sunlightjetrans.com

Classification:
A
~~~

主要設定:

~~~text
ViewerProtocolPolicy:
redirect-to-https

AllowedMethods:
GET
HEAD
OPTIONS
PUT
POST
PATCH
DELETE

CachedMethods:
GET
HEAD

OriginProtocolPolicy:
http-only

Origin IP address type:
IPv6

Compress:
true

HTTP Version:
HTTP2

IPv6:
Enabled

OriginShield:
disabled

OriginGroups:
0

LambdaFunctionAssociations:
0

FunctionAssociations:
0
~~~

Terraform 管理対象候補として確定度が高い。

---

## 15. ACM

~~~text
Region:
us-east-1

Certificate ARN:
arn:aws:acm:us-east-1:180294215932:certificate/7e970d09-0bf1-4ca4-ba04-dedb6f3dbffb

Classification:
A
~~~

CloudFront ViewerCertificate が直接参照している。

DreamHost DNS に ACM DNS Validation CNAME が存在する。

詳細確認項目:

- DomainName
- SubjectAlternativeNames
- ValidationMethod
- Renewal status
- Terraform で Certificate 自体を管理するか
- DNS Validation Record をどこまでコード化するか

---

## 16. AWS WAF

~~~text
Region/API endpoint:
us-east-1

Scope:
CLOUDFRONT

Web ACL Name:
CreatedByCloudFront-056855fc

Web ACL ARN:
arn:aws:wafv2:us-east-1:180294215932:global/webacl/CreatedByCloudFront-056855fc/70949ab2-45bd-432f-bd01-56e89676739a

Classification:
A
~~~

CloudFront Distribution が直接参照している。

ただし Terraform import 前に以下を確認する。

- Rule
- Managed Rule Group
- DefaultAction
- VisibilityConfig
- CloudWatch Metric
- GMS に本当に必要な設定か

---

## 17. DreamHost

DreamHost は AWS Resource ではないが、GMS Production Architecture の重要な External Dependency。

### Domain / DNS

~~~text
Domain:
sunlightjetrans.com

Authoritative Nameservers:
ns1.dreamhost.com
ns2.dreamhost.com
ns3.dreamhost.com
~~~

### Public Site Record

~~~text
sunlightjetrans.com

ALIAS:
d2yxdtkikux26e.cloudfront.net
~~~

### Origin Record

~~~text
origin.sunlightjetrans.com

AAAA:
2406:da14:190f:d6a8:6c4a:da24:5520:8a7e
~~~

### ACM Validation

DreamHost DNS に ACM Validation 用 CNAME が存在する。

Terraform classification:

~~~text
External Dependency
Not managed by current AWS Terraform configuration
~~~

ただし Disaster Recovery のため設定情報は Git に記録する。

---

## 18. KMS

Resource Explorer で2件確認。

~~~text
kms:key
Count: 2
~~~

現時点では GMS との関連性不明。

Classification:

~~~text
D
~~~

EBS Encryption や他の AWS Resource から参照されているかを確認する。

---

## 19. RDS Related Resources

確認されたもの:

~~~text
rds:subgrp
Count: 3

rds:pg
Count: 1

rds:og
Count: 1

CloudWatch Log Group:
RDSOSMetrics

Route Table:
RDS-Pvt-rt
~~~

現在の GMS v2 は MySQL を Dedicated EBS 上で稼働させており、RDS は現在の DB Architecture ではない。

したがって現時点では:

~~~text
Classification:
B or C candidate
~~~

以前の GMS RDS 構成の残骸、または AWS Default Resource である可能性がある。

現在の GMS に必要であることが確認されない限り Terraform import しない。

---

## 20. MemoryDB / ElastiCache

Resource Explorer で確認:

~~~text
memorydb:parametergroup
Count: 6

memorydb:user
Count: 1

memorydb:acl
Count: 1

elasticache:user
Count: 1
~~~

名称から Default Resource が多い。

現在の GMS Architecture に Redis / MemoryDB を利用している証拠はない。

現時点:

~~~text
Classification:
C candidate
~~~

Terraform import 対象にはしない。

---

## 21. Athena

確認:

~~~text
athena:workgroup
primary

athena:datacatalog
AwsDataCatalog
~~~

AWS Default Resource の可能性が高い。

Classification:

~~~text
C candidate
~~~

現在の GMS との関連性が確認できない限り Terraform import しない。

---

## 22. EventBridge

~~~text
events:event-bus
default
~~~

AWS Default Event Bus。

Classification:

~~~text
C candidate
~~~

---

## 23. X-Ray

~~~text
xray:sampling-rule
Default
~~~

AWS Default Resource。

現行 GMS で X-Ray を利用している証拠は現在ない。

Classification:

~~~text
C candidate
~~~

---

## 24. App Runner

~~~text
apprunner:autoscalingconfiguration

DefaultConfiguration
~~~

AWS Default / Service Managed Resource の可能性が高い。

Classification:

~~~text
C candidate
~~~

現在の GMS は EC2 上で動作しているため、現行 GMS の Terraform import 対象にはしない。

---

## 25. Resource Explorer

~~~text
resource-explorer-2:index
resource-explorer-2:view
~~~

今回の棚卸しに使用している Resource Explorer 自身の Resource。

Classification:

~~~text
C
~~~

GMS application infrastructure の Terraform 管理対象には含めない。

---

## 26. 現時点の Terraform 対象候補

確定度が比較的高いもの:

~~~text
VPC
Subnet
Internet Gateway
Public Route Table
Route Table Association
Security Group
EC2
Root EBS
MySQL EBS
CloudFront
ACM
WAF
~~~

要調査:

~~~text
ENI
Network ACL
DHCP Options
AMI
Key Pair
KMS
Snapshot management
IAM Role / Instance Profile
~~~

原則対象外候補:

~~~text
DreamHost
AWS Managed CloudFront Policies
MemoryDB default resources
ElastiCache default resources
Athena default resources
EventBridge default event bus
X-Ray default sampling rule
App Runner default configuration
Resource Explorer resources
旧 RDS architecture resources
~~~

---

## 27. 次の調査対象

最優先は EC2:

~~~text
i-08e35c2a08562e6e7
~~~

から実際の依存関係を確定すること。

確認する:

~~~text
EC2
├── VPC
├── Subnet
├── ENI
├── IPv6
├── Security Groups
├── Route
├── Root EBS
├── MySQL EBS
├── Key Pair
└── IAM Instance Profile
~~~

その後:

~~~text
ACM details
WAF rules
Global dependencies
Cross-region dependencies
~~~

を確認する。

依存関係の確認が終わるまでは Terraform import を開始しない。

---

## 28. Terraform Step 2 Completion Condition

Terraform 化の最終条件:

~~~text
Existing AWS resources
        ↓
Terraform import
        ↓
Generated HCL
        ↓
Human review / cleanup
        ↓
terraform plan
        ↓
No unintended create
No unintended update
No unintended destroy
~~~

特に DB EBS は:

~~~text
lifecycle {
  prevent_destroy = true
}
~~~

を利用する方向で設計する。

最終的には、Terraform Code と実際の GMS Infrastructure が意図した範囲で一致している状態を GMS v3.1 Step 2 の完成とする。
