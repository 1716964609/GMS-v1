# GMS v2 — 翻訳用語管理システム

## 1. システム概要

GMSは、日本語・英語を中心とした専門用語を検索・管理するために開発したWebアプリケーションである。

当初は翻訳業務における用語管理を目的として開発したが、現在のGMS v2では、継続的な商用サービスとしてではなく、既存WebアプリケーションおよびAWSインフラストラクチャを用いた個人技術検証用システムとして維持している。

本リポジトリのv2系統は、AWS上で稼働していたGMS v2を基準としてソースコードおよび実行環境を再構成したものである。

| 項目 | 内容 |
|---|---|
| システム名称 | GMS |
| システム種別 | Webアプリケーション |
| 主用途 | 翻訳用語の検索・管理、技術検証 |
| 対象言語 | 日本語・英語 |
| 実行環境 | AWS |
| アプリケーション | Java / Spring Boot |
| データベース | MySQL |

---

## 2. システム構成

### 2.1 全体構成

GMS v2は、AWS EC2上でNginx、Spring BootおよびMySQLを稼働させる単一EC2ベースの構成である。

```text
External Client
      |
      v
    Nginx
      |
      | Reverse Proxy
      v
Spring Boot Application
   [::1]:8080
      |
      v
    MySQL
      |
      v
Dedicated EBS Volume
/var/lib/mysql
```

Nginxは外部リクエストを受信し、IPv6 loopback経由でSpring Bootアプリケーションへ転送する。

Spring Bootアプリケーションは8080番ポートで待ち受け、MySQLをデータストアとして使用する。

---

## 3. 機能設計

### 3.1 用語検索・閲覧機能

一般利用者向けに、登録済みの用語情報を検索・閲覧する機能を提供する。

| 機能 | 概要 |
|---|---|
| 用語検索 | 登録済み用語を検索する |
| 用語閲覧 | 用語情報を参照する |
| 用語リスト閲覧 | 登録済みの用語リストを参照する |

v2では利用者側の機能を検索・閲覧中心に整理し、管理機能と分離している。

### 3.2 管理者機能

管理者向けコンソールから用語および用語リストを管理する。

| 機能 | 概要 |
|---|---|
| 用語登録 | 新規用語を登録する |
| 用語編集 | 登録済み用語を更新する |
| 用語削除 | 登録済み用語を削除する |
| リスト登録 | 新規用語リストを登録する |
| リスト編集 | 登録済み用語リストを更新する |
| リスト削除 | 登録済み用語リストを削除する |
| バージョン管理 | 用語およびリストの変更履歴を管理する |

---

## 4. データ設計

### 4.1 主要データ

GMSでは、主に以下のデータを管理する。

| データ | 概要 |
|---|---|
| Users | ユーザー情報 |
| Terms | 用語情報 |
| Lists | 用語リスト情報 |

用語および用語リストについては、変更履歴を保持するためのバージョン管理機能を備える。

### 4.2 外部用語データ

GMSでは分野別の専門用語データを利用する場合がある。

ただし、著作権およびライセンス上の理由から、実際の専門用語データセットは本リポジトリには含めない。

本リポジトリでは、アプリケーションソースコードおよびシステム構成のみを管理対象とする。

---

## 5. アプリケーション構成

### 5.1 Backend

| 項目 | 内容 |
|---|---|
| Language | Java 17 |
| Framework | Spring Boot |
| ORM | Hibernate |
| Connection Pool | HikariCP |
| Database Driver | MySQL Connector |
| Embedded Server | Tomcat |
| Build Tool | Maven |

Spring BootアプリケーションはFat JARとしてビルドし、EC2上で実行する。

### 5.2 Frontend

| 項目 | 内容 |
|---|---|
| HTML | HTML |
| Style | CSS |
| Client Logic | JavaScript |

フロントエンドはSpring Bootアプリケーション内の静的リソースとして管理する。

