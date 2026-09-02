resource "aws_subnet" "gms" {
  vpc_id            = aws_vpc.gms.id
  cidr_block        = "10.0.0.0/20"
  availability_zone = "ap-northeast-1a"

  ipv6_cidr_block = aws_vpc.gms.ipv6_cidr_block

  map_public_ip_on_launch         = false
  assign_ipv6_address_on_creation = false
  enable_dns64                    = false
  ipv6_native                     = false

  private_dns_hostname_type_on_launch            = "ip-name"
  enable_resource_name_dns_a_record_on_launch    = false
  enable_resource_name_dns_aaaa_record_on_launch = false

  tags = {
    Name = "プロジェクトnew tgms-subnet-public1-ap-northeast-1a"
  }
}
