# GMS v3.1 Architecture

## 1. この文書の目的

この文書は、現在稼働している GMS v2 の実構成を確認・記録し、
GMS v3.1 の基準となる Architecture を残すためのもの。

GMS v3.1 では、現在の構成を不必要に作り直すのではなく、
主に以下を追加する。

- 再現性（Reproducibility）
- 自動化（Automation）
- 可観測性（Observability）
- 復旧可能性（Recoverability）

---

## 2. Core Design Principle

GMS v3.1 の基本思想は以下。

~~~text
EC2 は消えてもいい
→ Terraform で戻す

Application は消えてもいい
→ Git + GitHub Actions で戻す

Monitoring configuration は消えてもいい
→ Git から戻す

Database data だけは消してはいけない
→ Dedicated EBS + Snapshot で守る
~~~

Terraform 単体で GMS 全体を完全復旧するのではなく、
Infrastructure、Application、Configuration、Data をそれぞれ適切な仕組みで復旧する。

---

## 3. 現在確認できている公開通信経路

現時点で複数の実設定から確認できている、
GMS への主な HTTP/HTTPS 通信経路は以下。

~~~text
Client
  |
  | HTTPS
  v
DreamHost Authoritative DNS
  |
  | sunlightjetrans.com
  | ALIAS -> d2yxdtkikux26e.cloudfront.net
  v
AWS CloudFront
  |
  | Distribution ID: E1EF0DWDYA2XH8
  | WAF enabled
  | ACM Certificate enabled
  |
  | Origin:
  | origin.sunlightjetrans.com
  |
  | OriginProtocolPolicy: http-only
  | Origin IP address type: IPv6
  v
DreamHost DNS
  |
  | origin.sunlightjetrans.com
  | AAAA -> 2406:da14:190f:d6a8:6c4a:da24:5520:8a7e
  v
AWS ap-northeast-1
  |
  v
GMS EC2
  |
  v
Nginx
  |
  v
Spring Boot
  |
  v
MySQL
  |
  v
Dedicated EBS mounted at /var/lib/mysql
~~~

この主経路については、以下の複数の設定が相互に一致している。

- DreamHost DNS
- CloudFront Distribution
- CloudFront Origin
- ACM Certificate
- AWS WAF
- origin.sunlightjetrans.com の AAAA Record
- AWS Tokyo 側の GMS Environment

したがって、

~~~text
DreamHost DNS
→ CloudFront
→ WAF
→ origin.sunlightjetrans.com
→ IPv6
→ GMS EC2
~~~

という主な公開通信経路については、かなり高い確度で確認済み。

ただし、
「GMS がこれ以外の AWS Resource を一切利用していない」
という意味ではない。

通信経路以外の Dependency については、
別途 AWS Inventory と Dependency Analysis を行う。

---

## 4. DNS

### 4.1 Authoritative DNS

現在の authoritative DNS は AWS Route 53 ではなく DreamHost。

確認済み Nameserver:

~~~text
ns1.dreamhost.com
ns2.dreamhost.com
ns3.dreamhost.com
~~~

---

### 4.2 Public Site Record

確認済み:

~~~text
sunlightjetrans.com
  ALIAS -> d2yxdtkikux26e.cloudfront.net
~~~

したがって、公開ドメイン `sunlightjetrans.com` は
CloudFront Distribution へ向いている。

---

### 4.3 Origin Record

確認済み:

~~~text
origin.sunlightjetrans.com
  AAAA -> 2406:da14:190f:d6a8:6c4a:da24:5520:8a7e
~~~

CloudFront の Origin DomainName も:

~~~text
origin.sunlightjetrans.com
~~~

となっている。

したがって CloudFront から GMS Origin へのアクセスは、
DreamHost DNS で解決される IPv6 Address を利用している。

---

### 4.4 ACM DNS Validation

DreamHost DNS 上には、
AWS ACM Certificate の DNS Validation 用 CNAME Record も存在する。

概念的には:

~~~text
ACM Certificate
      |
      v
