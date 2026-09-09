resource "aws_iam_role" "gms_ec2" {
  name = "gms-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Effect = "Allow"

        Principal = {
          Service = "ec2.amazonaws.com"
        }

        Action = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "gms_ssm" {
  role       = aws_iam_role.gms_ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "gms" {
  name = "gms-ec2-instance-profile"
  role = aws_iam_role.gms_ec2.name
}

resource "aws_iam_role_policy" "gms_s3_artifacts_read" {
  name = "gms-s3-artifacts-read"
  role = aws_iam_role.gms_ec2.id

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Effect = "Allow"

        Action = [
          "s3:GetObject"
        ]

        Resource = [
          "${aws_s3_bucket.gms_artifacts.arn}/releases/*"
        ]
      },
      {
        Effect = "Allow"

        Action = [
          "s3:ListBucket"
        ]

        Resource = aws_s3_bucket.gms_artifacts.arn

        Condition = {
          StringLike = {
            "s3:prefix" = [
              "releases/*"
            ]
          }
        }
      }
    ]
  })
}
