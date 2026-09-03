#!/usr/bin/env bash

set -euo pipefail

readonly SCRIPT_DIR="$(
  cd -- "$(dirname -- "${BASH_SOURCE[0]}")" >/dev/null 2>&1
  pwd
)"

readonly GMS_USER="ec2-user"
readonly GMS_HOME="/home/ec2-user"
readonly GMS_JAR="${GMS_HOME}/GMS-v2-reconstructed.jar"

readonly MYSQL_MOUNT="/var/lib/mysql"
readonly MYSQL_FS_UUID="208d7a5a-df20-4ae5-822f-8fb8cd468643"
readonly MYSQL_EXPECTED_UID="27"
readonly MYSQL_EXPECTED_GID="27"
readonly MYSQL_DATABASE_DIR="${MYSQL_MOUNT}/tgms"
readonly MYSQL_SERVER_VERSION="8.0.44-1.el9"

readonly NGINX_CONF_SOURCE="${SCRIPT_DIR}/nginx/nginx.conf"
readonly NGINX_SITE_SOURCE="${SCRIPT_DIR}/nginx/default.conf"
readonly MYSQL_CONF_SOURCE="${SCRIPT_DIR}/mysql/my.cnf"
readonly TGMS_SERVICE_SOURCE="${SCRIPT_DIR}/systemd/tgms.service"
readonly MYSQL_SYSTEMD_DROPIN_SOURCE="${SCRIPT_DIR}/systemd/mysqld-mount.conf"

log() {
  printf '[GMS bootstrap] %s\n' "$*"
}

fail() {
  printf '[GMS bootstrap] ERROR: %s\n' "$*" >&2
  exit 1
}

require_root() {
  if [[ "${EUID}" -ne 0 ]]; then
    fail "This script must be run as root."
  fi
}

require_file() {
  local file="$1"

  if [[ ! -f "${file}" ]]; then
    fail "Required bootstrap file does not exist: ${file}"
  fi
}

verify_bootstrap_files() {
  log "Verifying bootstrap configuration files"

  require_file "${NGINX_CONF_SOURCE}"
  require_file "${NGINX_SITE_SOURCE}"
  require_file "${MYSQL_CONF_SOURCE}"
  require_file "${TGMS_SERVICE_SOURCE}"
  require_file "${MYSQL_SYSTEMD_DROPIN_SOURCE}"

  log "Bootstrap configuration files verified"
}

install_runtime_packages() {
  log "Installing base runtime packages"

  dnf install -y \
    java-17-amazon-corretto-headless \
    nginx

  if ! rpm -q mysql80-community-release >/dev/null 2>&1; then
    log "Installing MySQL Community repository"

    dnf install -y \
      https://repo.mysql.com/mysql80-community-release-el9-1.noarch.rpm
  else
    log "MySQL Community repository is already installed"
  fi

  # mysql-community-server is deliberately installed only after
  # the existing database EBS has been mounted and verified.

  log "Base runtime package installation completed"
}

configure_swap() {
  log "Configuring 1 GiB swap file"

  if [[ ! -f /swapfile ]]; then
    fallocate -l 1G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
  else
    log "/swapfile already exists"
  fi

  if ! swapon --show=NAME --noheadings | grep -Fxq /swapfile; then
    swapon /swapfile
  else
    log "/swapfile is already active"
  fi

  if ! grep -Eq \
    '^[[:space:]]*/swapfile[[:space:]]+swap[[:space:]]' \
    /etc/fstab; then

    printf '%s\n' \
      '/swapfile swap swap defaults 0 0' \
      >> /etc/fstab
  else
    log "/swapfile is already present in /etc/fstab"
  fi

  log "Swap configuration completed"
}

wait_for_mysql_volume() {
  local attempt
  local device_count

  log "Waiting for MySQL EBS filesystem UUID ${MYSQL_FS_UUID}"

  for attempt in {1..300}; do
    device_count="$(
      blkid -t "UUID=${MYSQL_FS_UUID}" -o device 2>/dev/null \
        | sed '/^[[:space:]]*$/d' \
        | wc -l \
        | tr -d ' '
    )"

    if [[ "${device_count}" -eq 1 ]]; then
      return 0
    fi

    if [[ "${device_count}" -gt 1 ]]; then
      fail "Multiple block devices have MySQL filesystem UUID ${MYSQL_FS_UUID}."
    fi

    sleep 2
  done

  fail "MySQL EBS filesystem UUID ${MYSQL_FS_UUID} was not detected within 600 seconds."
}

