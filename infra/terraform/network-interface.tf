resource "aws_network_interface" "gms" {
  subnet_id = aws_subnet.gms.id

  private_ips = [
    "10.0.7.116"
  ]

  ipv6_addresses = [
    "2406:da14:190f:d6a8:6c4a:da24:5520:8a7e"
  ]

  security_groups = [
    aws_security_group.gms.id
  ]

  source_dest_check = true
}
