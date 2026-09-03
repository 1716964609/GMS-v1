resource "aws_ebs_volume" "gms_mysql" {
  availability_zone = aws_subnet.gms.availability_zone

  size       = 2
  type       = "gp3"
  iops       = 3000
  throughput = 125

  encrypted            = false
  multi_attach_enabled = false

  lifecycle {
    prevent_destroy = true
  }
}
