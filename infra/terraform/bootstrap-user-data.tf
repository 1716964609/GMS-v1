locals {
  gms_bootstrap_user_data = templatefile("${path.module}/user-data.sh.tftpl", {
    setup_sh = base64gzip(
      file("${path.module}/../bootstrap/setup.sh")
    )

    nginx_conf = base64gzip(
      file("${path.module}/../bootstrap/nginx/nginx.conf")
    )

    nginx_default_conf = base64gzip(
      file("${path.module}/../bootstrap/nginx/default.conf")
    )

    mysql_conf = base64gzip(
      file("${path.module}/../bootstrap/mysql/my.cnf")
    )

    tgms_service = base64gzip(
      file("${path.module}/../bootstrap/systemd/tgms.service")
    )

    mysqld_mount_conf = base64gzip(
      file("${path.module}/../bootstrap/systemd/mysqld-mount.conf")
    )
  })
}
