import base64
import json
import os
import sys
import time
import urllib.request
from pathlib import Path

import websocket

TARGET_ID = sys.argv[1] if len(sys.argv) > 1 else '81A3713C33BCA35B2A0B8C7D177F43AD'
BASE = 'http://127.0.0.1:9222'
OUT_DIR = Path(sys.argv[2]) if len(sys.argv) > 2 else Path('~/Desktop/Cruise/tmp/linear-capture').expanduser()
OUT_DIR.mkdir(parents=True, exist_ok=True)

for k in list(os.environ):
    if k.lower().endswith('_proxy') or k == 'NO_PROXY':
        os.environ.pop(k, None)


def http_json(path: str):
    with urllib.request.urlopen(BASE + path, timeout=8) as r:
        return json.load(r)


def send(ws, method, params=None, msg_id=[0]):
    msg_id[0] += 1
    payload = {'id': msg_id[0], 'method': method}
    if params:
        payload['params'] = params
    ws.send(json.dumps(payload))
    return msg_id[0]


def wait_for(ws, pending_ids, event_methods=None, timeout=8):
    deadline = time.time() + timeout
    responses = {}
    events = []
    pending_ids = set(pending_ids)
    while time.time() < deadline and not pending_ids.issubset(responses.keys()):
        msg = json.loads(ws.recv())
        if 'id' in msg:
            responses[msg['id']] = msg
        elif not event_methods or msg.get('method') in event_methods:
            events.append(msg)
    return responses, events


def eval_value(ws, expression, timeout=8):
    mid = send(ws, 'Runtime.evaluate', {
        'expression': expression,
        'returnByValue': True,
        'awaitPromise': True,
    })
    responses, _ = wait_for(ws, {mid}, timeout=timeout)
    return responses[mid]['result']['result'].get('value')


def press_escape(ws):
    expr = """
(() => {
  document.dispatchEvent(new KeyboardEvent('keydown', {key:'Escape', code:'Escape', keyCode:27, which:27, bubbles:true}));
  document.dispatchEvent(new KeyboardEvent('keyup', {key:'Escape', code:'Escape', keyCode:27, which:27, bubbles:true}));
  return true;
})()
"""
    return eval_value(ws, expr)


def click_selector(ws, selector):
    expr = f"""
(() => {{
  const el = document.querySelector({json.dumps(selector)});
  if (!el) return {{ok:false, reason:'not-found'}};
  el.scrollIntoView({{block:'center', inline:'center'}});
  el.dispatchEvent(new MouseEvent('mousemove', {{bubbles:true, cancelable:true, view:window}}));
  el.dispatchEvent(new MouseEvent('mousedown', {{bubbles:true, cancelable:true, view:window}}));
  el.dispatchEvent(new MouseEvent('mouseup', {{bubbles:true, cancelable:true, view:window}}));
  el.click();
  return {{ok:true, text:(el.innerText||el.textContent||'').trim(), aria:el.getAttribute('aria-label'), tag:el.tagName}};
}})()
"""
    return eval_value(ws, expr)


