resource "aws_volume_attachment" "test_mysql" {
  device_name = "/dev/sdf"
  volume_id   = aws_ebs_volume.test_mysql.id
  instance_id = aws_instance.test.id
}
