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
WS_ATTACH_JSON="$LOG_DIR/last-websocket-attach.json"
TARGET_WS_FILE="$LOG_DIR/last-target-websocket.txt"
NO_ORIGIN_PROBE="$LOG_DIR/no-origin-websocket-probe.txt"

check_endpoint() {
  local path="$1"
  curl -sS -o /dev/null -w '%{http_code}' --max-time 5 "$BASE$path" || true
}

fetch_list() {
  curl -sS --max-time 5 "$BASE/json/list" || return 1
}

inspect_linear_target() {
  python3 - "$LINEAR_URL_PREFIX" "$JSON_LIST_FILE" "$TARGET_WS_FILE" <<'PY'
import json, sys
prefix, json_path, ws_path = sys.argv[1:4]
with open(json_path, 'r', encoding='utf-8') as f:
    pages = json.load(f)
target = None
for page in pages:
    if page.get('type') == 'page' and page.get('url', '').startswith(prefix):
        target = page
        break
if target is None:
    with open(ws_path, 'w', encoding='utf-8') as f:
        f.write('')
    print('linear_target_present=no')
    print('linear_target_title=')
    print('linear_target_url=')
    print('linear_target_ws=')
else:
    ws = target.get('webSocketDebuggerUrl', '')
    with open(ws_path, 'w', encoding='utf-8') as f:
        f.write(ws)
    print('linear_target_present=yes')
    print('linear_target_title=' + target.get('title', '').replace('\n', ' ').replace('\r', ' '))
    print('linear_target_url=' + target.get('url', ''))
    print('linear_target_ws=' + ws)
PY
}

probe_websocket_no_origin() {
  env -u HTTP_PROXY -u HTTPS_PROXY -u ALL_PROXY -u http_proxy -u https_proxy -u all_proxy \
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
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write('probe=skip\nreason=no_linear_target\n')
    print('skip:no_linear_target')
    raise SystemExit(0)
ws = create_connection(ws_url, timeout=5, enable_multithread=False, suppress_origin=True)
ws.close()
with open(out_path, 'w', encoding='utf-8') as f:
    f.write('probe=ok\nmode=suppress_origin\nws=' + ws_url + '\n')
print('ok')
PY
}

probe_websocket_attach() {
  local ws_url="$1"
  env -u HTTP_PROXY -u HTTPS_PROXY -u ALL_PROXY -u http_proxy -u https_proxy -u all_proxy \
  python3 - "$ws_url" "$WS_ATTACH_JSON" <<'PY'
import json, sys
from websocket import create_connection
ws_url = sys.argv[1]
out_path = sys.argv[2]
result = {
    'websocket_attach': 'fail',
    'attach_error': '',
    'title': '',
    'url': '',
    'body_preview': '',
}
if not ws_url:
    result['attach_error'] = 'missing_target_websocket'
else:
    try:
        ws = create_connection(ws_url, timeout=8, suppress_origin=True)
        ws.send(json.dumps({
            'id': 1,
            'method': 'Runtime.evaluate',
            'params': {
                'expression': "JSON.stringify({title:document.title,url:location.href,body:(document.body&&document.body.innerText||'').slice(0,600)})",
                'returnByValue': True,
            }
        }))
        response = json.loads(ws.recv())
        ws.close()
        value = response.get('result', {}).get('result', {}).get('value', '')
        payload = json.loads(value) if value else {}
        result['websocket_attach'] = 'ok'
        result['title'] = payload.get('title', '')
        result['url'] = payload.get('url', '')
        result['body_preview'] = payload.get('body', '')
    except Exception as e:
        result['attach_error'] = f'{type(e).__name__}: {e}'
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)
print('websocket_attach=' + result['websocket_attach'])
print('attach_error=' + result['attach_error'].replace('\n', ' ').replace('\r', ' '))
print('attached_title=' + result['title'].replace('\n', ' ').replace('\r', ' '))
print('attached_url=' + result['url'])
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
  sleep 4
}

version_code="$(check_endpoint '/json/version')"
list_code="$(check_endpoint '/json/list')"
protocol_code="$(check_endpoint '/json/protocol')"
linear_target_present="no"
linear_target_title=""
linear_target_url=""
linear_target_ws=""
metadata_layer="fail"

refresh_target_state() {
  if [[ "$list_code" == "200" ]]; then
    if fetch_list > "$JSON_LIST_FILE"; then
      while IFS='=' read -r key value; do
        case "$key" in
          linear_target_present) linear_target_present="$value" ;;
          linear_target_title) linear_target_title="$value" ;;
          linear_target_url) linear_target_url="$value" ;;
          linear_target_ws) linear_target_ws="$value" ;;
        esac
      done < <(inspect_linear_target)
    fi
  fi

  if [[ "$version_code" == "200" && "$list_code" == "200" && "$protocol_code" == "200" ]]; then
    metadata_layer="ok"
  else
    metadata_layer="fail"
  fi
}

refresh_target_state

restarted="no"
if [[ "$metadata_layer" != "ok" || "$linear_target_present" != "yes" ]]; then
  ensure_running
  restarted="yes"
  version_code="$(check_endpoint '/json/version')"
  list_code="$(check_endpoint '/json/list')"
  protocol_code="$(check_endpoint '/json/protocol')"
  linear_target_present="no"
  linear_target_title=""
  linear_target_url=""
  linear_target_ws=""
  metadata_layer="fail"
  refresh_target_state
fi

no_origin_probe="fail"
if probe_websocket_no_origin >/dev/null 2>&1; then
  no_origin_probe="ok"
fi

websocket_attach="fail"
attach_error=""
attached_title=""
attached_url=""
if [[ "$metadata_layer" == "ok" && "$linear_target_present" == "yes" ]]; then
  while IFS='=' read -r key value; do
    case "$key" in
      websocket_attach) websocket_attach="$value" ;;
      attach_error) attach_error="$value" ;;
      attached_title) attached_title="$value" ;;
      attached_url) attached_url="$value" ;;
    esac
  done < <(probe_websocket_attach "$linear_target_ws")
fi

{
  printf 'time=%s\n' "$TS"
  printf 'version=%s\n' "$version_code"
  printf 'list=%s\n' "$list_code"
  printf 'protocol=%s\n' "$protocol_code"
  printf 'metadata_layer=%s\n' "$metadata_layer"
  printf 'linear_target_present=%s\n' "$linear_target_present"
  printf 'linear_target_title=%s\n' "$linear_target_title"
  printf 'linear_target_url=%s\n' "$linear_target_url"
  printf 'linear_target_ws=%s\n' "$linear_target_ws"
  printf 'restarted=%s\n' "$restarted"
  printf 'no_origin_probe=%s\n' "$no_origin_probe"
  printf 'websocket_attach=%s\n' "$websocket_attach"
  printf 'attach_error=%s\n' "$attach_error"
  printf 'attached_title=%s\n' "$attached_title"
  printf 'attached_url=%s\n' "$attached_url"
} > "$STATUS_FILE"

if [[ -f "$NO_ORIGIN_PROBE" ]]; then
  printf '\n[no_origin_probe]\n' >> "$STATUS_FILE"
  cat "$NO_ORIGIN_PROBE" >> "$STATUS_FILE"
fi

if [[ -f "$WS_ATTACH_JSON" ]]; then
  printf '\n[websocket_attach_json]\n' >> "$STATUS_FILE"
  cat "$WS_ATTACH_JSON" >> "$STATUS_FILE"
  printf '\n' >> "$STATUS_FILE"
fi

cat "$STATUS_FILE"
