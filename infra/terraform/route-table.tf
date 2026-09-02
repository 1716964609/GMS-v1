resource "aws_route_table" "gms_public" {
  vpc_id = aws_vpc.gms.id

  tags = {
    Name = "プロジェクトnew tgms-rtb-public"
  }
}