def snapshot(ws, name):
    expr = """
(() => {
  const tabs = Array.from(document.querySelectorAll('[role="tab"], nav a, header a, header button, a, button'))
    .map(el => ({
      text: (el.innerText || el.textContent || '').trim(),
      aria: el.getAttribute('aria-label'),
      role: el.getAttribute('role'),
      href: el.href || null,
      pressed: el.getAttribute('aria-pressed'),
      selected: el.getAttribute('aria-selected'),
      expanded: el.getAttribute('aria-expanded'),
      hasPopup: el.getAttribute('aria-haspopup'),
      testid: el.getAttribute('data-testid')
    }))
    .filter(item => item.text || item.aria || item.href || item.role || item.testid)
    .slice(0, 120);
  const buttons = Array.from(document.querySelectorAll('button,[role="button"],[role="combobox"]'))
    .map(el => ({
      text: (el.innerText || el.textContent || '').trim(),
      aria: el.getAttribute('aria-label'),
      role: el.getAttribute('role'),
      expanded: el.getAttribute('aria-expanded'),
      hasPopup: el.getAttribute('aria-haspopup'),
      disabled: el.disabled || el.getAttribute('aria-disabled'),
      testid: el.getAttribute('data-testid')
    }))
    .filter(item => item.text || item.aria || item.testid)
    .slice(0, 120);
  const inputs = Array.from(document.querySelectorAll('input,textarea,[contenteditable="true"],[role="textbox"]'))
    .map(el => ({
      tag: el.tagName,
      type: el.type || null,
      placeholder: el.getAttribute('placeholder'),
      value: ('value' in el ? el.value : el.textContent || '').slice(0, 200),
      aria: el.getAttribute('aria-label'),
      role: el.getAttribute('role'),
      testid: el.getAttribute('data-testid')
    }))
    .filter(item => item.placeholder || item.value || item.aria || item.testid)
    .slice(0, 60);
  const visibleText = document.body ? document.body.innerText.slice(0, 6000) : '';
  return {
    href: location.href,
    title: document.title,
    ready: document.readyState,
    tabs,
    buttons,
    inputs,
    visibleText,
    headerText: (document.querySelector('header') || document.body)?.innerText?.slice(0, 1500) || null
  };
})()
"""
    shot_id = send(ws, 'Page.captureScreenshot', {'format': 'png', 'fromSurface': True})
    eval_id = send(ws, 'Runtime.evaluate', {'expression': expr, 'returnByValue': True, 'awaitPromise': True})
    responses, _ = wait_for(ws, {shot_id, eval_id}, timeout=15)
    png_b64 = responses[shot_id]['result']['data']
    (OUT_DIR / f'{name}.png').write_bytes(base64.b64decode(png_b64))
    data = responses[eval_id]['result']['result']['value']
    (OUT_DIR / f'{name}.json').write_text(json.dumps(data, ensure_ascii=False, indent=2))
    return data


def wait_until(ws, predicate_js, timeout=12, interval=0.25):
    deadline = time.time() + timeout
    last = None
    while time.time() < deadline:
        last = eval_value(ws, predicate_js, timeout=8)
        if last:
            return last
        time.sleep(interval)
    return last


def wait_for_page_ready(ws, expect_url_part=None, expect_text=None, expect_selector=None, timeout=15):
    checks = ["document.readyState === 'complete'"]
    if expect_url_part:
        checks.append(f"location.href.includes({json.dumps(expect_url_part)})")
    if expect_text:
        checks.append(f"document.body && document.body.innerText.includes({json.dumps(expect_text)})")
    if expect_selector:
        checks.append(f"!!document.querySelector({json.dumps(expect_selector)})")
    predicate = "(() => (%s) && ({href: location.href, title: document.title, text: (document.body && document.body.innerText.slice(0, 500)) || ''}))()" % " && ".join(checks)
    return wait_until(ws, predicate, timeout=timeout)


def navigate_to(ws, url, settle=2.0, expect_url_part=None, expect_text=None, expect_selector=None, timeout=15):
    expr = f"""
(() => {{
  location.href = {json.dumps(url)};
  return true;
}})()
"""
    eval_value(ws, expr)
    wait_for_page_ready(
        ws,
        expect_url_part=expect_url_part or url,
        expect_text=expect_text,
        expect_selector=expect_selector,
        timeout=timeout,
    )
    time.sleep(settle)
    return snapshot(ws, 'navigate-last-state')


def collect_toolbar_state(ws, label, page_url, selector, close_mode='escape'):
    baseline = navigate_to(
        ws,
        page_url,
        settle=0.8,
        expect_url_part='/team/CLE/',
        expect_text='All issues',
        expect_selector='button[aria-label*="Add filter" i]',
        timeout=18,
    )
    before = snapshot(ws, f'{label}-before')
    click = click_selector(ws, selector)
    time.sleep(1.0)
    after = snapshot(ws, f'{label}-after')
    if close_mode == 'escape':
        press_escape(ws)
        time.sleep(0.4)
    elif close_mode == 'back':
        eval_value(ws, 'history.back(); true')
        time.sleep(1.4)
    return {
        'label': label,
        'pageUrl': page_url,
        'selector': selector,
        'baseline': baseline,
        'before': before,
        'click': click,
        'after': after,
    }


