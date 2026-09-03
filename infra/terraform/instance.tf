resource "aws_instance" "gms" {
  ami           = data.aws_ssm_parameter.al2023_ami.insecure_value
  instance_type = "t3a.micro"
  key_name      = "spring"

  availability_zone = "ap-northeast-1a"

  ebs_optimized = true
  monitoring    = false

  primary_network_interface {
    network_interface_id = aws_network_interface.gms.id
  }

  instance_market_options {
    market_type = "spot"

    spot_options {
      spot_instance_type             = "persistent"
      instance_interruption_behavior = "stop"
      max_price                      = "0.012200"
    }
  }

  metadata_options {
    http_endpoint               = "enabled"
    http_protocol_ipv6          = "disabled"
    http_put_response_hop_limit = 2
    http_tokens                 = "required"
    instance_metadata_tags      = "disabled"
  }

  root_block_device {
    delete_on_termination = true
    volume_size           = 8
    volume_type           = "gp3"
    iops                  = 3000
    throughput            = 125
    encrypted             = false
  }

  lifecycle {
    prevent_destroy = true

    ignore_changes = [
      ami
    ]
  }
}