---

## 6. インフラストラクチャ設計

### 6.1 Compute

アプリケーション実行環境としてAWS EC2を使用する。

v2ではAmazon EC2 Spot Instanceを利用している。

EC2上では主に以下のコンポーネントを稼働させる。

```text
EC2
├── Nginx
├── Spring Boot
├── MySQL
└── systemd
```

### 6.2 Web Server / Reverse Proxy

NginxをSpring BootのReverse Proxyとして使用する。

現在のv2構成では、NginxからSpring Bootへ以下のように転送する。

```nginx
proxy_pass http://[::1]:8080;
```

また、外部リクエスト情報をSpring Bootへ引き渡すため、以下のForwarded Headerを使用する。

```text
Host
X-Real-IP
X-Forwarded-For
X-Forwarded-Proto
```

### 6.3 Application Process Management

Spring Bootアプリケーションはsystemd serviceとして管理する。

サービス名：

```text
tgms.service
```

systemdにより以下を管理する。

- アプリケーション起動
- OS起動時の自動起動
- プロセス異常終了時の再起動
- 標準出力・標準エラーのログ出力
- MySQLとの起動順序

---

## 7. ストレージ設計

### 7.1 Root Volume

EC2のOSおよびアプリケーション実行環境はRoot EBS Volumeに配置する。

Root VolumeはEC2インスタンスのライフサイクルに従う構成としている。

```text
EC2
└── Root EBS
    ├── Amazon Linux
    ├── Java
    ├── Nginx
    ├── systemd
    └── Application Runtime
```

v2固定時点のRoot VolumeについてはEBS Snapshotを取得している。

### 7.2 MySQL Data Volume

MySQLのデータディレクトリはRoot Volumeとは分離し、専用EBS Volumeを使用する。

Mount Point：

```text
/var/lib/mysql
```

構成：

```text
EC2
 |
 +-- Root EBS
 |
 +-- MySQL Data EBS
       |
       +-- /var/lib/mysql
```

MySQL Data VolumeはEC2削除時にも保持される構成とし、ComputeとPersistent Dataのライフサイクルを分離している。

v2固定時点ではMySQLを正常停止した状態でEBS Snapshotを取得している。

---

## 8. OS・Runtime構成

### 8.1 Operating System

AWS EC2上でAmazon Linux 2023を使用する。

### 8.2 Runtime Configuration

v2で使用している主要なOS設定ファイルについては、以下のディレクトリに保存している。

```text
infra/
└── legacy-v2/
    ├── fstab
    ├── nginx/
    │   ├── nginx.conf
    │   └── default.conf
    └── systemd/
        └── tgms.service
```

これらはv2稼働環境を再確認・再構築するためのLegacy Runtime Configurationとして保存する。

---

## 9. セキュリティ設計

### 9.1 Application Security

アプリケーションレベルではSpring Securityを使用する。

主な対策：

| 項目 | 内容 |
|---|---|
| Authentication / Authorization | Spring Security |
| CSRF Protection | CSRF Token |
| Session Security | Secure Cookie |
| Forwarded Header | Spring Boot Forward Header対応 |

### 9.2 Secret Management

データベースパスワードなどのSecret情報はGitリポジトリに保存しない。

Spring Bootでは環境変数からDatabase Passwordを取得する。

```properties
spring.datasource.password=${DB_PASSWORD}
```

以下の情報はGit管理対象外とする。

- Database Password
- AWS Credentials
- Private Key
- SSH Private Key
- TLS Private Key
- その他のSecret / Token

---

## 10. GMS v2再構成

### 10.1 背景

GMS v2のAWS稼働環境は存在していたが、開発時の完全なv2ソースコードが手元に残っていなかった。

そのため、以下の情報を使用してv2ソースコードを再構成した。

```text
GMS v1 Source Code
        +
Deployed GMS v2 Artifact
        +
GMS v2 Resources / Configuration
        ↓
GMS v2 Reconstructed Source
```

