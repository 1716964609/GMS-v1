resource "aws_network_interface" "test" {
  subnet_id = "subnet-0661039664bcdb978"

  ipv6_address_count = 1

  security_groups = [
    "sg-0603e1bce6fe132af"
  ]

  source_dest_check = true

  tags = {
    Name = "GMS-v3.1-reconstruction-test-eni"
  }
}
