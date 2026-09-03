resource "aws_volume_attachment" "gms_mysql" {
  device_name = "/dev/sdf"
  volume_id   = aws_ebs_volume.gms_mysql.id
  instance_id = aws_instance.gms.id
}