configure_mysql_mount() {
  local mysql_device
  local filesystem_type
  local mounted_source
  local mounted_uuid

  log "Configuring existing MySQL EBS mount"

  wait_for_mysql_volume

  mysql_device="$(
    blkid -t "UUID=${MYSQL_FS_UUID}" -o device \
      | head -n 1
  )"

  [[ -n "${mysql_device}" ]] \
    || fail "Unable to resolve MySQL block device."

  filesystem_type="$(
    blkid -s TYPE -o value "${mysql_device}"
  )"

  if [[ "${filesystem_type}" != "xfs" ]]; then
    fail "Expected XFS on ${mysql_device}, but detected ${filesystem_type:-unknown}."
  fi

  log "Detected MySQL filesystem on ${mysql_device}"

  mkdir -p "${MYSQL_MOUNT}"

  if mountpoint -q "${MYSQL_MOUNT}"; then
    mounted_source="$(
      findmnt -n -o SOURCE --mountpoint "${MYSQL_MOUNT}"
    )"

    mounted_uuid="$(
      blkid -s UUID -o value "${mounted_source}" 2>/dev/null || true
    )"

    if [[ "${mounted_uuid}" != "${MYSQL_FS_UUID}" ]]; then
      fail "${MYSQL_MOUNT} is already mounted from an unexpected filesystem."
    fi

    log "Expected MySQL EBS is already mounted at ${MYSQL_MOUNT}"
  else
    if findmnt -rn -S "${mysql_device}" >/dev/null 2>&1; then
      fail "${mysql_device} is already mounted at another location."
    fi

    if find "${MYSQL_MOUNT}" -mindepth 1 -maxdepth 1 -print -quit \
      | grep -q .; then
      fail "${MYSQL_MOUNT} is not empty. Refusing to hide existing files with an EBS mount."
    fi

    log "Mounting existing MySQL EBS at ${MYSQL_MOUNT}"

    mount -t xfs "${mysql_device}" "${MYSQL_MOUNT}"
  fi

  mountpoint -q "${MYSQL_MOUNT}" \
    || fail "${MYSQL_MOUNT} is not mounted after configuration."

  if [[ ! -f "${MYSQL_MOUNT}/auto.cnf" ]]; then
    fail "Expected MySQL auto.cnf was not found on the mounted EBS."
  fi

  if [[ ! -d "${MYSQL_DATABASE_DIR}" ]]; then
    fail "Expected GMS database directory ${MYSQL_DATABASE_DIR} was not found."
  fi

  if grep -Eq \
    '^[^#[:space:]][^[:space:]]*[[:space:]]+/var/lib/mysql[[:space:]]+' \
    /etc/fstab; then

    if ! grep -Eq \
      "^UUID=${MYSQL_FS_UUID}[[:space:]]+/var/lib/mysql[[:space:]]+xfs[[:space:]]+" \
      /etc/fstab; then
      fail "/etc/fstab already contains an unexpected entry for ${MYSQL_MOUNT}."
    fi

    log "Expected MySQL mount is already present in /etc/fstab"
  else
    printf '%s\n' \
      "UUID=${MYSQL_FS_UUID} /var/lib/mysql xfs defaults,nofail 0 2" \
      >> /etc/fstab

    log "Added MySQL EBS mount to /etc/fstab"
  fi

  log "MySQL EBS mount configuration completed"
}

install_mysql_server() {
  local installed_version

  log "Installing MySQL Community Server ${MYSQL_SERVER_VERSION}"

  if rpm -q mysql-community-server >/dev/null 2>&1; then
    installed_version="$(
      rpm -q \
        --qf '%{VERSION}-%{RELEASE}' \
        mysql-community-server
    )"

    if [[ "${installed_version}" != "${MYSQL_SERVER_VERSION}" ]]; then
      fail "MySQL Server ${installed_version} is already installed; expected ${MYSQL_SERVER_VERSION}."
    fi

    log "Expected MySQL Server version is already installed"
    return 0
  fi

  # Prevent mysqld from being started during package installation.
  systemctl mask mysqld.service >/dev/null 2>&1 || true

  if ! dnf install -y \
    "mysql-community-server-${MYSQL_SERVER_VERSION}"; then

    systemctl unmask mysqld.service >/dev/null 2>&1 || true
    fail "Failed to install MySQL Server ${MYSQL_SERVER_VERSION}."
  fi

  systemctl unmask mysqld.service >/dev/null 2>&1 || true
  systemctl daemon-reload

  installed_version="$(
    rpm -q \
      --qf '%{VERSION}-%{RELEASE}' \
      mysql-community-server
  )"

  if [[ "${installed_version}" != "${MYSQL_SERVER_VERSION}" ]]; then
    fail "Installed MySQL Server version is ${installed_version}; expected ${MYSQL_SERVER_VERSION}."
  fi

  systemctl stop mysqld.service 2>/dev/null || true

  log "MySQL Community Server ${MYSQL_SERVER_VERSION} installed and verified"
}