def open_first_issue(ws):
    expr = """
(() => {
  const nodes = Array.from(document.querySelectorAll('a,button,[role="link"],[role="button"]'));
  const el = nodes.find(node => /CLE-\d+/.test((node.innerText||node.textContent||'').trim()));
  if (!el) return {ok:false, reason:'issue-link-not-found'};
  const text = (el.innerText||el.textContent||'').trim();
  el.scrollIntoView({block:'center'});
  el.dispatchEvent(new MouseEvent('mousemove', {bubbles:true, cancelable:true, view:window}));
  el.dispatchEvent(new MouseEvent('mousedown', {bubbles:true, cancelable:true, view:window}));
  el.dispatchEvent(new MouseEvent('mouseup', {bubbles:true, cancelable:true, view:window}));
  el.click();
  return {ok:true, text, href: el.href || null, tag: el.tagName};
})()
"""
    return eval_value(ws, expr)


def wait_for_issue_detail(ws, issue_key='CLE-28', timeout=18):
    return wait_for_page_ready(
        ws,
        expect_url_part=f'/issue/{issue_key}',
        expect_text=issue_key,
        expect_selector='main, [role="main"], article',
        timeout=timeout,
    )


def open_issue_direct(ws, issue_url, issue_key='CLE-28'):
    return navigate_to(
        ws,
        issue_url,
        settle=1.0,
        expect_url_part=f'/issue/{issue_key}',
        expect_text=issue_key,
        expect_selector='main, [role="main"], article',
        timeout=20,
    )


def main():
    targets = http_json('/json/list')
    match = next((t for t in targets if t.get('id') == TARGET_ID), None)
    if not match:
        raise SystemExit(f'target not found: {TARGET_ID}')
    ws = websocket.create_connection(match['webSocketDebuggerUrl'], timeout=10, suppress_origin=True, enable_multithread=False)
    try:
        init_ids = {
            send(ws, 'Page.enable'),
            send(ws, 'Runtime.enable'),
            send(ws, 'Network.enable', {'maxTotalBufferSize': 10000000, 'maxResourceBufferSize': 5000000}),
        }
        wait_for(ws, init_ids, timeout=8)

        active_url = 'https://linear.app/cleantrack/team/CLE/active'
        issue_url = match['url']

        interactions = []
        interactions.append(collect_toolbar_state(ws, 'toolbar-search-workspace', active_url, 'button[aria-label*="Search workspace" i]', close_mode='back'))
        interactions.append(collect_toolbar_state(ws, 'toolbar-filter-add', active_url, 'button[aria-label*="Add filter" i]'))
        interactions.append(collect_toolbar_state(ws, 'toolbar-display-options', active_url, 'button[aria-label*="Display options" i]'))
        interactions.append(collect_toolbar_state(ws, 'toolbar-new-issue', active_url, 'button[aria-label*="Create new issue" i]'))
        interactions.append(collect_toolbar_state(ws, 'tab-all-issues', active_url, 'a[href$="/team/CLE/all"]', close_mode='back'))
        interactions.append(collect_toolbar_state(ws, 'tab-backlog', active_url, 'a[href$="/team/CLE/backlog"]', close_mode='back'))

        baseline_after_tabs = navigate_to(
            ws,
            active_url,
            settle=0.8,
            expect_url_part='/team/CLE/',
            expect_text='All issues',
            expect_selector='button[aria-label*="Add filter" i]',
            timeout=18,
        )
        issue_open = open_first_issue(ws)
        issue_open_wait = wait_for_issue_detail(ws, issue_key='CLE-28', timeout=18)
        issue_detail = snapshot(ws, 'issue-detail-open')
        issue_direct = open_issue_direct(ws, issue_url, issue_key='CLE-28')

        result = {
            'target': match,
            'baselineAfterTabs': baseline_after_tabs,
            'interactions': interactions,
            'issueOpen': issue_open,
            'issueOpenWait': issue_open_wait,
            'issueDetail': issue_detail,
            'issueDirect': issue_direct,
        }
        (OUT_DIR / 'summary.json').write_text(json.dumps(result, ensure_ascii=False, indent=2))
        print(json.dumps({'out_dir': str(OUT_DIR), 'summary': result}, ensure_ascii=False, indent=2))
    finally:
        ws.close()


if __name__ == '__main__':
    main()