### 10.2 Javaコード比較

v1ソースコードと、AWS上で稼働していたv2 JAR内のJava classを比較した。

Java application classについて、コンパイル条件差によるbytecode差分を除いて確認した結果、v1からv2におけるJava Backend Logicには大きな変更がないことを確認した。

v2での主要な変更は、主に以下の領域に存在していた。

- Application Configuration
- Database Connection Configuration
- Frontend Resources
- User Interface
- Deployment Environment

### 10.3 Functional Verification

再構成したソースコードからFat JARを生成し、AWS上の既存v2環境へ配置した。

```text
Source
  |
  v
Maven Build
  |
  v
GMS-v2-reconstructed.jar
  |
  v
AWS EC2
```

実環境のNginx、MySQLおよび既存データを使用して起動し、Webブラウザから主要機能が正常に動作することを確認した。

したがって、本リポジトリのv2は元の開発ソースとの完全なbyte-to-byte一致を保証するものではなく、AWS上の実際のv2環境を基準として機能的に再構成・検証したBaselineである。

---

## 11. v2固定

GMS v2の固定作業では、アプリケーションソースだけでなく、実際の稼働環境についてもBaselineを保存した。

### 11.1 Git

以下をGitで管理する。

```text
Application Source
Frontend Resources
Application Configuration
Nginx Configuration
systemd Configuration
fstab
```

v2再構成用Branch：

```text
v2-reconstructed
```

### 11.2 AWS Snapshot

v2固定時点のAWS環境について以下のSnapshotを取得している。

```text
Root EBS
└── Baseline Snapshot

MySQL Data EBS
└── Baseline Snapshot
```

Snapshot取得時にはSpring BootおよびMySQLを停止し、MySQLの正常終了を確認した上でデータを固定した。

Snapshot作成後はMySQLおよびGMSを再起動し、アプリケーションの稼働を確認している。

---

## 12. Build

Maven Wrapperを使用してアプリケーションをビルドする。

```bash
./mvnw clean package
```

ローカル環境にMySQLが存在しない場合など、テスト用Database Environmentが準備されていない状態では以下のようにPackageのみ実行できる。

```bash
./mvnw clean package -DskipTests
```

生成されたSpring Boot Fat JARを実行環境へ配置する。

---

## 13. Repository Structure

主要ディレクトリ構成：

```text
.
├── src/
│   ├── main/
│   │   ├── java/
│   │   └── resources/
│   └── test/
│
├── infra/
│   └── legacy-v2/
│       ├── fstab
│       ├── nginx/
│       │   ├── nginx.conf
│       │   └── default.conf
│       └── systemd/
│           └── tgms.service
│
├── pom.xml
├── mvnw
└── README.md
```

---

## 14. v2設計上の位置付け

GMS v2は、AWS上で動作する既存アプリケーションを再構成し、現行構成を固定するためのBaselineとして位置付ける。

v2では以下の状態を確保している。

```text
Source Code
    +
Runtime Configuration
    +
Root Volume Snapshot
    +
Persistent Database Snapshot
    =
Reconstructable v2 Baseline
```

今後のシステム改善では、このv2 Baselineを基準としてInfrastructure as Code、Observability、CI/CDおよびDisaster Recoveryの改善を行う。

---

## 15. 今後の拡張

次期構成では、v2で固定した実環境を基準として以下を検討する。

- TerraformによるAWS Infrastructure as Code
- EC2 Computeの再作成可能化
- Persistent DataとCompute Lifecycleの明確な分離
- Spring Boot Actuator / MicrometerによるMetrics公開
- PrometheusによるMetrics Collection
- GrafanaによるVisualization
- GitHub ActionsによるCI/CD
- Infrastructure再構築およびDisaster Recovery Test

これらについてはv2の固定完了後、次期バージョンとして段階的に実装する。