DNS Validation CNAME
      |
      v
DreamHost DNS
~~~

となる。

ACM Certificate を再作成する場合、
DreamHost DNS 側の Validation Record も復旧に必要となる可能性がある。

---

### 4.5 Terraform 管理境界

DreamHost は現在 AWS Terraform の管理対象外とする。

~~~text
DreamHost
├── Domain Registration
└── Authoritative DNS
~~~

ただし GMS Disaster Recovery に必要な External Dependency であるため、
設定内容は Git 上に記録する。

Route 53 は現在の GMS Production Path に使用されていることを確認できていないため、
現時点では Terraform 管理対象には含めない。

---

## 5. CloudFront

確認済み Distribution:

~~~text
Distribution ID:
E1EF0DWDYA2XH8

ARN:
arn:aws:cloudfront::180294215932:distribution/E1EF0DWDYA2XH8

CloudFront Domain:
d2yxdtkikux26e.cloudfront.net

Alias:
sunlightjetrans.com

Origin:
origin.sunlightjetrans.com

Status:
Deployed
~~~

主要設定:

~~~text
ViewerProtocolPolicy:
redirect-to-https

OriginProtocolPolicy:
http-only

Origin IP address type:
IPv6

HTTP Version:
HTTP2

IPv6:
Enabled

Compress:
true

OriginShield:
disabled

OriginGroups:
0

LambdaFunctionAssociations:
0

FunctionAssociations:
0
~~~

CloudFront 内部では現時点で以下は使用されていない。

- Origin Group
- Origin Failover
- Lambda@Edge
- CloudFront Functions
- Origin Shield

したがって CloudFront から Origin への経路は比較的単純。

---

## 6. CloudFront Dependency

CloudFront から直接確認できた Dependency:

~~~text
CloudFront
├── ACM Certificate
├── AWS WAF Web ACL
└── AWS Managed CloudFront Policies
~~~

AWS Managed CloudFront Policies は AWS 側で管理される Policy であり、
GMS 独自 Resource として Terraform import する対象ではない。

---

## 7. ACM Certificate

CloudFront が利用している ACM Certificate:

~~~text
Region:
us-east-1

Certificate ARN:
arn:aws:acm:us-east-1:180294215932:certificate/7e970d09-0bf1-4ca4-ba04-dedb6f3dbffb
~~~

CloudFront 用 ACM Certificate が `us-east-1` に存在するのは正常な構成。

DreamHost DNS 上に、
この Certificate 用の DNS Validation CNAME が存在する。

現時点では GMS の Dependency であることは確定している。

Terraform での管理方法については以下を確認後に決定する。

- DomainName
- SubjectAlternativeNames
- ValidationMethod
- Renewal status
- Certificate lifecycle
- DreamHost DNS Validation との関係

---

## 8. AWS WAF

CloudFront が参照している Web ACL:

~~~text
Name:
CreatedByCloudFront-056855fc

ARN:
arn:aws:wafv2:us-east-1:180294215932:global/webacl/CreatedByCloudFront-056855fc/70949ab2-45bd-432f-bd01-56e89676739a

Scope:
CLOUDFRONT
~~~

GMS CloudFront Distribution に直接関連していることは確認済み。

Terraform import 前に以下を確認する。

- Rule
- Managed Rule Group
- DefaultAction
- VisibilityConfig
- CloudWatch Metrics
- GMS に本当に必要な Rule

---

## 9. AWS Tokyo Environment

現在 GMS の主要 Runtime Environment は:

~~~text
Region:
ap-northeast-1
~~~

Resource Explorer では Tokyo Local View から:

~~~text
TotalResources:
54

Complete:
true
~~~

を確認済み。

ただし、この54件すべてが GMS Resource という意味ではない。

以下が混在している。

~~~text
Current GMS Resource
Legacy GMS Resource
AWS Default Resource
AWS Managed Resource
Unknown Resource
~~~

そのため Terraform import 前に Classification を行う。

---

## 10. VPC

