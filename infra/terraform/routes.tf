resource "aws_route" "gms_ipv4_default" {
  route_table_id         = aws_route_table.gms_public.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.gms.id
}

resource "aws_route" "gms_ipv6_default" {
  route_table_id              = aws_route_table.gms_public.id
  destination_ipv6_cidr_block = "::/0"
  gateway_id                  = aws_internet_gateway.gms.id
}
