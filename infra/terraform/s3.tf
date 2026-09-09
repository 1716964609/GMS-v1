resource "aws_s3_bucket" "gms_artifacts" {
  bucket = "gms-artifacts-180294215932-ap-northeast-1"
}

resource "aws_s3_bucket_public_access_block" "gms_artifacts" {
  bucket = aws_s3_bucket.gms_artifacts.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "gms_artifacts" {
  bucket = aws_s3_bucket.gms_artifacts.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}
