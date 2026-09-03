resource "aws_acm_certificate" "gms" {
  provider = aws.us_east_1

  domain_name = "sunlightjetrans.com"

  subject_alternative_names = [
    "*.sunlightjetrans.com"
  ]

  validation_method = "DNS"
  key_algorithm     = "RSA_2048"

  options {
    certificate_transparency_logging_preference = "ENABLED"
  }

  lifecycle {
    prevent_destroy = true
  }
}