確認済み Candidate:

~~~text
VPC ID:
vpc-0a798b79427124107

Name:
プロジェクトnew tgms-vpc
~~~

名称上 GMS との関連性が非常に高い。

ただし EC2 の実際の VpcId と照合してから、
Terraform 管理対象として最終確定する。

---

## 11. Subnet

確認済み Candidate:

~~~text
Subnet ID:
subnet-0661039664bcdb978

Name:
プロジェクトnew tgms-subnet-public1-ap-northeast-1a
~~~

EC2 の SubnetId と照合して最終確認する。

---

## 12. Internet Gateway

確認済み Candidate:

~~~text
Internet Gateway ID:
igw-097835adb8ee089a7

Name:
プロジェクトnew tgms-igw
~~~

VPC Attachment を確認後、
Terraform 管理対象として確定する。

---

## 13. Route Table

確認済み Public Route Table Candidate:

~~~text
Route Table ID:
rtb-0a458b7a383a5e645

Name:
プロジェクトnew tgms-rtb-public
~~~

その他 Resource Explorer で以下も確認されている。

~~~text
rtb-098826c1a531386ca

rtb-0013506415efc892c
Name: RDS-Pvt-rt
~~~

`RDS-Pvt-rt` は以前の RDS Architecture の残骸である可能性がある。

Terraform import 前に以下を確認する。

- Route
- Internet Gateway Target
- IPv4 / IPv6 Route
- Subnet Association
- Main Route Table
- Current GMS EC2 との関連性

---

## 14. EC2

現在確認されている EC2 Instance:

~~~text
Instance ID:
i-08e35c2a08562e6e7
~~~

この Instance を中心に、
以下の Dependency を確認する。

~~~text
EC2
├── VPC
├── Subnet
├── ENI
├── IPv6 Address
├── Security Groups
├── Route
├── Root EBS
├── MySQL EBS
├── Key Pair
└── IAM Instance Profile
~~~

この Dependency Graph を確定してから Terraform import を開始する。

---

## 15. Network Interface

Resource Explorer で確認済み:

~~~text
ENI ID:
eni-0c26b8c26d885b76f
~~~

以下を確認する。

- EC2 Attachment
- Subnet
- Security Groups
- IPv6 Address
- Public connectivity

特に:

~~~text
2406:da14:190f:d6a8:6c4a:da24:5520:8a7e
~~~

がこの ENI / EC2 に割り当てられているか確認する。

---

## 16. Security Group

Resource Explorer で確認済み:

~~~text
sg-08b17e8ef60021448
sg-0603e1bce6fe132af
~~~

Security Group Rule は10件確認されている。

Terraform import 前に以下を確認する。

- EC2 が実際に使用している Security Group
- Ingress
- Egress
- IPv4 Rule
- IPv6 Rule
- SSH
- HTTP
- HTTPS
- CloudFront Origin traffic

Security Group 本体と Rule を
どの Terraform Resource 構成で管理するかも事前に決定する。

---

## 17. Network ACL

確認済み:

~~~text
Network ACL ID:
acl-0eebbe8a340fe0b23
~~~

以下を確認する。

- Default NACL か
- GMS 用 Custom NACL か
- Subnet Association
- Custom Rule の有無

Default Resource であり、
GMS 固有の変更がない場合は Terraform で積極管理しない可能性がある。

---

## 18. DHCP Options

確認済み:

~~~text
DHCP Options ID:
dopt-0ecfbe765106b620f
~~~

Default DHCP Options である可能性がある。

GMS 固有設定であることが確認されない限り、
Terraform import 対象とはしない。

---

## 19. EBS

現在確認されている EBS Volume:

~~~text
vol-00547ee69f9364ec0
vol-0320ea45ddeed577c
~~~

現在の GMS v2 は少なくとも:

~~~text
Root EBS
+
MySQL Dedicated EBS
~~~

という構成。

AWS Attachment 情報から、
どちらが Root でどちらが MySQL Data Volume かを確定する。

