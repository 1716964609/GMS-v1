resource "aws_internet_gateway" "gms" {
  vpc_id = aws_vpc.gms.id

  tags = {
    Name = "プロジェクトnew tgms-igw"
  }
}
