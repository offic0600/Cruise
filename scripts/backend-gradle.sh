#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
GRADLE_VERSION="8.10.2"
GRADLE_HOME="${HOME}/.cruise-tools/gradle-${GRADLE_VERSION}"
GRADLE_ZIP="${HOME}/.cruise-tools/gradle-${GRADLE_VERSION}-bin.zip"

mkdir -p "${HOME}/.cruise-tools"

if [[ ! -x "${GRADLE_HOME}/bin/gradle" ]]; then
  curl -fsSL "https://services.gradle.org/distributions/gradle-${GRADLE_VERSION}-bin.zip" -o "${GRADLE_ZIP}"
  rm -rf "${GRADLE_HOME}"
  unzip -q "${GRADLE_ZIP}" -d "${HOME}/.cruise-tools"
fi

escaped_args=()
for arg in "$@"; do
  escaped_args+=("$(printf '%q' "${arg}")")
done

exec "${PROJECT_ROOT}/scripts/dev-env.sh" bash -lc "cd '${PROJECT_ROOT}/backend' && '${GRADLE_HOME}/bin/gradle' ${escaped_args[*]}"