確認項目:

- Attachment
- DeviceName
- Size
- VolumeType
- AvailabilityZone
- Encryption
- KMS Key
- DeleteOnTermination
- Mount Point

---

## 20. MySQL Data Persistence

MySQL Data は Dedicated EBS に保存されている。

Mount Point:

~~~text
/var/lib/mysql
~~~

Baseline Snapshot:

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
~~~

GMS v3.1 では Database Data を replaceable compute と同じ扱いにしない。

予定保護方針:

~~~text
Dedicated EBS
+
Terraform lifecycle prevent_destroy
+
EBS Snapshot
~~~

---

## 21. Root Filesystem Snapshot

確認済み:

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
~~~

EC2 Root Filesystem の Baseline として保存済み。

---

## 22. Unknown Snapshot

Resource Explorer で以下も確認されている。

~~~text
Snapshot ID:
snap-0fcfdb221e827affe
~~~

用途不明。

Terraform 管理対象かどうかは、
Source Volume や Description を確認してから判断する。

---

## 23. AMI

確認済み:

~~~text
AMI ID:
ami-084a581e02ce361c7
~~~

用途は未確定。

以下を確認する。

- Name
- Description
- CreationDate
- Source Snapshot
- Current EC2 ImageId との一致

GMS v2 Baseline AMI である場合は、
Disaster Recovery Strategy に含める可能性がある。

---

## 24. Key Pair

確認済み:

~~~text
Key Pair ID:
key-0fe6a7ba6713a593e
~~~

Current EC2 の KeyName と照合する。

Terraform で Key Pair を管理するかどうかは、
Private Key の管理方法も含めて慎重に判断する。

Private Key を Git に保存してはいけない。

---

## 25. IAM

IAM Role / Instance Profile の利用状況はまだ確認していない。

EC2 に Instance Profile が存在する場合、
GMS Runtime Dependency の一部となる可能性がある。

確認対象:

~~~text
IAM Role
IAM Instance Profile
Attached Policies
Inline Policies
~~~

AWS Managed Policy と Custom Policy を区別して扱う。

---

## 26. KMS

Resource Explorer で KMS Key を2件確認している。

現時点では GMS との関連性は不明。

以下を確認する。

- EBS Encryption
- Snapshot Encryption
- CloudWatch / Logs
- その他 GMS Resource からの参照

GMS Resource に使用されていない場合、
Terraform 管理対象にはしない。

---

## 27. Legacy RDS Resources

Resource Explorer では RDS 関連 Resource も確認されている。

例:

~~~text
RDS DB Subnet Groups
RDS Parameter Group
RDS Option Group
RDSOSMetrics Log Group
RDS-Pvt-rt
~~~

現在の GMS v2 は、
RDS ではなく EC2 + Dedicated MySQL EBS 構成。

したがってこれらは、

~~~text
Legacy GMS Resource
or
AWS Default Resource
~~~

である可能性が高い。

現在の GMS に必要であることが確認されない限り、
Terraform import しない。

---

## 28. AWS Default / Service Managed Resources

Resource Explorer では以下のような Resource も確認されている。

- MemoryDB default parameter groups
- MemoryDB default user
- MemoryDB default ACL
- ElastiCache default user
- Athena primary workgroup
- AwsDataCatalog
- EventBridge default event bus
- X-Ray Default sampling rule
- App Runner DefaultConfiguration
- Resource Explorer index
- Resource Explorer view

これらは GMS Runtime に使用している証拠がない。

原則として Terraform import 対象にはしない。

---

## 29. Terraform Management Boundary

現時点で Terraform 管理対象候補として確度が高いもの:

~~~text
VPC
Subnet
Internet Gateway
Route Table
Route Table Association
Security Group
EC2
Root EBS
MySQL EBS
CloudFront
ACM
AWS WAF
~~~

要調査:

~~~text
ENI
Network ACL
DHCP Options
AMI
Key Pair
KMS
IAM Role
IAM Instance Profile
Snapshot Management
~~~