verify_mysql_identity() {
  local mysql_uid
  local mysql_gid
  local datadir_uid
  local datadir_gid

  log "Verifying MySQL user and EBS ownership"

  id mysql >/dev/null 2>&1 \
    || fail "mysql system user does not exist."

  mysql_uid="$(id -u mysql)"
  mysql_gid="$(id -g mysql)"

  if [[ "${mysql_uid}" != "${MYSQL_EXPECTED_UID}" ]]; then
    fail "mysql UID is ${mysql_uid}; expected ${MYSQL_EXPECTED_UID}."
  fi

  if [[ "${mysql_gid}" != "${MYSQL_EXPECTED_GID}" ]]; then
    fail "mysql GID is ${mysql_gid}; expected ${MYSQL_EXPECTED_GID}."
  fi

  datadir_uid="$(stat -c '%u' "${MYSQL_MOUNT}")"
  datadir_gid="$(stat -c '%g' "${MYSQL_MOUNT}")"

  if [[ "${datadir_uid}" != "${MYSQL_EXPECTED_UID}" ]]; then
    fail "${MYSQL_MOUNT} UID is ${datadir_uid}; expected ${MYSQL_EXPECTED_UID}."
  fi

  if [[ "${datadir_gid}" != "${MYSQL_EXPECTED_GID}" ]]; then
    fail "${MYSQL_MOUNT} GID is ${datadir_gid}; expected ${MYSQL_EXPECTED_GID}."
  fi

  log "MySQL UID/GID and EBS ownership verified"
}

install_configuration_files() {
  log "Installing GMS runtime configuration files"

  install -m 0644 \
    "${NGINX_CONF_SOURCE}" \
    /etc/nginx/nginx.conf

  install -D -m 0644 \
    "${NGINX_SITE_SOURCE}" \
    /etc/nginx/conf.d/default.conf

  install -m 0644 \
    "${MYSQL_CONF_SOURCE}" \
    /etc/my.cnf

  install -m 0644 \
    "${TGMS_SERVICE_SOURCE}" \
    /etc/systemd/system/tgms.service

  install -D -m 0644 \
    "${MYSQL_SYSTEMD_DROPIN_SOURCE}" \
    /etc/systemd/system/mysqld.service.d/10-gms-mysql-ebs.conf

  systemctl daemon-reload

  nginx -t

  if command -v mysqld >/dev/null 2>&1; then
    mysqld --validate-config
  else
    fail "mysqld executable was not found after installation."
  fi

  log "Runtime configuration files installed and validated"
}

start_infrastructure_services() {
  log "Enabling and starting infrastructure services"

  mountpoint -q "${MYSQL_MOUNT}" \
    || fail "${MYSQL_MOUNT} is not mounted. Refusing to start MySQL."

  systemctl enable mysqld.service
  systemctl start mysqld.service

  systemctl is-active --quiet mysqld.service \
    || fail "mysqld.service failed to start."

  systemctl enable nginx.service
  systemctl start nginx.service

  systemctl is-active --quiet nginx.service \
    || fail "nginx.service failed to start."

  log "MySQL and Nginx are active"

  # tgms.service is intentionally not started here.
  # The application JAR will eventually be deployed and started
  # by GitHub Actions CD.

  log "GMS application startup is reserved for GitHub Actions CD"
}

main() {
  require_root

  log "Starting GMS EC2 bootstrap"

  verify_bootstrap_files

  # Phase 1: Install base runtime packages
  install_runtime_packages

  # Phase 2: Configure swap
  configure_swap

  # Phase 3: Detect and mount existing MySQL EBS
  configure_mysql_mount

  # Phase 4: Install exact MySQL version
  install_mysql_server
  verify_mysql_identity

  # Phase 5: Install and validate runtime configuration
  install_configuration_files

  # Phase 6: Enable and start infrastructure services
  start_infrastructure_services

  log "Bootstrap completed"
}

main "$@"
