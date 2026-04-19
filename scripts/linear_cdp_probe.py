import json
import os
import sys
import urllib.request
import websocket

TARGET_ID = sys.argv[1] if len(sys.argv) > 1 else '81A3713C33BCA35B2A0B8C7D177F43AD'
for k in list(os.environ):
    if k.lower().endswith('_proxy') or k == 'NO_PROXY':
        os.environ.pop(k, None)
base = 'http://127.0.0.1:9222'
with urllib.request.urlopen(base + '/json/list', timeout=5) as r:
    targets = json.load(r)
match = next((t for t in targets if t.get('id') == TARGET_ID), None)
if not match:
    raise SystemExit(f'target not found: {TARGET_ID}')
ws = websocket.create_connection(match['webSocketDebuggerUrl'], timeout=8, suppress_origin=True, enable_multithread=False)
commands = [
    {"id": 1, "method": "Page.enable"},
    {"id": 2, "method": "Runtime.enable"},
    {"id": 3, "method": "Network.enable"},
    {"id": 4, "method": "Runtime.evaluate", "params": {"expression": "({href:location.href,title:document.title,ready:document.readyState,body:document.body&&document.body.innerText.slice(0,1200)})", "returnByValue": True}},
]
for c in commands:
    ws.send(json.dumps(c))
responses = {}
events = []
while len(responses) < len(commands):
    msg = json.loads(ws.recv())
    if 'id' in msg:
        responses[msg['id']] = msg
    else:
        events.append(msg)
print(json.dumps({
    "target": {"id": match['id'], "title": match.get('title'), "url": match.get('url')},
    "responses": responses,
    "events": events[:10]
}, ensure_ascii=False, indent=2))
ws.close()