原則管理対象外:

~~~text
DreamHost
AWS Managed CloudFront Policies
AWS Default Resources
Service Managed Resources
Legacy Resources not used by current GMS
~~~

---

## 30. GMS v3.1 Recovery Model

最終的には以下の Recovery Model を目標とする。

~~~text
Infrastructure lost
→ Terraform

Application lost
→ Git + GitHub Actions

Application configuration lost
→ Git

Monitoring configuration lost
→ Git

Database volume damaged/lost
→ EBS Snapshot

DNS configuration lost
→ DreamHost configuration record

EC2 lost
→ Terraform + Application deployment + Data attachment
~~~

Terraform は「すべてを保存する Backup Tool」ではなく、
Infrastructure の desired state を再構築するための仕組みとして利用する。

---

## 31. Terraform Step 2 Completion Condition

GMS v3.1 Step 2 の完成条件:

~~~text
Existing AWS Resources
        ↓
Resource Classification
        ↓
Dependency Analysis
        ↓
Terraform Import
        ↓
Generated HCL
        ↓
Human Review / Cleanup
        ↓
terraform plan
        ↓
No unintended create
No unintended update
No unintended destroy
~~~

特に DB EBS については:

~~~hcl
lifecycle {
  prevent_destroy = true
}
~~~

を利用する方向で設計する。

最終的に、

~~~text
Terraform Code
      ≒
Actual GMS Infrastructure
~~~

となり、

~~~text
terraform plan
~~~

で意図しない差分が存在しない状態を Step 2 の完成とする。

---

## 32. 次の作業

次は EC2:

~~~text
i-08e35c2a08562e6e7
~~~

を起点に実 Dependency を確認する。

最優先確認対象:

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

その後、

~~~text
ACM Details
WAF Rules
Global Dependencies
Cross-region Dependencies
~~~

を確認する。

この Dependency Analysis が完了するまでは、
Terraform import を開始しない。

---

# Verified GMS v2 Runtime Architecture - 2026-08-31

> 以下は AWS CLI、DreamHost DNS 設定、および EC2 実機確認によって裏付けられた現行 GMS v2 の構成である。

## Public Request Path

    Client
      |
      | HTTPS
      v
    DreamHost authoritative DNS
      |
      | sunlightjetrans.com
      v
    Amazon CloudFront
      |
      +-- ACM certificate (us-east-1)
      |
      +-- AWS WAF
      |
      | HTTP / IPv6 / port 80
      v
    origin.sunlightjetrans.com
      |
      | AAAA
      v
    2406:da14:190f:d6a8:6c4a:da24:5520:8a7e
      |
      v
    Internet Gateway
      |
      v
    Route Table
      |
      v
    Public Subnet
      |
      v
    Security Group
      |
      v
    ENI
      |
      v
    EC2
      |
      | HTTP :80
      v
    Nginx
      |
      | HTTP
      v
    Spring Boot / GMS :8080
      |
      v
    MySQL
      |
      v
    Dedicated EBS
    /var/lib/mysql

## HTTPS Termination

Public HTTPS terminates at CloudFront.

    Browser
      |
      | HTTPS
      v
    CloudFront + ACM
      |
      | HTTP
      v
    Nginx :80

Therefore, the Let's Encrypt / Certbot configuration currently present on the EC2 instance is not required for the currently verified public HTTPS path.

It is treated as legacy configuration until the reconstruction process is complete.

## Persistence Model

The current GMS architecture separates disposable compute from persistent network identity and persistent database data.

    Persistent ENI
    |   ENI = eni-0c26b8c26d885b76f
    |   DeviceIndex = 0
    |   DeleteOnTermination = false
    |   IPv6 = 2406:da14:190f:d6a8:6c4a:da24:5520:8a7e
    |
    +-- Primary network interface
        |
        v
    Spot EC2
    |
    +-- Root EBS
    |   DeleteOnTermination = true
    |   Mount = /
    |
    +-- MySQL EBS
        DeleteOnTermination = false
        Mount = /var/lib/mysql

