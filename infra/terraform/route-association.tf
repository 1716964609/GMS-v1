resource "aws_route_table_association" "gms_public" {
  subnet_id      = aws_subnet.gms.id
  route_table_id = aws_route_table.gms_public.id
}
