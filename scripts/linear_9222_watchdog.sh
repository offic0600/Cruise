#!/bin/bash
set -euo pipefail

PORT="${LINEAR_DEBUG_PORT:-9222}"
BASE="http://127.0.0.1:${PORT}"
LINEAR_URL_PREFIX="${LINEAR_URL_PREFIX:-https://linear.app/cleantrack/team/CLE/active}"
CHROME_BIN="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
CHROME_USER_DATA_DIR="${CHROME_USER_DATA_DIR:-$HOME/.cache/hermes-full-chrome-clone}"
CHROME_PROFILE_DIR="${CHROME_PROFILE_DIR:-Default}"
CHROME_START_URL="${CHROME_START_URL:-https://linear.app/cleantrack}"
LOG_DIR="${LINEAR_9222_LOG_DIR:-$HOME/Desktop/Cruise/.hermes/linear-9222-watchdog}"
mkdir -p "$LOG_DIR"
TS="$(date '+%Y-%m-%d %H:%M:%S %Z')"
STATUS_FILE="$LOG_DIR/last-status.txt"
JSON_LIST_FILE="$LOG_DIR/last-json-list.json"
NO_ORIGIN_PROBE="$LOG_DIR/no-origin-websocket-probe.txt"

check_endpoint() {
  local path="$1"
  curl -sS -o /dev/null -w '%{http_code}' --max-time 5 "$BASE$path" || true
}

fetch_list() {
  curl -sS --max-time 5 "$BASE/json/list" || return 1
}

probe_websocket_no_origin() {
  python3 - "$BASE" "$NO_ORIGIN_PROBE" <<'PY'
import json, sys, urllib.request
from websocket import create_connection
base = sys.argv[1]
out_path = sys.argv[2]
opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
with opener.open(base + '/json/list', timeout=5) as r:
    pages = json.load(r)
ws_url = None
for page in pages:
    if page.get('type') == 'page' and 'linear.app/cleantrack' in page.get('url', ''):
        ws_url = page.get('webSocketDebuggerUrl')
        break
if not ws_url:
    with open(out_path, 'w') as f:
        f.write('probe=skip\nreason=no_linear_target\n')
    print('skip:no_linear_target')
    raise SystemExit(0)
ws = create_connection(ws_url, timeout=5, enable_multithread=False, suppress_origin=True)
ws.close()
with open(out_path, 'w') as f:
    f.write('probe=ok\nmode=suppress_origin\nws=' + ws_url + '\n')
print('ok')
PY
}

ensure_running() {
  if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
    return 0
  fi
  nohup "$CHROME_BIN" \
    --remote-debugging-address=127.0.0.1 \
    --remote-debugging-port="$PORT" \
    --remote-allow-origins=http://127.0.0.1:${PORT} \
    --user-data-dir="$CHROME_USER_DATA_DIR" \
    --profile-directory="$CHROME_PROFILE_DIR" \
    --no-first-run \
    --no-default-browser-check \
    "$CHROME_START_URL" \
    >"$LOG_DIR/chrome-launch.log" 2>&1 &

  echo "launch_flags=--remote-allow-origins=http://127.0.0.1:${PORT}" >> "$STATUS_FILE"
  sleep 4
}

version_code="$(check_endpoint '/json/version')"
list_code="$(check_endpoint '/json/list')"
protocol_code="$(check_endpoint '/json/protocol')"
linear_present="no"
raw_list=""
if [[ "$list_code" == "200" ]]; then
  if raw_list="$(fetch_list)"; then
    printf '%s\n' "$raw_list" > "$JSON_LIST_FILE"
    if printf '%s' "$raw_list" | grep -q "$LINEAR_URL_PREFIX"; then
      linear_present="yes"
    fi
  fi
fi

restarted="no"
if [[ "$version_code" != "200" || "$list_code" != "200" || "$protocol_code" != "200" || "$linear_present" != "yes" ]]; then
  ensure_running
  restarted="yes"
  version_code="$(check_endpoint '/json/version')"
  list_code="$(check_endpoint '/json/list')"
  protocol_code="$(check_endpoint '/json/protocol')"
  linear_present="no"
  raw_list=""
  if [[ "$list_code" == "200" ]]; then
    if raw_list="$(fetch_list)"; then
      printf '%s\n' "$raw_list" > "$JSON_LIST_FILE"
      if printf '%s' "$raw_list" | grep -q "$LINEAR_URL_PREFIX"; then
        linear_present="yes"
      fi
    fi
  fi
fi

probe_status="fail"
if probe_websocket_no_origin >/dev/null 2>&1; then
  probe_status="ok"
fi

printf 'time=%s\nversion=%s\nlist=%s\nprotocol=%s\nlinear_present=%s\nrestarted=%s\nwebsocket_probe=%s\n' \
  "$TS" "$version_code" "$list_code" "$protocol_code" "$linear_present" "$restarted" "$probe_status" > "$STATUS_FILE"
if [[ -f "$NO_ORIGIN_PROBE" ]]; then
  cat "$NO_ORIGIN_PROBE" >> "$STATUS_FILE"
fi
cat "$STATUS_FILE"
