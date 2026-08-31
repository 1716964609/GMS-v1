# GMS v2 EC2 Runtime Inventory

Verified from the running GMS v2 EC2 instance on 2026-08-31.

## Operating System

- Amazon Linux 2023
- PRETTY_NAME: Amazon Linux 2023.5.20241001
- Architecture: x86_64

## Java

- Amazon Corretto 17
- Version: 17.0.12
- Package:
  java-17-amazon-corretto-headless-17.0.12+7-1.amzn2023.1.x86_64
- Package source:
  Amazon Linux 2023 repository

## Nginx

- Version: 1.24.0
- Package:
  nginx-1.24.0-1.amzn2023.0.4.x86_64
- Package source:
  Amazon Linux 2023 repository
- systemd service:
  nginx.service
- Enabled at boot: yes
- Runtime state when inspected: active
- Listening:
  - IPv4 TCP/80
  - IPv6 TCP/80

Relevant configuration files:

- /etc/nginx/nginx.conf
- /etc/nginx/conf.d/default.conf

Git copies under infra/legacy-v2 were compared with the running EC2 configuration.
The effective GMS reverse-proxy directives were confirmed to match.

Current reverse-proxy path:

CloudFront
-> HTTP / IPv6 / port 80
-> Nginx
-> http://[::1]:8080
-> Spring Boot / GMS

Public HTTPS terminates at CloudFront using ACM.

## MySQL

- MySQL Community Server 8.0.44
- Server package:
  mysql-community-server-8.0.44-1.el9.x86_64
- Repository package:
  mysql80-community-release-el9-1.noarch
- Package source:
  MySQL 8.0 Community repository
- systemd service:
  mysqld.service
- Enabled at boot: yes
- Runtime state when inspected: active

Relevant configuration file:

- /etc/my.cnf

Current GMS-specific memory settings:

- innodb_buffer_pool_size = 128M
- max_connections = 20
- performance_schema = OFF

Data directory:

- /var/lib/mysql

Listening ports observed:

- TCP/3306
- TCP/33060

Internet exposure is controlled separately by the AWS Security Group.

## MySQL Data Volume

AWS EBS:

- Volume ID:
  vol-00547ee69f9364ec0
- Size:
  2 GiB
- Type:
  gp3
- DeleteOnTermination:
  false

Linux mapping:

- AWS device:
  /dev/sdf
- Linux NVMe device:
  /dev/nvme1n1
- Filesystem:
  XFS
- Filesystem UUID:
  208d7a5a-df20-4ae5-822f-8fb8cd468643
- Mount point:
  /var/lib/mysql

The volume ID to NVMe mapping was verified using /dev/disk/by-id.

## Root Volume

AWS EBS:

- Volume ID:
  vol-0320ea45ddeed577c
- Size:
  8 GiB
- Type:
  gp3
- DeleteOnTermination:
  true

Linux mapping:

- Linux NVMe device:
  /dev/nvme0n1
- Root partition:
  /dev/nvme0n1p1
- Filesystem:
  XFS
- Mount point:
  /

## Swap

- Swap file:
  /swapfile
- Size:
  1 GiB
- Persisted through:
  /etc/fstab

The swap file was in active use when inspected and is considered part of the EC2 reconstruction requirements.

## GMS Application

Application artifact:

- /home/ec2-user/GMS-v2-reconstructed.jar
- Approximate size:
  50 MiB

systemd unit:

- /etc/systemd/system/tgms.service
- Enabled at boot: yes
- Runtime state when inspected: active

Runtime:

- User:
  root
- WorkingDirectory:
  /home/ec2-user
- Java executable:
  /usr/bin/java
- Initial heap:
  256 MiB
- Maximum heap:
  384 MiB
- Application port:
  8080
- Restart policy:
  always
- Restart delay:
  10 seconds
- Log file:
  /home/ec2-user/tgms.log

Startup dependency:

- network.target
- mysqld.service

## Application Configuration

Spring Boot configuration source:

- src/main/resources/application.properties

The Git version uses an environment-variable placeholder for the database password.

The currently deployed v2 JAR was built from the local deployment configuration and contains the runtime database credential inside the packaged application.properties.

The credential value is intentionally not recorded in this inventory.

Secret handling can be improved separately during the v3.1 reconstruction work.
It is not required to change the currently running v2 instance during this inventory phase.

## Certbot Legacy Configuration

Installed packages include:

- certbot 2.6.0
- python3-certbot 2.6.0
- python3-certbot-nginx 2.6.0

Root crontab:

- certbot renew runs daily at 03:00
- nginx is reloaded after successful renewal

The verified public HTTPS path currently terminates at CloudFront using ACM.

Therefore Certbot and the local Let's Encrypt configuration are classified as legacy v2 configuration and are not assumed to be required by the future reconstruction design.

## Enabled GMS-related Services

- nginx.service
- mysqld.service
- tgms.service

All three were enabled at boot when inspected.

## Initial Reconstruction Requirements

A fresh GMS EC2 reconstruction must account for at least:

1. Amazon Linux 2023
2. Amazon Corretto 17
3. Nginx
4. MySQL 8.0 Community Server
5. MySQL Community repository
6. Existing MySQL EBS attachment and mount
7. 1 GiB swap file
8. Nginx configuration
9. MySQL configuration
10. tgms.service
11. GMS application artifact/deployment
12. Runtime database credential injection
13. Service enablement and startup ordering

Certbot is preserved as legacy evidence but is not currently considered a mandatory reconstruction dependency.

