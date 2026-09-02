resource "aws_security_group" "gms" {
  name        = "launch-wizard-2"
  description = "launch-wizard-2 created 2026-01-11T08:50:39.679Z"
  vpc_id      = aws_vpc.gms.id
}

resource "aws_vpc_security_group_ingress_rule" "ssh_ipv4" {
  security_group_id = aws_security_group.gms.id

  cidr_ipv4   = "0.0.0.0/0"
  ip_protocol = "tcp"
  from_port   = 22
  to_port     = 22
}

resource "aws_vpc_security_group_ingress_rule" "ssh_ipv6" {
  security_group_id = aws_security_group.gms.id

  cidr_ipv6   = "::/0"
  ip_protocol = "tcp"
  from_port   = 22
  to_port     = 22
}

resource "aws_vpc_security_group_ingress_rule" "http_ipv6" {
  security_group_id = aws_security_group.gms.id

  cidr_ipv6   = "::/0"
  ip_protocol = "tcp"
  from_port   = 80
  to_port     = 80
}

resource "aws_vpc_security_group_egress_rule" "all_ipv4" {
  security_group_id = aws_security_group.gms.id

  cidr_ipv4   = "0.0.0.0/0"
  ip_protocol = "-1"
}

resource "aws_vpc_security_group_egress_rule" "all_ipv6" {
  security_group_id = aws_security_group.gms.id

  cidr_ipv6   = "::/0"
  ip_protocol = "-1"
}
