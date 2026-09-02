resource "aws_vpc" "gms" {
  cidr_block                           = "10.0.0.0/16"
  assign_generated_ipv6_cidr_block     = true
  ipv6_cidr_block_network_border_group = "ap-northeast-1"

  enable_dns_support                   = true
  enable_dns_hostnames                 = true
  enable_network_address_usage_metrics = false

  instance_tenancy = "default"

  tags = {
    Name = "プロジェクトnew tgms-vpc"
  }
}
