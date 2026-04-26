import base64
import json
import time
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

import websocket


def iso_now() -> str:
    return datetime.now(timezone.utc).astimezone().isoformat()


def read_watchdog_status(path: Path) -> dict:
    status = {}
    if not path.exists():
        return status
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("[") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        status[key.strip()] = value.strip()
    return status


class CdpSession:
    def __init__(self, websocket_url: str, base: str = "http://127.0.0.1:9222"):
        self.websocket_url = websocket_url
        self.base = base.rstrip("/")
        self.ws = None
        self._message_id = 0
        self.network_events = []

    @classmethod
    def from_watchdog_status(cls, status: dict):
        websocket_url = status.get("linear_target_ws") or status.get("attached_ws")
        if not websocket_url:
            raise RuntimeError("watchdog status does not include an attached websocket target")
        return cls(websocket_url=websocket_url)

    def __enter__(self):
        self.connect()
        return self

    def __exit__(self, exc_type, exc, tb):
        self.close()

    def connect(self):
        self.ws = websocket.create_connection(
            self.websocket_url,
            timeout=10,
            suppress_origin=True,
            enable_multithread=False,
        )
        init_ids = {
            self.send("Page.enable"),
            self.send("Runtime.enable"),
            self.send(
                "Network.enable",
                {"maxTotalBufferSize": 10000000, "maxResourceBufferSize": 5000000},
            ),
        }
        self.wait_for(init_ids, timeout=8)

    def close(self):
        if self.ws is not None:
            self.ws.close()
            self.ws = None

    def send(self, method: str, params=None):
        self._message_id += 1
        payload = {"id": self._message_id, "method": method}
        if params:
            payload["params"] = params
        self.ws.send(json.dumps(payload))
        return self._message_id

    def wait_for(self, pending_ids, event_methods=None, timeout=8):
        deadline = time.time() + timeout
        pending_ids = set(pending_ids)
        responses = {}
        events = []
        while time.time() < deadline and not pending_ids.issubset(responses.keys()):
            msg = json.loads(self.ws.recv())
            if "id" in msg:
                responses[msg["id"]] = msg
                continue
            if msg.get("method", "").startswith("Network."):
                self.network_events.append({"captured_at": iso_now(), "event": msg})
            if not event_methods or msg.get("method") in event_methods:
                events.append(msg)
        return responses, events

    def eval_value(self, expression: str, timeout=8):
        msg_id = self.send(
            "Runtime.evaluate",
            {
                "expression": expression,
                "returnByValue": True,
                "awaitPromise": True,
            },
        )
        responses, _ = self.wait_for({msg_id}, timeout=timeout)
        return responses[msg_id]["result"]["result"].get("value")

    def wait_until(self, predicate_js: str, timeout=12, interval=0.25):
        deadline = time.time() + timeout
        last_value = None
        while time.time() < deadline:
            last_value = self.eval_value(predicate_js, timeout=8)
            if last_value:
                return last_value
            time.sleep(interval)
        return last_value

    def wait_for_page_ready(
        self,
        expect_url_part=None,
        expect_text=None,
        expect_selector=None,
        timeout=20,
    ):
        checks = ["document.readyState === 'complete'"]
        if expect_url_part:
            checks.append(f"location.href.includes({json.dumps(expect_url_part)})")
        if expect_text:
            checks.append(
                f"document.body && document.body.innerText.includes({json.dumps(expect_text)})"
            )
        if expect_selector:
            checks.append(f"!!document.querySelector({json.dumps(expect_selector)})")
        predicate = (
            "(() => (%s) && ({href: location.href, title: document.title, "
            "text: (document.body && document.body.innerText.slice(0, 400)) || ''}))()"
            % " && ".join(checks)
        )
        return self.wait_until(predicate, timeout=timeout)

    def navigate(
        self,
        url: str,
        settle=1.0,
        expect_url_part=None,
        expect_text=None,
        expect_selector=None,
        timeout=20,
    ):
        self.eval_value(
            f"(() => {{ location.href = {json.dumps(url)}; return true; }})()", timeout=8
        )
        self.wait_for_page_ready(
            expect_url_part=expect_url_part or url,
            expect_text=expect_text,
            expect_selector=expect_selector,
            timeout=timeout,
        )
        time.sleep(settle)

    def press_escape(self):
        return self.eval_value(
            """
(() => {
  document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', code: 'Escape', keyCode: 27, which: 27, bubbles: true}));
  document.dispatchEvent(new KeyboardEvent('keyup', {key: 'Escape', code: 'Escape', keyCode: 27, which: 27, bubbles: true}));
  return true;
})()
""",
            timeout=8,
        )

    def inspect_interaction_state(self, out_dir: Path, label="state"):
        state_dir = out_dir / "interaction-state"
        state_dir.mkdir(parents=True, exist_ok=True)
        data = self.eval_value(
            """
(() => {
  const normalizeText = (value) => (value || '').replace(/\\s+/g, ' ').trim();
  const isVisible = (el) => {
    if (!el) return false;
    const style = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
  };
  const labelOf = (el) => normalizeText(
    el.getAttribute('aria-label') ||
    el.getAttribute('placeholder') ||
    el.innerText ||
    el.textContent ||
    ''
  ).slice(0, 180);
  const describeControl = (el, index) => ({
    index,
    tag: (el.tagName || '').toLowerCase(),
    role: el.getAttribute('role'),
    type: el.getAttribute('type'),
    label: labelOf(el),
    name: el.getAttribute('name'),
    placeholder: el.getAttribute('placeholder'),
    disabled: !!(el.disabled || el.getAttribute('aria-disabled') === 'true'),
    readonly: !!(el.readOnly || el.getAttribute('aria-readonly') === 'true'),
    value_excerpt: ('value' in el ? el.value : el.textContent || '').slice(0, 120),
  });
  const describeButton = (el, index) => {
    const label = labelOf(el);
    return {
      index,
      tag: (el.tagName || '').toLowerCase(),
      role: el.getAttribute('role'),
      label,
      aria: el.getAttribute('aria-label'),
      disabled: !!(el.disabled || el.getAttribute('aria-disabled') === 'true'),
      destructive: /delete|remove|archive|discard|cancel subscription/i.test(label),
      submit_like: /create|save|submit|confirm|add|apply/i.test(label),
    };
  };
  const controls = Array.from(document.querySelectorAll('input:not([type="hidden"]), textarea, select, [contenteditable="true"], [role="textbox"], [role="combobox"]'))
    .filter(isVisible)
    .slice(0, 80)
    .map(describeControl);
  const buttons = Array.from(document.querySelectorAll('button, [role="button"], [role="menuitem"]'))
    .filter(isVisible)
    .slice(0, 120)
    .map(describeButton);
  const overlaySelectors = [
    '[role="dialog"]',
    '[aria-modal="true"]',
    '[role="menu"]',
    '[role="listbox"]',
    '[role="tooltip"]',
    '[data-radix-popper-content-wrapper]',
    '[data-headlessui-state]',
  ];
  const overlayNodes = Array.from(new Set(overlaySelectors.flatMap((selector) => Array.from(document.querySelectorAll(selector)))))
    .filter(isVisible)
    .slice(0, 20);
  const overlays = overlayNodes.map((el, index) => ({
    index,
    tag: (el.tagName || '').toLowerCase(),
    role: el.getAttribute('role'),
    aria_modal: el.getAttribute('aria-modal'),
    label: labelOf(el),
    text_excerpt: normalizeText(el.innerText || el.textContent || '').slice(0, 1200),
    control_count: Array.from(el.querySelectorAll('input, textarea, select, [contenteditable="true"], [role="textbox"], [role="combobox"]')).filter(isVisible).length,
    button_count: Array.from(el.querySelectorAll('button, [role="button"], [role="menuitem"]')).filter(isVisible).length,
  }));
  const active = document.activeElement;
  return {
    href: location.href,
    title: document.title,
    captured_at: new Date().toISOString(),
    overlay_count: overlays.length,
    form_control_count: controls.length,
    submit_candidate_count: buttons.filter((button) => button.submit_like && !button.disabled && !button.destructive).length,
    destructive_button_count: buttons.filter((button) => button.destructive).length,
    active_element: active ? {
      tag: (active.tagName || '').toLowerCase(),
      role: active.getAttribute('role'),
      label: labelOf(active),
    } : null,
    overlays,
    controls,
    buttons,
  };
})()
""",
            timeout=8,
        )
        (state_dir / f"{label}.json").write_text(
            json.dumps(data, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        return data

    def click_locator(self, locator: dict):
        return self.eval_value(
            f"""
(() => {{
  const locator = {json.dumps(locator)};
  const isVisible = (el) => {{
    if (!el) return false;
    const style = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
  }};
  const matches = Array.from(document.querySelectorAll(locator.query)).filter(isVisible);
  const el = matches[locator.index] || matches[0] || null;
  if (!el) return {{ok: false, reason: 'not-found', locator}};
  el.scrollIntoView({{block: 'center', inline: 'center'}});
  el.dispatchEvent(new MouseEvent('mousemove', {{bubbles: true, cancelable: true, view: window}}));
  el.dispatchEvent(new MouseEvent('mousedown', {{bubbles: true, cancelable: true, view: window}}));
  el.dispatchEvent(new MouseEvent('mouseup', {{bubbles: true, cancelable: true, view: window}}));
  el.click();
  return {{
    ok: true,
    text: ((el.innerText || el.textContent || '').trim()).slice(0, 200),
    aria: el.getAttribute('aria-label'),
    tag: el.tagName,
    href: el.getAttribute('href'),
  }};
}})()
""",
            timeout=8,
        )

    def fill_first_text_input(self, value: str):
        return self.eval_value(
            f"""
(() => {{
  const isVisible = (el) => {{
    if (!el) return false;
    const style = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
  }};
  const nodes = Array.from(document.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"], [role="textbox"]'))
    .filter(isVisible)
    .filter((el) => !el.disabled && el.getAttribute('aria-disabled') !== 'true' && !el.readOnly);
  const el = nodes[0];
  if (!el) return {{ok: false, reason: 'input-not-found'}};
  const text = {json.dumps(value)};
  el.focus();
  if ('value' in el) {{
    el.value = '';
    el.dispatchEvent(new Event('input', {{bubbles: true}}));
    el.value = text;
    el.dispatchEvent(new Event('input', {{bubbles: true}}));
    el.dispatchEvent(new Event('change', {{bubbles: true}}));
  }} else {{
    el.textContent = text;
    el.dispatchEvent(new InputEvent('input', {{bubbles: true, data: text}}));
  }}
  return {{
    ok: true,
    tag: el.tagName,
    placeholder: el.getAttribute('placeholder'),
    aria: el.getAttribute('aria-label'),
    value: ('value' in el ? el.value : el.textContent || '').slice(0, 200),
  }};
}})()
""",
            timeout=8,
        )

    def submit_dialog(self, preferred_labels=None):
        preferred_labels = preferred_labels or ["Create issue", "Create", "Save", "Submit"]
        return self.eval_value(
            f"""
(() => {{
  const preferred = {json.dumps(preferred_labels)};
  const isVisible = (el) => {{
    if (!el) return false;
    const style = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
  }};
  const labelOf = (el) => ((el.innerText || el.textContent || '').replace(/\\s+/g, ' ').trim());
  const buttons = Array.from(document.querySelectorAll('button, [role="button"]'))
    .filter(isVisible)
    .filter((el) => !el.disabled && el.getAttribute('aria-disabled') !== 'true');
  const match = buttons.find((el) => {{
    const text = labelOf(el);
    const aria = el.getAttribute('aria-label') || '';
    return preferred.some((candidate) => text === candidate || aria === candidate || text.includes(candidate));
  }});
  if (!match) {{
    return {{
      ok: false,
      reason: 'submit-not-found',
      candidates: buttons.slice(0, 20).map((el) => ({{
        text: labelOf(el),
        aria: el.getAttribute('aria-label'),
      }})),
    }};
  }}
  match.scrollIntoView({{block: 'center', inline: 'center'}});
  match.click();
  return {{
    ok: true,
    text: labelOf(match),
    aria: match.getAttribute('aria-label'),
  }};
}})()
""",
            timeout=8,
        )

    def find_issue_link_by_title(self, title: str):
        return self.eval_value(
            f"""
(() => {{
  const wanted = {json.dumps(title)};
  const links = Array.from(document.querySelectorAll('a[href*="/issue/"]'));
  const match = links.find((el) => (el.innerText || el.textContent || '').includes(wanted));
  if (!match) return null;
  return {{
    href: match.href,
    text: ((match.innerText || match.textContent || '').trim()).slice(0, 200),
  }};
}})()
""",
            timeout=8,
        )

    def _snapshot_expression(self):
        return """
(() => {
  const normalizeText = (value) => (value || '').replace(/\\s+/g, ' ').trim();
  const isVisible = (el) => {
    if (!el) return false;
    const style = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
  };
  const quote = (value) => JSON.stringify(String(value));
  const buildQuery = (el) => {
    const tag = (el.tagName || 'div').toLowerCase();
    const testid = el.getAttribute('data-testid');
    if (testid) return `${tag}[data-testid=${quote(testid)}]`;
    const aria = el.getAttribute('aria-label');
    if (aria) return `${tag}[aria-label=${quote(aria)}]`;
    const href = el.getAttribute('href');
    if (href) return `${tag}[href=${quote(href)}]`;
    const role = el.getAttribute('role');
    if (role) return `${tag}[role=${quote(role)}]`;
    return tag;
  };
  const sameSignature = (candidate, signature) => {
    if (signature.aria && candidate.getAttribute('aria-label') !== signature.aria) return false;
    if (signature.href && candidate.getAttribute('href') !== signature.href) return false;
    if (signature.testid && candidate.getAttribute('data-testid') !== signature.testid) return false;
    if (!signature.aria && !signature.href && !signature.testid && signature.text) {
      return normalizeText(candidate.innerText || candidate.textContent || '').slice(0, 120) === signature.text.slice(0, 120);
    }
    return true;
  };
  const interactive = Array.from(document.querySelectorAll('a,button,[role="button"],[role="tab"],[role="menuitem"],[role="combobox"],input,textarea,select,[contenteditable="true"],[role="textbox"]'))
    .filter(isVisible)
    .slice(0, 300)
    .map((el, idx) => {
      const tag = (el.tagName || '').toLowerCase();
      const role = el.getAttribute('role');
      const aria = el.getAttribute('aria-label');
      const text = normalizeText(el.innerText || el.textContent || '').slice(0, 160);
      const href = el.getAttribute('href');
      const testid = el.getAttribute('data-testid');
      const query = buildQuery(el);
      const signature = {aria, href, testid, text};
      const matches = Array.from(document.querySelectorAll(query))
        .filter(isVisible)
        .filter((candidate) => sameSignature(candidate, signature));
      const index = Math.max(matches.indexOf(el), 0);
      return {
        element_index: idx,
        tag,
        role,
        text,
        aria,
        href,
        testid,
        type: el.getAttribute('type'),
        expanded: el.getAttribute('aria-expanded'),
        has_popup: el.getAttribute('aria-haspopup'),
        disabled: !!(el.disabled || el.getAttribute('aria-disabled') === 'true'),
        locator: {query, index, signature, tag},
      };
    });
  return {
    href: location.href,
    title: document.title,
    ready: document.readyState,
    visibleText: document.body ? document.body.innerText.slice(0, 8000) : '',
    headerText: (document.querySelector('header') || document.body)?.innerText?.slice(0, 1800) || null,
    elements: interactive,
  };
})()
"""

    def capture_page(self, page_dir: Path, label="default"):
        screenshots_dir = page_dir / "screenshots"
        dom_dir = page_dir / "dom"
        screenshots_dir.mkdir(parents=True, exist_ok=True)
        dom_dir.mkdir(parents=True, exist_ok=True)

        shot_id = self.send("Page.captureScreenshot", {"format": "png", "fromSurface": True})
        eval_id = self.send(
            "Runtime.evaluate",
            {
                "expression": self._snapshot_expression(),
                "returnByValue": True,
                "awaitPromise": True,
            },
        )
        responses, _ = self.wait_for({shot_id, eval_id}, timeout=15)
        png_b64 = responses[shot_id]["result"]["data"]
        (screenshots_dir / f"{label}.png").write_bytes(base64.b64decode(png_b64))
        data = responses[eval_id]["result"]["result"]["value"]
        (dom_dir / f"{label}.json").write_text(
            json.dumps(data, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        return data

    def reset_network_events(self):
        self.network_events = []

    def build_har_entries(self):
        requests = {}
        entries = []
        for item in self.network_events:
            event = item["event"]
            method = event.get("method")
            params = event.get("params", {})
            request_id = params.get("requestId")
            if method == "Network.requestWillBeSent" and request_id:
                requests[request_id] = {
                    "startedDateTime": item["captured_at"],
                    "request": {
                        "method": params.get("request", {}).get("method"),
                        "url": params.get("request", {}).get("url"),
                        "headers": params.get("request", {}).get("headers", {}),
                    },
                }
            elif method == "Network.responseReceived" and request_id:
                base = requests.pop(
                    request_id,
                    {
                        "startedDateTime": item["captured_at"],
                        "request": {
                            "method": None,
                            "url": params.get("response", {}).get("url"),
                            "headers": {},
                        },
                    },
                )
                response = params.get("response", {})
                base["response"] = {
                    "status": response.get("status"),
                    "statusText": response.get("statusText"),
                    "mimeType": response.get("mimeType"),
                    "headers": response.get("headers", {}),
                    "url": response.get("url"),
                }
                base["time"] = 0
                entries.append(base)
        return entries

    def write_network_artifacts(self, page_dir: Path):
        har_dir = page_dir / "har"
        har_dir.mkdir(parents=True, exist_ok=True)

        raw_events_path = har_dir / "network-events.json"
        raw_events_path.write_text(
            json.dumps(self.network_events, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

        har_payload = {
            "log": {
                "version": "1.2",
                "creator": {"name": "linear_capture_runtime", "version": "1"},
                "pages": [
                    {
                        "id": page_dir.name,
                        "title": page_dir.name,
                        "startedDateTime": iso_now(),
                        "pageTimings": {},
                    }
                ],
                "entries": self.build_har_entries(),
            }
        }
        har_path = har_dir / "session.har.json"
        har_path.write_text(
            json.dumps(har_payload, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        return {
            "network_events": raw_events_path,
            "har": har_path,
        }
