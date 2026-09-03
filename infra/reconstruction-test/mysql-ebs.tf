resource "aws_ebs_volume" "test_mysql" {
  availability_zone = "ap-northeast-1a"

  snapshot_id = "snap-01f0e460273843840"

  type       = "gp3"
  size       = 2
  iops       = 3000
  throughput = 125

  encrypted            = false
  multi_attach_enabled = false

  tags = {
    Name = "GMS-v3.1-reconstruction-test-mysql"
  }
}
