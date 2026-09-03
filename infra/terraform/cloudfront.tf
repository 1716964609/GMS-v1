resource "aws_cloudfront_distribution" "gms" {
  enabled         = true
  is_ipv6_enabled = true

  aliases = [
    "sunlightjetrans.com"
  ]

  comment             = ""
  default_root_object = ""
  price_class         = "PriceClass_All"
  http_version        = "http2"

  web_acl_id = "arn:aws:wafv2:us-east-1:180294215932:global/webacl/CreatedByCloudFront-056855fc/70949ab2-45bd-432f-bd01-56e89676739a"

  origin {
    domain_name = "origin.sunlightjetrans.com"
    origin_id   = "origin.sunlightjetrans.com-mkatf4279hw"

    connection_attempts = 3
    connection_timeout  = 10

    custom_origin_config {
      http_port                = 80
      https_port               = 443
      origin_protocol_policy   = "http-only"
      origin_read_timeout      = 30
      origin_keepalive_timeout = 5
      ip_address_type          = "ipv6"

      origin_ssl_protocols = [
        "SSLv3",
        "TLSv1",
        "TLSv1.1",
        "TLSv1.2"
      ]
    }
  }

  default_cache_behavior {
    target_origin_id = "origin.sunlightjetrans.com-mkatf4279hw"

    viewer_protocol_policy = "redirect-to-https"

    allowed_methods = [
      "DELETE",
      "GET",
      "HEAD",
      "OPTIONS",
      "PATCH",
      "POST",
      "PUT"
    ]

    cached_methods = [
      "GET",
      "HEAD"
    ]

    compress         = true
    smooth_streaming = false

    cache_policy_id          = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
    origin_request_policy_id = "216adef6-5c7f-47e4-b989-5492eafa07d3"

    grpc_config {
      enabled = false
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = "arn:aws:acm:us-east-1:180294215932:certificate/7e970d09-0bf1-4ca4-ba04-dedb6f3dbffb"
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = {
    Name = "sunlightjetrans-cdn"
  }

  lifecycle {
    prevent_destroy = true
  }
}
