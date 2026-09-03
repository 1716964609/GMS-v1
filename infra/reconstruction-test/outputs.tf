output "test_instance_id" {
  value = aws_instance.test.id
}

output "test_eni_id" {
  value = aws_network_interface.test.id
}

output "test_ipv6" {
  value = one(aws_network_interface.test.ipv6_addresses)
}

output "test_mysql_volume_id" {
  value = aws_ebs_volume.test_mysql.id
}