The Spot request is persistent and uses `stop` as the interruption behavior.

The target lifecycle model is:

    EC2        = disposable compute
    ENI        = persistent network identity
    MySQL EBS  = persistent database data

The current ENI has been changed from `DeleteOnTermination = true` to `false`.

The currently running Spot request was created before this persistent-ENI reconstruction design and does not yet guarantee reuse of this ENI by a replacement Spot instance.

Terraform must therefore model the ENI separately and configure a replacement Spot EC2 instance to use this ENI as its primary network interface.

Until that Terraform configuration is complete and reconstruction-tested, the current EC2 instance must not be intentionally terminated for recovery testing.

## Reconstruction Responsibility

GMS v3.1 separates reconstruction responsibility into the following layers.

    Terraform
    |
    +-- AWS infrastructure
    |   +-- VPC
    |   +-- Subnet
    |   +-- Routing
    |   +-- Security Group
    |   +-- Persistent ENI / IPv6 network identity
    |   +-- EC2 / Spot
    |   +-- EBS
    |   +-- CloudFront
    |   +-- ACM
    |   +-- WAF
    |
    +-- Bootstrap / Git-managed configuration
    |   +-- Amazon Linux environment
    |   +-- Java
    |   +-- Nginx
    |   +-- MySQL server
    |   +-- systemd unit
    |   +-- filesystem / mount configuration
    |
    +-- Git / CI-CD
    |   +-- GMS source
    |   +-- build
    |   +-- application deployment
    |
    +-- Persistent data / recovery
        +-- existing MySQL EBS
        +-- MySQL EBS Snapshot

Terraform does not by itself reconstruct all software and configuration inside the EC2 instance.

The EC2 internal environment must therefore be captured and converted into reproducible bootstrap/configuration code.

## Database Recovery Policy

The GMS v3.1 database recovery order is:

    1. Existing MySQL EBS
           |
           v
       attach to reconstructed EC2
           |
           v
       mount at /var/lib/mysql

    2. If the EBS itself is lost:
           |
           v
       restore a new EBS from the baseline snapshot
           |
           v
       attach and mount

    3. SQL dump
       not used in the current GMS v3.1 recovery design

## Recovery Snapshots

The current v2 baseline recovery assets are:

    Root:
    snap-00ebdd9048a27089e
    GMS-v2-fixed-root

    MySQL:
    snap-01f0e460273843840
    GMS-v2-fixed-mysql-data

These are recovery assets rather than the primary mechanism for reconstructing the infrastructure.

The target GMS v3.1 design is to reconstruct the EC2 environment from code without depending on the root snapshot.

## External Dependency

DreamHost remains outside the initial Terraform management boundary.

It currently provides:

    Authoritative DNS
    |
    +-- sunlightjetrans.com
    |   -> CloudFront
    |
    +-- origin.sunlightjetrans.com
    |   -> Persistent GMS ENI IPv6
    |
    +-- ACM validation CNAME
        -> AWS ACM validation endpoint

A Terraform reconstruction must therefore account for this external DNS dependency.

Under the target persistent-ENI design, ordinary EC2 replacement should reuse the existing ENI and preserve the origin IPv6 address. In that recovery path, the DreamHost `origin.sunlightjetrans.com` AAAA record does not need to change.

If the ENI itself is lost or recreated, the external DNS dependency becomes active again and the DreamHost AAAA record may require an update.

## Current Reconstruction Status

    v2 source freeze                         COMPLETE
    Terraform local initialization           COMPLETE
    AWS resource discovery                   COMPLETE
    AWS Dependency Analysis                  COMPLETE
    EC2 Internal Inventory                   NEXT
    EC2 configuration capture                NEXT
    Bootstrap implementation                 PENDING
    Terraform import                         PENDING
    No-unintended-change terraform plan      PENDING
    Fresh reconstruction test                PENDING

The next phase is to inspect and preserve the current EC2 internal configuration before Terraform import begins.
