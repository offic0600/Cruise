#!/usr/bin/env bash

set -euo pipefail

export JAVA_HOME="/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home"
export PATH="/opt/homebrew/opt/openjdk@21/bin:/opt/homebrew/opt/node@22/bin:$PATH"

if [[ $# -gt 0 ]]; then
  exec "$@"
fi

exec "${SHELL:-/bin/zsh}" -i
