import fcntl
import hashlib
import json
import re
import shutil
import sys
import time
from datetime import datetime, timedelta
from pathlib import Path
from urllib.parse import urljoin, urlparse, urlunparse

from .cdp import CdpSession, iso_now, read_watchdog_status


REPO_ROOT = Path("/Users/liuzheng/Desktop/Cruise")
TMP_ROOT = REPO_ROOT / "tmp" / "linear-capture"
WATCHDOG_STATUS_PATH = REPO_ROOT / ".hermes" / "linear-9222-watchdog" / "last-status.txt"
MUTATION_POLICY_PATH = REPO_ROOT / "config" / "mutation-policy.json"
RECAPTURE_REQUESTS_PATH = TMP_ROOT / "state" / "recapture-requests.json"
CAPTURE_LOCK_PATH = TMP_ROOT / "state" / "capture.lock"
MAX_RETRY_COUNT = 5
RETRY_BACKOFF_SECONDS = (60, 300, 900, 1800, 3600)
RETRYABLE_ERROR_MARKERS = (
    "capture_quality_not_ready",
    "navigation_mismatch",
    "WebSocketConnectionClosedException",
    "Connection to remote host was lost",
    "BrokenPipeError",
    "ConnectionResetError",
    "Connection closed",
)
NODE_TYPE_ORDER = {"page": 0, "interaction": 1, "flow": 2}
CAPTURE_QUALITY_RETRY_COUNT = 4
CAPTURE_QUALITY_RETRY_SECONDS = 2.5
DEEP_INTERACTION_ELEMENT_LIMIT = 100
SAFE_CREATE_FLOW_CONFIG = {
    "create_issue": {
        "entity_type": "issue",
        "submit_labels": ["Create issue", "Create", "Save"],
        "name_prefix": "issue",
    },
    "create_project": {
        "entity_type": "project",
        "submit_labels": ["Create project", "Create", "Save"],
        "name_prefix": "project",
    },
    "create_view": {
        "entity_type": "view",
        "submit_labels": ["Create view", "Create", "Save"],
        "name_prefix": "view",
    },
    "create_label": {
        "entity_type": "label",
        "submit_labels": ["Create label", "Create", "Add label", "Save"],
        "name_prefix": "label",
    },
}
SAFE_CREATE_FLOW_LABELS = {
    "create_issue": ("create new issue", "new issue", "create issue"),
    "create_project": ("create project", "new project"),
    "create_view": ("create view", "new view"),
    "create_label": ("create label", "new label", "add label"),
}
RECAPTURE_PRIORITY_BY_SCOPE = {
    "workspace:cleantrack/team:CLE/all": 0,
    "my-issues": 1,
    "cycles:list": 2,
}


def json_dump(path: Path, payload):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def json_load(path: Path, default=None):
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def try_acquire_capture_lock():
    CAPTURE_LOCK_PATH.parent.mkdir(parents=True, exist_ok=True)
    lock_handle = CAPTURE_LOCK_PATH.open("w", encoding="utf-8")
    try:
        fcntl.flock(lock_handle, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError:
        lock_handle.close()
        return None
    lock_handle.write(f"locked_at={iso_now()}\n")
    lock_handle.flush()
    return lock_handle


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def stable_hash(payload) -> str:
    return hashlib.sha256(
        json.dumps(payload, ensure_ascii=False, sort_keys=True).encode("utf-8")
    ).hexdigest()


def parse_iso(value: str):
    if not value:
        return None
    try:
        return datetime.fromisoformat(value)
    except ValueError:
        return None


def retry_delay_for(retry_count: int) -> int:
    index = max(0, min(retry_count - 1, len(RETRY_BACKOFF_SECONDS) - 1))
    return RETRY_BACKOFF_SECONDS[index]


def is_recoverable_error_message(message: str) -> bool:
    return any(marker in message for marker in RETRYABLE_ERROR_MARKERS)


def is_retry_due(node: dict, now: datetime) -> bool:
    retry_count = int(node.get("retry_count", 0))
    if retry_count >= int(node.get("max_retry_count", MAX_RETRY_COUNT)):
        return False
    next_retry_at = parse_iso(node.get("next_retry_at"))
    return next_retry_at is None or next_retry_at <= now


def slugify(value: str) -> str:
    text = re.sub(r"[^a-zA-Z0-9]+", "-", value.strip().lower()).strip("-")
    return text or "root"


def canonicalize_url(url: str) -> str:
    parsed = urlparse(url)
    clean = parsed._replace(query="", fragment="")
    return urlunparse(clean)


def resolve_linear_href(base_url: str, href: str) -> str:
    if not href:
        return ""
    if href.startswith("http://") or href.startswith("https://"):
        return canonicalize_url(href)
    return canonicalize_url(urljoin(base_url, href))


def derive_scope_key(url: str) -> str:
    parsed = urlparse(url)
    parts = [part for part in parsed.path.split("/") if part]
    if not parts:
        return "root"
    workspace = parts[0]
    if len(parts) >= 4 and parts[1] == "team":
        return f"workspace:{workspace}/team:{parts[2]}/{parts[3]}"
    if len(parts) >= 3 and parts[1] == "issue":
        return f"issue:{parts[2]}"
    if len(parts) >= 3 and parts[1] == "project":
        return f"project:{parts[2]}"
    if len(parts) >= 2 and parts[1] == "projects":
        return "projects:list"
    if len(parts) >= 2 and parts[1] == "views":
        return "views:list"
    if len(parts) >= 2 and parts[1] == "cycles":
        return "cycles:list"
    if len(parts) >= 2 and parts[1] == "roadmap":
        return "roadmap"
    if len(parts) >= 2 and parts[1] == "inbox":
        return "inbox"
    if len(parts) >= 2 and parts[1] in {"my-issues", "assigned"}:
        return "my-issues"
    if len(parts) >= 3 and parts[1] == "settings":
        setting_key = parts[2]
        if setting_key == "issue-labels":
            setting_key = "labels"
        return f"settings:{setting_key}"
    return f"route:{slugify('/'.join(parts))}"


def derive_url_for_scope(scope_key: str) -> str:
    if scope_key == "inbox":
        return "https://linear.app/cleantrack/inbox"
    if scope_key == "my-issues":
        return "https://linear.app/cleantrack/my-issues"
    if scope_key == "projects:list":
        return "https://linear.app/cleantrack/projects"
    if scope_key == "views:list":
        return "https://linear.app/cleantrack/views"
    if scope_key == "cycles:list":
        return "https://linear.app/cleantrack/cycles"
    if scope_key == "roadmap":
        return "https://linear.app/cleantrack/roadmap"
    if scope_key.startswith("settings:"):
        setting_key = scope_key.split(":", 1)[1]
        if setting_key == "labels":
            setting_key = "issue-labels"
        return f"https://linear.app/cleantrack/settings/{setting_key}"
    if scope_key.startswith("workspace:"):
        match = re.match(r"workspace:([^/]+)/team:([^/]+)/(.+)", scope_key)
        if match:
            workspace, team_key, section = match.groups()
            return f"https://linear.app/{workspace}/team/{team_key}/{section}"
    return ""


def page_dir_name(scope_key: str) -> str:
    return slugify(scope_key.replace(":", "-").replace("/", "-"))


def element_label(element: dict) -> str:
    return (element.get("text") or element.get("aria") or element.get("href") or "").strip()


def normalized_label(value: str) -> str:
    return " ".join((value or "").lower().split())


def flow_key_for_element(element: dict):
    label = normalized_label(element_label(element))
    if not label:
        return None
    if any(word in label for word in ("delete", "remove", "archive", "discard")):
        return None
    if any(word in label for word in ("invite", "connect github", "import issues")):
        return None
    for flow_key, candidates in SAFE_CREATE_FLOW_LABELS.items():
        if any(candidate in label for candidate in candidates):
            return flow_key
    return None


def classify_action_type(element: dict) -> str:
    label = normalized_label(element_label(element))
    if element.get("disabled"):
        return "disabled"
    if element.get("href"):
        return "navigate"
    if element.get("tag") in {"input", "textarea", "select"} or element.get("role") in {
        "combobox",
        "textbox",
    }:
        return "input"
    if any(word in label for word in ("delete", "remove", "archive")):
        return "submit_destructive"
    if any(word in label for word in ("create", "new", "save", "submit", "confirm")):
        return "submit_safe"
    if element.get("has_popup") or element.get("expanded") is not None:
        return "open_overlay"
    if element.get("role") in {"tab", "button", "menuitem"}:
        return "toggle"
    return "open_overlay"


def build_element_key(page_scope_key: str, element: dict) -> str:
    signature = {
        "page_scope_key": page_scope_key,
        "label": element_label(element),
        "role": element.get("role"),
        "tag": element.get("tag"),
        "href": element.get("href"),
        "locator": element.get("locator"),
    }
    return stable_hash(signature)[:12]


def normalize_element(page_scope_key: str, element: dict) -> dict:
    label = element_label(element)
    action_type = classify_action_type(element)
    return {
        "element_key": build_element_key(page_scope_key, element),
        "role": element.get("role") or element.get("tag"),
        "label": label,
        "selector_strategy": element.get("locator"),
        "action_type": action_type,
        "href": element.get("href"),
        "disabled": bool(element.get("disabled")),
        "expanded": element.get("expanded"),
        "has_popup": element.get("has_popup"),
        "source_scope_key": page_scope_key,
        "testid": element.get("testid"),
        "tag": element.get("tag"),
    }


def default_seed_surfaces(status: dict):
    issue_url = canonicalize_url(
        status.get("attached_url")
        or "https://linear.app/cleantrack/issue/CLE-28/views-%E9%A1%B5%E9%9D%A2%E8%A1%A5%E9%BD%90%E5%88%9B%E5%BB%BA%E7%BC%96%E8%BE%91%E5%88%A0%E9%99%A4%E4%B8%8E%E7%8A%B6%E6%80%81%E5%8F%8D%E9%A6%88"
    )
    return [
        {
            "scope_key": "workspace:cleantrack/team:CLE/active",
            "url": "https://linear.app/cleantrack/team/CLE/active",
            "ui_surface": "Active issues",
            "priority": 10,
            "provenance": "route-map.md + left-nav",
        },
        {
            "scope_key": "inbox",
            "url": "https://linear.app/cleantrack/inbox",
            "ui_surface": "Inbox",
            "priority": 11,
            "provenance": "page-inventory.md + left-nav",
        },
        {
            "scope_key": "my-issues",
            "url": "https://linear.app/cleantrack/my-issues",
            "ui_surface": "My issues",
            "priority": 12,
            "provenance": "page-inventory.md + left-nav",
        },
        {
            "scope_key": "projects:list",
            "url": "https://linear.app/cleantrack/projects",
            "ui_surface": "Projects",
            "priority": 13,
            "provenance": "page-inventory.md + left-nav",
        },
        {
            "scope_key": "views:list",
            "url": "https://linear.app/cleantrack/views",
            "ui_surface": "Views",
            "priority": 14,
            "provenance": "page-inventory.md + left-nav",
        },
        {
            "scope_key": "cycles:list",
            "url": "https://linear.app/cleantrack/cycles",
            "ui_surface": "Cycles",
            "priority": 15,
            "provenance": "page-inventory.md + left-nav",
        },
        {
            "scope_key": "roadmap",
            "url": "https://linear.app/cleantrack/roadmap",
            "ui_surface": "Roadmap",
            "priority": 16,
            "provenance": "page-inventory.md + left-nav",
        },
        {
            "scope_key": "workspace:cleantrack/team:CLE/all",
            "url": "https://linear.app/cleantrack/team/CLE/all",
            "ui_surface": "All issues",
            "priority": 17,
            "provenance": "route-map.md",
        },
        {
            "scope_key": "workspace:cleantrack/team:CLE/backlog",
            "url": "https://linear.app/cleantrack/team/CLE/backlog",
            "ui_surface": "Backlog",
            "priority": 18,
            "provenance": "route-map.md",
        },
        {
            "scope_key": derive_scope_key(issue_url),
            "url": issue_url,
            "ui_surface": "Issue detail",
            "priority": 19,
            "provenance": "page-inventory.md + watchdog attached issue",
        },
        {
            "scope_key": "project:cruise-01890584afbc",
            "url": "https://linear.app/cleantrack/project/cruise-01890584afbc/overview",
            "ui_surface": "Project detail",
            "priority": 20,
            "provenance": "known project detail fixture",
        },
        {
            "scope_key": "settings:members",
            "url": "https://linear.app/cleantrack/settings/members",
            "ui_surface": "Settings members",
            "priority": 21,
            "provenance": "settings needed subset",
        },
        {
            "scope_key": "settings:labels",
            "url": "https://linear.app/cleantrack/settings/labels",
            "ui_surface": "Settings labels",
            "priority": 22,
            "provenance": "settings needed subset",
        },
        {
            "scope_key": "settings:workflows",
            "url": "https://linear.app/cleantrack/settings/workflows",
            "ui_surface": "Settings workflows",
            "priority": 23,
            "provenance": "settings needed subset",
        },
    ]


def make_page_node(surface: dict) -> dict:
    url = canonicalize_url(surface["url"])
    scope_key = surface.get("scope_key") or derive_scope_key(url)
    return {
        "node_key": f"page:{scope_key}",
        "node_type": "page",
        "scope_key": scope_key,
        "source_url": url,
        "ui_surface": surface.get("ui_surface") or scope_key,
        "priority": int(surface.get("priority", 50)),
        "retry_count": 0,
        "status": "pending",
        "discovered_from": surface.get("provenance", "seed"),
        "created_at": iso_now(),
        "metadata": {
            "seed": True,
            "provenance": surface.get("provenance"),
        },
    }


def make_interaction_node(page_scope_key: str, page_url: str, element: dict, discovered_from: str):
    action_type = element.get("action_type")
    if action_type in {"submit_destructive", "submit_safe", "disabled"}:
        return None
    return {
        "node_key": f"interaction:{page_scope_key}:{element['element_key']}",
        "node_type": "interaction",
        "scope_key": f"{page_scope_key}#{element['element_key']}",
        "source_url": canonicalize_url(page_url),
        "ui_surface": f"{page_scope_key} / {element.get('label') or element['element_key']}",
        "priority": 20,
        "retry_count": 0,
        "status": "pending",
        "discovered_from": discovered_from,
        "created_at": iso_now(),
        "metadata": {
            "page_scope_key": page_scope_key,
            "element": element,
        },
    }


def make_flow_node(flow_key: str, page_scope_key: str, page_url: str, discovered_from: str, metadata=None):
    metadata = metadata or {}
    return {
        "node_key": f"flow:{page_scope_key}:{flow_key}",
        "node_type": "flow",
        "scope_key": flow_key,
        "source_url": canonicalize_url(page_url),
        "ui_surface": f"{page_scope_key} / {flow_key}",
        "priority": int(metadata.get("priority", 10 if flow_key in SAFE_CREATE_FLOW_CONFIG else 30)),
        "retry_count": 0,
        "status": "pending",
        "discovered_from": discovered_from,
        "created_at": iso_now(),
        "metadata": {
            "page_scope_key": page_scope_key,
            **metadata,
        },
    }


def initialize_registry(status: dict) -> dict:
    registry_path = TMP_ROOT / "registry" / "seed-surfaces.json"
    if registry_path.exists():
        return json_load(registry_path, default={}) or {}
    surfaces = default_seed_surfaces(status)
    payload = {
        "version": 1,
        "generated_at": iso_now(),
        "workspace_slug": "cleantrack",
        "seed_surfaces": surfaces,
        "notes": [
            "Seeds derived from page-inventory.md, route-map.md, and current Linear navigation hints.",
            "This registry is the durable seed frontier for breadth-first capture.",
        ],
    }
    json_dump(registry_path, payload)
    return payload


def initialize_frontier(registry: dict) -> dict:
    frontier_path = TMP_ROOT / "state" / "frontier.json"
    if frontier_path.exists():
        return json_load(frontier_path, default={}) or {}
    nodes = [make_page_node(surface) for surface in registry.get("seed_surfaces", [])]
    payload = {
        "version": 1,
        "generated_at": iso_now(),
        "selection_policy": "breadth-first-with-mutation-lanes",
        "nodes": nodes,
    }
    json_dump(frontier_path, payload)
    return payload


def initialize_coverage(registry: dict) -> dict:
    ledger_path = TMP_ROOT / "state" / "coverage-ledger.json"
    if ledger_path.exists():
        return json_load(ledger_path, default={}) or {}
    entries = {}
    for surface in registry.get("seed_surfaces", []):
        scope_key = surface.get("scope_key") or derive_scope_key(surface["url"])
        entries[f"page:{scope_key}"] = {
            "node_type": "page",
            "scope_key": scope_key,
            "status": "pending",
            "last_run_id": None,
            "artifact_hash": None,
            "status_reason": "seeded",
            "updated_at": iso_now(),
        }
    payload = {
        "version": 1,
        "generated_at": iso_now(),
        "entries": entries,
    }
    json_dump(ledger_path, payload)
    return payload


def save_frontier(frontier: dict):
    frontier["updated_at"] = iso_now()
    json_dump(TMP_ROOT / "state" / "frontier.json", frontier)


def save_coverage(ledger: dict):
    ledger["updated_at"] = iso_now()
    json_dump(TMP_ROOT / "state" / "coverage-ledger.json", ledger)


def load_recapture_requests() -> dict:
    return json_load(RECAPTURE_REQUESTS_PATH, default={"version": 1, "requests": []}) or {
        "version": 1,
        "requests": [],
    }


def save_recapture_requests(requests: dict):
    requests["updated_at"] = iso_now()
    json_dump(RECAPTURE_REQUESTS_PATH, requests)


def pending_recapture_requests(requests: dict) -> list[dict]:
    now = datetime.now().astimezone()
    pending = []
    for request in requests.setdefault("requests", []):
        if request.get("status") != "pending":
            continue
        next_after = parse_iso(request.get("next_recapture_after"))
        if next_after and next_after > now:
            continue
        pending.append(request)
    pending.sort(
        key=lambda item: (
            RECAPTURE_PRIORITY_BY_SCOPE.get(item.get("scope_key"), 50),
            item.get("requested_at", ""),
            item.get("scope_key", ""),
        )
    )
    return pending


def load_mutation_policy():
    policy = json_load(MUTATION_POLICY_PATH, default={}) or {}
    policy.setdefault("allowed_workspace_slug", "cleantrack")
    policy.setdefault("allowed_team_keys", ["CLE"])
    policy.setdefault("allowed_project_ids", [])
    policy.setdefault("entity_name_prefix", "HERMES_CAP_")
    policy.setdefault("allow_destructive_on_owned_entities_only", True)
    return policy


def select_next_node(frontier: dict):
    nodes = frontier.get("nodes", [])
    now = datetime.now().astimezone()
    eligible = []
    for node in nodes:
        status = node.get("status")
        if status in {"pending", "discovered", "needs_recapture"}:
            eligible.append(node)
        elif status == "retryable_blocked" and is_retry_due(node, now):
            eligible.append(node)
    if not eligible:
        return None

    def lane_rank(node: dict) -> int:
        if node.get("node_type") == "page" and node.get("status") == "needs_recapture":
            return 0
        return NODE_TYPE_ORDER.get(node.get("node_type"), 9) + 1

    def status_rank(node: dict) -> int:
        if node.get("status") == "retryable_blocked":
            return 1
        return 0

    eligible.sort(
        key=lambda node: (
            lane_rank(node),
            status_rank(node),
            int(node.get("priority", 999)),
            node.get("next_retry_at") or "",
            node.get("created_at", ""),
            node.get("node_key", ""),
        )
    )
    return eligible[0]


def find_node(frontier: dict, node_key: str):
    for node in frontier.get("nodes", []):
        if node.get("node_key") == node_key:
            return node
    return None


def find_page_node_by_scope(frontier: dict, scope_key: str):
    return find_node(frontier, f"page:{scope_key}")


def upsert_node(frontier: dict, node: dict):
    current = find_node(frontier, node["node_key"])
    if current:
        if current.get("status") in {"completed", "terminal_blocked"} and node.get("status") == "pending":
            return current
        current.update(
            {
                "priority": min(int(current.get("priority", 999)), int(node.get("priority", 999))),
                "source_url": node.get("source_url", current.get("source_url")),
                "ui_surface": node.get("ui_surface", current.get("ui_surface")),
                "metadata": {**current.get("metadata", {}), **node.get("metadata", {})},
                "discovered_from": current.get("discovered_from") or node.get("discovered_from"),
            }
        )
        return current
    frontier.setdefault("nodes", []).append(node)
    return node


def source_url_for_recapture_request(frontier: dict, request: dict) -> str:
    quality = request.get("evidence_quality") or {}
    url = (quality.get("url") or "").strip()
    if url:
        return canonicalize_url(url)
    scope_key = request.get("scope_key", "")
    existing = find_page_node_by_scope(frontier, scope_key)
    if existing and existing.get("source_url"):
        return existing["source_url"]
    return derive_url_for_scope(scope_key)


def apply_recapture_requests(frontier: dict, ledger: dict, requests: dict) -> int:
    applied = 0
    entries = ledger.setdefault("entries", {})
    for request in pending_recapture_requests(requests):
        scope_key = request.get("scope_key")
        if not scope_key:
            continue
        source_url = source_url_for_recapture_request(frontier, request)
        if not source_url:
            request["status"] = "blocked_missing_source_url"
            request["updated_at"] = iso_now()
            continue
        node_key = f"page:{scope_key}"
        node = find_node(frontier, node_key)
        metadata = {
            "recapture_request_key": request.get("request_key"),
            "recapture_source_artifact_hash": request.get("artifact_hash"),
            "recapture_reason": request.get("reason"),
            "recapture_requested_at": request.get("requested_at"),
        }
        if node is None:
            node = {
                "node_key": node_key,
                "node_type": "page",
                "scope_key": scope_key,
                "source_url": source_url,
                "ui_surface": f"Recapture {scope_key}",
                "priority": RECAPTURE_PRIORITY_BY_SCOPE.get(scope_key, 50),
                "retry_count": 0,
                "status": "needs_recapture",
                "discovered_from": "recapture-requests",
                "created_at": iso_now(),
                "metadata": metadata,
            }
            frontier.setdefault("nodes", []).append(node)
        else:
            node["status"] = "needs_recapture"
            node["source_url"] = source_url
            node["priority"] = min(
                int(node.get("priority", 999)),
                RECAPTURE_PRIORITY_BY_SCOPE.get(scope_key, 50),
            )
            node["retry_count"] = 0
            node["next_retry_at"] = None
            node.pop("blocker_type", None)
            node.pop("last_error", None)
            node.setdefault("metadata", {}).update(metadata)
        entry = entries.setdefault(node_key, {})
        entry.update(
            {
                "node_type": "page",
                "scope_key": scope_key,
                "status": "needs_recapture",
                "run_status": "needs_recapture",
                "status_reason": request.get("reason") or "recapture_requested",
                "updated_at": iso_now(),
            }
        )
        applied += 1
    return applied


def update_ledger(
    ledger: dict,
    ledger_key: str,
    node_type: str,
    scope_key: str,
    status: str,
    run_id=None,
    artifact_hash=None,
    reason=None,
):
    entries = ledger.setdefault("entries", {})
    previous = entries.get(ledger_key, {})
    if status == "discovered" and previous.get("status") in {
        "captured_readonly",
        "captured_mutation",
    }:
        status = previous["status"]
        run_id = run_id or previous.get("last_run_id")
        artifact_hash = artifact_hash or previous.get("artifact_hash")
        reason = previous.get("status_reason") or reason
    entries[ledger_key] = {
        **previous,
        "node_type": node_type,
        "scope_key": scope_key,
        "status": status,
        "run_status": status,
        "last_run_id": run_id,
        "artifact_hash": artifact_hash,
        "status_reason": reason or status,
        "implementation_enqueued_at": previous.get("implementation_enqueued_at"),
        "implementation_work_id": previous.get("implementation_work_id"),
        "updated_at": iso_now(),
    }


def reconcile_ledger_from_successful_runs(ledger: dict) -> int:
    entries = ledger.setdefault("entries", {})
    repaired = 0
    for manifest_path in sorted((TMP_ROOT / "runs").glob("*/manifest.json")):
        manifest = json_load(manifest_path, default={}) or {}
        if manifest.get("status") != "ok":
            continue
        scope_key = manifest.get("capture_scope")
        run_type = manifest.get("run_type", "page")
        artifact_hash = manifest.get("artifact_hash")
        run_id = manifest.get("run_id") or manifest_path.parent.name
        if not scope_key or not artifact_hash:
            continue
        ledger_key = f"{run_type}:{scope_key}"
        previous = entries.get(ledger_key, {})
        status = "captured_mutation" if run_type == "flow" else "captured_readonly"
        if (
            previous.get("status") == status
            and previous.get("last_run_id") == run_id
            and previous.get("artifact_hash") == artifact_hash
        ):
            continue
        entries[ledger_key] = {
            **previous,
            "node_type": run_type,
            "scope_key": scope_key,
            "status": status,
            "run_status": "ok",
            "last_run_id": run_id,
            "artifact_hash": artifact_hash,
            "status_reason": previous.get("status_reason") or "reconciled_from_manifest",
            "implementation_enqueued_at": previous.get("implementation_enqueued_at"),
            "implementation_work_id": previous.get("implementation_work_id"),
            "updated_at": iso_now(),
        }
        repaired += 1
    return repaired


def summarize_frontier(frontier: dict) -> dict:
    summary = {
        "pending": 0,
        "needs_recapture": 0,
        "completed": 0,
        "retryable_blocked": 0,
        "terminal_blocked": 0,
        "blocked_legacy": 0,
        "next_retry_at": None,
    }
    next_retry_values = []
    for node in frontier.get("nodes", []):
        status = node.get("status")
        if status in summary:
            summary[status] += 1
        elif status == "blocked":
            summary["blocked_legacy"] += 1
        if status == "retryable_blocked" and node.get("next_retry_at"):
            next_retry_values.append(node["next_retry_at"])
    if next_retry_values:
        summary["next_retry_at"] = sorted(next_retry_values)[0]
    return summary


def backup_state_file_once(path: Path):
    if not path.exists():
        return None
    backup_path = path.with_suffix(path.suffix + ".pre-requeue-backup")
    if not backup_path.exists():
        shutil.copy2(path, backup_path)
    return backup_path


def recover_legacy_retryable_nodes(frontier: dict, ledger: dict, status: dict) -> int:
    if status.get("websocket_attach") != "ok":
        return 0
    repaired = 0
    entries = ledger.get("entries", {})
    for node in frontier.get("nodes", []):
        if node.get("status") != "blocked":
            continue
        ledger_entry = entries.get(node.get("node_key"), {})
        reason = ledger_entry.get("status_reason") or node.get("last_error") or ""
        if not is_recoverable_error_message(reason):
            node["status"] = "terminal_blocked"
            node["blocker_type"] = "terminal"
            node["last_error"] = reason or "legacy_blocked_without_retryable_error"
            continue
        node["status"] = "retryable_blocked"
        node["blocker_type"] = "retryable"
        node["last_error"] = reason
        node.setdefault("max_retry_count", MAX_RETRY_COUNT)
        node["next_retry_at"] = iso_now()
        repaired += 1
        if ledger_entry:
            ledger_entry["status"] = "retryable_blocked"
            ledger_entry["run_status"] = "retryable_blocked"
            ledger_entry["status_reason"] = reason
            ledger_entry["updated_at"] = iso_now()
    return repaired


def mark_node_failure(node: dict, error_message: str):
    retry_count = int(node.get("retry_count", 0)) + 1
    node["retry_count"] = retry_count
    node["last_error"] = error_message
    node["completed_at"] = iso_now()
    node.setdefault("max_retry_count", MAX_RETRY_COUNT)
    if is_recoverable_error_message(error_message) and retry_count < int(node["max_retry_count"]):
        node["status"] = "retryable_blocked"
        node["blocker_type"] = "retryable"
        next_retry = datetime.now().astimezone() + timedelta(seconds=retry_delay_for(retry_count))
        node["next_retry_at"] = next_retry.isoformat()
    else:
        node["status"] = "terminal_blocked"
        node["blocker_type"] = "terminal"
        node["next_retry_at"] = None
    return node["status"]


def mark_recapture_request_attempt(
    requests: dict,
    node: dict,
    *,
    run_id: str,
    status: str,
    artifact_hash=None,
    error=None,
):
    request_key = (node.get("metadata") or {}).get("recapture_request_key")
    if not request_key:
        return False
    for request in requests.setdefault("requests", []):
        if request.get("request_key") != request_key:
            continue
        attempts = int(request.get("recapture_attempts", 0)) + 1
        request["recapture_attempts"] = attempts
        request["last_recapture_run_id"] = run_id
        request["last_recapture_at"] = iso_now()
        if status == "ok":
            request["status"] = "recaptured_pending_validation"
            request["recaptured_run_id"] = run_id
            request["recaptured_artifact_hash"] = artifact_hash
            request.pop("next_recapture_after", None)
            request.pop("last_recapture_error", None)
        else:
            request["status"] = "pending"
            request["last_recapture_error"] = error or status
            delay = retry_delay_for(attempts)
            request["next_recapture_after"] = (
                datetime.now().astimezone() + timedelta(seconds=delay)
            ).isoformat()
        request["updated_at"] = iso_now()
        return True
    return False


def classify_elements(snapshot: dict, page_scope_key: str):
    elements = []
    for raw in snapshot.get("elements", []):
        normalized = normalize_element(page_scope_key, raw)
        elements.append(normalized)
    return elements


def page_capture_quality(snapshot: dict, elements: list) -> dict:
    visible_text = snapshot.get("visibleText") or ""
    header_text = snapshot.get("headerText") or ""
    normalized = " ".join(f"{header_text} {visible_text}".lower().split())
    reasons = []
    if len(elements) <= 0:
        reasons.append("elements=0")
    if "loading" in normalized and len(elements) <= 1:
        reasons.append("loading-only")
    if "we could not find the page" in normalized:
        reasons.append("not-found")
    return {
        "status": "valid" if not reasons else "invalid",
        "reasons": reasons,
        "element_count": len(elements),
        "title": snapshot.get("title"),
        "url": snapshot.get("href"),
        "ready_state": snapshot.get("ready"),
    }


def capture_page_until_quality(session: CdpSession, page_dir: Path, node: dict):
    last_snapshot = None
    last_elements = []
    last_quality = {}
    for attempt in range(1, CAPTURE_QUALITY_RETRY_COUNT + 1):
        snapshot = session.capture_page(page_dir, label="default")
        elements = classify_elements(snapshot, node["scope_key"])
        quality = page_capture_quality(snapshot, elements)
        if quality["status"] == "valid":
            return snapshot, elements, quality
        last_snapshot = snapshot
        last_elements = elements
        last_quality = quality
        if attempt < CAPTURE_QUALITY_RETRY_COUNT:
            time.sleep(CAPTURE_QUALITY_RETRY_SECONDS)
    reasons = ",".join(last_quality.get("reasons") or ["unknown"])
    title = last_quality.get("title") or (last_snapshot or {}).get("title")
    url = last_quality.get("url") or (last_snapshot or {}).get("href")
    raise RuntimeError(
        "capture_quality_not_ready: "
        f"{reasons}; elements={len(last_elements)}; title={title}; url={url}"
    )


def page_navigation_matches_node(node: dict, snapshot: dict) -> bool:
    expected_path = urlparse(node["source_url"]).path
    actual_url = snapshot.get("href") or ""
    actual_path = urlparse(actual_url).path
    if expected_path and expected_path in actual_path:
        return True
    if actual_url and derive_scope_key(actual_url) == node.get("scope_key"):
        return True
    return False


def register_discoveries(frontier: dict, ledger: dict, page_snapshot: dict, page_scope_key: str, page_url: str):
    discovered = {"pages": [], "interactions": [], "flows": []}
    elements = classify_elements(page_snapshot, page_scope_key)
    for element in elements[:DEEP_INTERACTION_ELEMENT_LIMIT]:
        resolved_href = resolve_linear_href(page_url, element.get("href") or "")
        if resolved_href.startswith("https://linear.app/cleantrack/"):
            page_node = make_page_node(
                {
                    "scope_key": derive_scope_key(resolved_href),
                    "url": resolved_href,
                    "ui_surface": f"Discovered from {page_scope_key}",
                    "priority": 25,
                    "provenance": f"page:{page_scope_key}",
                }
            )
            upsert_node(frontier, page_node)
            update_ledger(
                ledger,
                page_node["node_key"],
                "page",
                page_node["scope_key"],
                "discovered",
                reason=f"Discovered from {page_scope_key}",
            )
            discovered["pages"].append(page_node["scope_key"])
        interaction_node = make_interaction_node(
            page_scope_key=page_scope_key,
            page_url=page_url,
            element=element,
            discovered_from=f"page:{page_scope_key}",
        )
        if interaction_node:
            upsert_node(frontier, interaction_node)
            update_ledger(
                ledger,
                interaction_node["node_key"],
                "interaction",
                interaction_node["scope_key"],
                "discovered",
                reason=f"Discovered from {page_scope_key}",
            )
            discovered["interactions"].append(interaction_node["scope_key"])
        flow_key = flow_key_for_element(element)
        if flow_key:
            flow_node = make_flow_node(
                flow_key=flow_key,
                page_scope_key=page_scope_key,
                page_url=page_url,
                discovered_from=f"page:{page_scope_key}",
                metadata={
                    "trigger_element": element,
                    "flow_kind": "safe_create",
                    "safety_policy": "sandbox_prefixed_mutation_only",
                },
            )
            upsert_node(frontier, flow_node)
            update_ledger(
                ledger,
                flow_node["node_key"],
                "flow",
                flow_node["scope_key"],
                "discovered",
                reason=f"Discovered from {page_scope_key}",
            )
            discovered["flows"].append(flow_node["scope_key"])
    return elements, discovered


def record_page_bundle(run_dir: Path, node: dict, snapshot: dict, elements: list):
    page_root = run_dir / "pages" / page_dir_name(node["scope_key"])
    page_root.mkdir(parents=True, exist_ok=True)
    page_payload = {
        "scope_key": node["scope_key"],
        "ui_surface": node.get("ui_surface"),
        "captured_at": iso_now(),
        "url": snapshot.get("href"),
        "title": snapshot.get("title"),
        "ready_state": snapshot.get("ready"),
        "header_text": snapshot.get("headerText"),
        "visible_text_excerpt": (snapshot.get("visibleText") or "")[:4000],
        "node": {
            "node_key": node.get("node_key"),
            "node_type": node.get("node_type"),
            "source_url": node.get("source_url"),
            "discovered_from": node.get("discovered_from"),
        },
    }
    json_dump(page_root / "page.json", page_payload)
    json_dump(page_root / "elements.json", {"elements": elements, "count": len(elements)})
    return page_root, page_payload


def record_flow_trace(run_dir: Path, flow_dir_name_value: str, trace_payload: dict):
    flow_root = run_dir / "flows" / slugify(flow_dir_name_value)
    flow_root.mkdir(parents=True, exist_ok=True)
    json_dump(flow_root / "trace.json", trace_payload)
    return flow_root


def record_mutation(run_dir: Path, name: str, payload: dict):
    path = run_dir / "mutations" / f"{slugify(name)}.json"
    json_dump(path, payload)
    return path


def summarize_interaction_state(state: dict) -> dict:
    return {
        "href": state.get("href"),
        "title": state.get("title"),
        "overlay_count": state.get("overlay_count", 0),
        "form_control_count": state.get("form_control_count", 0),
        "submit_candidate_count": state.get("submit_candidate_count", 0),
        "destructive_button_count": state.get("destructive_button_count", 0),
    }


def interaction_outcome(before: dict, after: dict, before_state: dict, after_state: dict) -> str:
    before_url = canonicalize_url(before.get("href") or before_state.get("href") or "")
    after_url = canonicalize_url(after.get("href") or after_state.get("href") or "")
    if before_url and after_url and before_url != after_url:
        return "navigation"
    if int(after_state.get("form_control_count", 0)) > int(before_state.get("form_control_count", 0)):
        return "form"
    if int(after_state.get("overlay_count", 0)) > int(before_state.get("overlay_count", 0)):
        return "overlay"
    if int(after_state.get("submit_candidate_count", 0)) > int(
        before_state.get("submit_candidate_count", 0)
    ):
        return "form"
    before_text = (before.get("visibleText") or "")[:2000]
    after_text = (after.get("visibleText") or "")[:2000]
    if before_text != after_text:
        return "state_change"
    return "no_visible_change"


def enqueue_form_probe_from_interaction(
    frontier: dict,
    ledger: dict,
    *,
    page_scope_key: str,
    page_url: str,
    element: dict,
    before_state: dict,
    after_state: dict,
    discovered_from: str,
):
    form_delta = int(after_state.get("form_control_count", 0)) - int(
        before_state.get("form_control_count", 0)
    )
    overlay_delta = int(after_state.get("overlay_count", 0)) - int(before_state.get("overlay_count", 0))
    if form_delta <= 0 and overlay_delta <= 0:
        return None
    if int(after_state.get("form_control_count", 0)) <= 0:
        return None
    if int(after_state.get("submit_candidate_count", 0)) <= 0:
        return None
    if int(after_state.get("destructive_button_count", 0)) > 0:
        return None
    flow_key = flow_key_for_element(element) or f"form_probe:{element['element_key']}"
    flow_kind = "safe_create" if flow_key in SAFE_CREATE_FLOW_CONFIG else "readonly_form_probe"
    flow_node = make_flow_node(
        flow_key=flow_key,
        page_scope_key=page_scope_key,
        page_url=page_url,
        discovered_from=discovered_from,
        metadata={
            "trigger_element": element,
            "flow_kind": flow_kind,
            "safety_policy": (
                "sandbox_prefixed_mutation_only"
                if flow_kind == "safe_create"
                else "readonly_open_state_only"
            ),
            "priority": 12 if flow_kind == "safe_create" else 28,
        },
    )
    upsert_node(frontier, flow_node)
    update_ledger(
        ledger,
        flow_node["node_key"],
        "flow",
        flow_node["scope_key"],
        "discovered",
        reason=f"Discovered form flow from {discovered_from}",
    )
    return flow_node


def compute_artifact_hash(run_dir: Path) -> str:
    files = sorted(path for path in run_dir.rglob("*") if path.is_file())
    manifest = [
        {"path": str(path.relative_to(run_dir)), "sha256": sha256_file(path)} for path in files
    ]
    return stable_hash(manifest)


def manifest_artifact_paths(run_dir: Path):
    paths = {"run_dir": str(run_dir.relative_to(TMP_ROOT))}
    for name in ("summary.json", "manifest.json"):
        path = run_dir / name
        if path.exists():
            paths[name.replace(".json", "")] = str(path.relative_to(TMP_ROOT))
    for folder in ("pages", "flows", "mutations"):
        path = run_dir / folder
        if path.exists():
            paths[f"{folder}_dir"] = str(path.relative_to(TMP_ROOT))
    return paths


def finalize_run(
    *,
    run_dir: Path,
    run_type: str,
    node: dict,
    source_title: str,
    source_url: str,
    websocket_attach: str,
    summary: dict,
    status: str,
):
    json_dump(run_dir / "summary.json", summary)
    artifact_hash = compute_artifact_hash(run_dir)
    artifact_paths = manifest_artifact_paths(run_dir)
    artifact_paths["manifest"] = str((run_dir / "manifest.json").relative_to(TMP_ROOT))
    manifest = {
        "run_id": run_dir.name,
        "captured_at": iso_now(),
        "source_target_title": source_title,
        "source_target_url": source_url,
        "websocket_attach": websocket_attach,
        "artifact_paths": artifact_paths,
        "artifact_hash": artifact_hash,
        "capture_scope": node.get("scope_key"),
        "ui_surface": node.get("ui_surface"),
        "status": status,
        "run_type": run_type,
        "scope_keys": [node.get("scope_key")],
    }
    json_dump(run_dir / "manifest.json", manifest)
    latest = {
        "latest_run_id": run_dir.name,
        "latest_artifact_hash": artifact_hash,
        "latest_capture_scope": node.get("scope_key"),
        "latest_status": status,
        "latest_manifest": str((run_dir / "manifest.json").relative_to(TMP_ROOT)),
        "latest_summary": str((run_dir / "summary.json").relative_to(TMP_ROOT)),
        "updated_at": manifest["captured_at"],
    }
    if status == "ok":
        json_dump(TMP_ROOT / "latest.json", latest)
    else:
        latest = json_load(TMP_ROOT / "latest.json", default=latest) or latest
    return manifest, latest


def execute_page_node(session: CdpSession, run_dir: Path, node: dict, frontier: dict, ledger: dict):
    session.reset_network_events()
    session.navigate(node["source_url"], expect_url_part=urlparse(node["source_url"]).path)
    page_root = run_dir / "pages" / page_dir_name(node["scope_key"])
    snapshot, _, quality = capture_page_until_quality(session, page_root, node)
    expected_path = urlparse(node["source_url"]).path
    if not page_navigation_matches_node(node, snapshot):
        raise RuntimeError(
            "navigation_mismatch: "
            f"expected_path={expected_path}; actual_url={snapshot.get('href')}; "
            f"scope_key={node.get('scope_key')}"
        )
    network_artifacts = session.write_network_artifacts(page_root)
    elements, discovered = register_discoveries(
        frontier=frontier,
        ledger=ledger,
        page_snapshot=snapshot,
        page_scope_key=node["scope_key"],
        page_url=snapshot.get("href") or node["source_url"],
    )
    _, page_payload = record_page_bundle(run_dir, node, snapshot, elements)
    summary = {
        "node": node,
        "status": "ok",
        "reason": "ok",
        "expected_path": expected_path,
        "actual_url": snapshot.get("href"),
        "evidence_quality": quality,
        "page": page_payload,
        "network": {key: str(path.relative_to(TMP_ROOT)) for key, path in network_artifacts.items()},
        "discovered": {
            "page_count": len(discovered["pages"]),
            "interaction_count": len(discovered["interactions"]),
            "flow_count": len(discovered["flows"]),
            "pages": discovered["pages"][:20],
            "interactions": discovered["interactions"][:20],
            "flows": discovered["flows"][:20],
        },
    }
    return {
        "run_type": "page",
        "summary": summary,
        "source_title": snapshot.get("title") or node.get("ui_surface"),
        "source_url": snapshot.get("href") or node["source_url"],
        "status": "ok",
    }


def execute_interaction_node(session: CdpSession, run_dir: Path, node: dict, frontier: dict, ledger: dict):
    page_scope_key = node["metadata"]["page_scope_key"]
    trigger_element = node["metadata"]["element"]
    flow_root = run_dir / "flows" / slugify(node["scope_key"])
    session.reset_network_events()
    session.navigate(node["source_url"], expect_url_part=urlparse(node["source_url"]).path)
    before = session.capture_page(flow_root, label="before")
    before_state = session.inspect_interaction_state(flow_root, label="before")
    click = session.click_locator(trigger_element["selector_strategy"])
    time.sleep(1.0)
    after = session.capture_page(flow_root, label="after")
    after_state = session.inspect_interaction_state(flow_root, label="after")
    network_artifacts = session.write_network_artifacts(flow_root)
    if not click.get("ok"):
        trace = {
            "node": node,
            "status": "captured_readonly",
            "reason": click.get("reason") or "interaction_open_failed",
            "page_scope_key": page_scope_key,
            "interaction_element": trigger_element,
            "click": click,
            "before_url": before.get("href"),
            "after_url": after.get("href"),
            "before_state": summarize_interaction_state(before_state),
            "after_state": summarize_interaction_state(after_state),
            "captured_at": iso_now(),
        }
        record_flow_trace(run_dir, node["scope_key"], trace)
        summary = {
            "node": node,
            "status": "captured_readonly",
            "reason": trace["reason"],
            "interaction_trace": trace,
            "network": {key: str(path.relative_to(TMP_ROOT)) for key, path in network_artifacts.items()},
        }
        return {
            "run_type": "interaction",
            "summary": summary,
            "source_title": after.get("title") or before.get("title") or node.get("ui_surface"),
            "source_url": after.get("href") or before.get("href") or node["source_url"],
            "status": "ok",
            "mutation_status": "captured_readonly",
            "reason": trace["reason"],
        }
    outcome = interaction_outcome(before, after, before_state, after_state)
    discovered_after = {"pages": [], "interactions": [], "flows": []}
    after_url = after.get("href") or node["source_url"]
    if outcome == "navigation":
        new_page_node = make_page_node(
            {
                "scope_key": derive_scope_key(after_url),
                "url": after_url,
                "ui_surface": f"Discovered via interaction {node['scope_key']}",
                "priority": 24,
                "provenance": node["node_key"],
            }
        )
        upsert_node(frontier, new_page_node)
        update_ledger(
            ledger,
            new_page_node["node_key"],
            "page",
            new_page_node["scope_key"],
            "discovered",
            reason=f"Navigated from {node['node_key']}",
        )
        discovered_after["pages"].append(new_page_node["scope_key"])
    else:
        _, discovered_after = register_discoveries(
            frontier=frontier,
            ledger=ledger,
            page_snapshot=after,
            page_scope_key=page_scope_key,
            page_url=after_url,
        )
        form_flow_node = enqueue_form_probe_from_interaction(
            frontier,
            ledger,
            page_scope_key=page_scope_key,
            page_url=node["source_url"],
            element=trigger_element,
            before_state=before_state,
            after_state=after_state,
            discovered_from=node["node_key"],
        )
        if form_flow_node:
            discovered_after["flows"].append(form_flow_node["scope_key"])
    trace = {
        "node": node,
        "status": "ok",
        "page_scope_key": page_scope_key,
        "interaction_element": trigger_element,
        "click": click,
        "outcome": outcome,
        "before_url": before.get("href"),
        "after_url": after.get("href"),
        "before_title": before.get("title"),
        "after_title": after.get("title"),
        "before_state": before_state,
        "after_state": after_state,
        "discovered_after": {
            "page_count": len(discovered_after["pages"]),
            "interaction_count": len(discovered_after["interactions"]),
            "flow_count": len(discovered_after["flows"]),
            "pages": discovered_after["pages"][:20],
            "interactions": discovered_after["interactions"][:20],
            "flows": discovered_after["flows"][:20],
        },
        "captured_at": iso_now(),
    }
    record_flow_trace(run_dir, node["scope_key"], trace)
    session.press_escape()
    summary = {
        "node": node,
        "status": "ok",
        "interaction_trace": trace,
        "interaction_state_summary": {
            "before": summarize_interaction_state(before_state),
            "after": summarize_interaction_state(after_state),
        },
        "network": {key: str(path.relative_to(TMP_ROOT)) for key, path in network_artifacts.items()},
    }
    return {
        "run_type": "interaction",
        "summary": summary,
        "source_title": after.get("title") or before.get("title") or node.get("ui_surface"),
        "source_url": after.get("href") or before.get("href") or node["source_url"],
        "status": "ok",
    }


def flow_allowed(node: dict, policy: dict) -> bool:
    parsed = urlparse(node["source_url"])
    parts = [part for part in parsed.path.split("/") if part]
    if not parts:
        return False
    workspace = parts[0]
    if workspace != policy.get("allowed_workspace_slug"):
        return False
    if len(parts) >= 3 and parts[1] == "team":
        return parts[2] in set(policy.get("allowed_team_keys", []))
    return True


def execute_readonly_form_probe(session: CdpSession, run_dir: Path, node: dict):
    flow_root = run_dir / "flows" / slugify(node["scope_key"])
    session.reset_network_events()
    session.navigate(node["source_url"], expect_url_part=urlparse(node["source_url"]).path)
    before = session.capture_page(flow_root, label="before")
    before_state = session.inspect_interaction_state(flow_root, label="before")
    trigger = node["metadata"].get("trigger_element")
    click = session.click_locator(trigger["selector_strategy"]) if trigger else {"ok": False, "reason": "missing-trigger"}
    time.sleep(1.0)
    after = session.capture_page(flow_root, label="after-open")
    after_state = session.inspect_interaction_state(flow_root, label="after-open")
    network_artifacts = session.write_network_artifacts(flow_root)
    session.press_escape()
    trace = {
        "node": node,
        "status": "captured_readonly",
        "reason": "readonly_form_probe",
        "trigger": click,
        "before_url": before.get("href"),
        "after_url": after.get("href"),
        "before_state": before_state,
        "after_state": after_state,
        "submit_policy": "not_submitted",
        "captured_at": iso_now(),
    }
    record_flow_trace(run_dir, node["scope_key"], trace)
    summary = {
        "node": node,
        "status": "captured_readonly",
        "reason": "readonly_form_probe",
        "form_state": {
            "before": summarize_interaction_state(before_state),
            "after": summarize_interaction_state(after_state),
        },
        "network": {key: str(path.relative_to(TMP_ROOT)) for key, path in network_artifacts.items()},
    }
    return {
        "run_type": "flow",
        "summary": summary,
        "source_title": after.get("title") or before.get("title") or node.get("ui_surface"),
        "source_url": after.get("href") or before.get("href") or node["source_url"],
        "status": "ok",
        "mutation_status": "captured_readonly",
        "reason": "readonly_form_probe",
    }


def execute_safe_create_flow(session: CdpSession, run_dir: Path, node: dict, policy: dict):
    flow_key = node["scope_key"]
    config = SAFE_CREATE_FLOW_CONFIG[flow_key]
    flow_root = run_dir / "flows" / slugify(flow_key)
    session.reset_network_events()
    session.navigate(node["source_url"], expect_url_part=urlparse(node["source_url"]).path)
    before = session.capture_page(flow_root, label="before")
    before_state = session.inspect_interaction_state(flow_root, label="before")
    trigger = node["metadata"].get("trigger_element")
    click = session.click_locator(trigger["selector_strategy"]) if trigger else {"ok": False, "reason": "missing-trigger"}
    time.sleep(1.0)
    dialog = session.capture_page(flow_root, label="dialog")
    dialog_state = session.inspect_interaction_state(flow_root, label="dialog")
    if not click.get("ok"):
        network_artifacts = session.write_network_artifacts(flow_root)
        trace = {
            "node": node,
            "status": "captured_readonly",
            "reason": click.get("reason") or "trigger_open_failed",
            "trigger": click,
            "before_state": before_state,
            "dialog_state": dialog_state,
            "captured_at": iso_now(),
        }
        record_flow_trace(run_dir, flow_key, trace)
        return {
            "run_type": "flow",
            "summary": {
                "node": node,
                "status": "captured_readonly",
                "reason": trace["reason"],
                "network": {key: str(path.relative_to(TMP_ROOT)) for key, path in network_artifacts.items()},
            },
            "source_title": dialog.get("title") or before.get("title") or node.get("ui_surface"),
            "source_url": dialog.get("href") or before.get("href") or node["source_url"],
            "status": "ok",
            "mutation_status": "captured_readonly",
            "reason": trace["reason"],
        }
    opened_outcome = interaction_outcome(before, dialog, before_state, dialog_state)
    form_delta = int(dialog_state.get("form_control_count", 0)) - int(
        before_state.get("form_control_count", 0)
    )
    overlay_delta = int(dialog_state.get("overlay_count", 0)) - int(
        before_state.get("overlay_count", 0)
    )
    if form_delta <= 0 and overlay_delta <= 0:
        network_artifacts = session.write_network_artifacts(flow_root)
        trace = {
            "node": node,
            "status": "captured_readonly",
            "reason": "safe_create_form_not_opened",
            "trigger": click,
            "opened_outcome": opened_outcome,
            "before_state": before_state,
            "dialog_state": dialog_state,
            "captured_at": iso_now(),
        }
        record_flow_trace(run_dir, flow_key, trace)
        session.press_escape()
        return {
            "run_type": "flow",
            "summary": {
                "node": node,
                "status": "captured_readonly",
                "reason": "safe_create_form_not_opened",
                "network": {key: str(path.relative_to(TMP_ROOT)) for key, path in network_artifacts.items()},
            },
            "source_title": dialog.get("title") or before.get("title") or node.get("ui_surface"),
            "source_url": dialog.get("href") or before.get("href") or node["source_url"],
            "status": "ok",
            "mutation_status": "captured_readonly",
            "reason": "safe_create_form_not_opened",
        }
    if not flow_allowed(node, policy):
        network_artifacts = session.write_network_artifacts(flow_root)
        trace = {
            "node": node,
            "status": "captured_readonly",
            "reason": "sandbox_not_allowed",
            "trigger": click,
            "before_state": before_state,
            "dialog_state": dialog_state,
            "captured_at": iso_now(),
        }
        record_flow_trace(run_dir, flow_key, trace)
        session.press_escape()
        return {
            "run_type": "flow",
            "summary": {
                "node": node,
                "status": "captured_readonly",
                "reason": "sandbox_not_allowed",
                "network": {key: str(path.relative_to(TMP_ROOT)) for key, path in network_artifacts.items()},
            },
            "source_title": dialog.get("title") or before.get("title") or node.get("ui_surface"),
            "source_url": dialog.get("href") or before.get("href") or node["source_url"],
            "status": "ok",
            "mutation_status": "captured_readonly",
            "reason": "sandbox_not_allowed",
        }
    if int(dialog_state.get("destructive_button_count", 0)) > 0:
        network_artifacts = session.write_network_artifacts(flow_root)
        trace = {
            "node": node,
            "status": "captured_readonly",
            "reason": "destructive_control_present",
            "trigger": click,
            "before_state": before_state,
            "dialog_state": dialog_state,
            "captured_at": iso_now(),
        }
        record_flow_trace(run_dir, flow_key, trace)
        session.press_escape()
        return {
            "run_type": "flow",
            "summary": {
                "node": node,
                "status": "captured_readonly",
                "reason": "destructive_control_present",
                "network": {key: str(path.relative_to(TMP_ROOT)) for key, path in network_artifacts.items()},
            },
            "source_title": dialog.get("title") or before.get("title") or node.get("ui_surface"),
            "source_url": dialog.get("href") or before.get("href") or node["source_url"],
            "status": "ok",
            "mutation_status": "captured_readonly",
            "reason": "destructive_control_present",
        }

    entity_name = f"{policy['entity_name_prefix']}{config['name_prefix']}_{run_dir.name}"
    fill = session.fill_first_text_input(entity_name)
    time.sleep(0.3)
    filled = session.capture_page(flow_root, label="filled")
    filled_state = session.inspect_interaction_state(flow_root, label="filled")
    if not fill.get("ok"):
        network_artifacts = session.write_network_artifacts(flow_root)
        trace = {
            "node": node,
            "status": "captured_readonly",
            "reason": fill.get("reason") or "form_input_not_found",
            "trigger": click,
            "fill": fill,
            "before_state": before_state,
            "dialog_state": dialog_state,
            "filled_state": filled_state,
            "captured_at": iso_now(),
        }
        record_flow_trace(run_dir, flow_key, trace)
        session.press_escape()
        return {
            "run_type": "flow",
            "summary": {
                "node": node,
                "status": "captured_readonly",
                "reason": trace["reason"],
                "network": {key: str(path.relative_to(TMP_ROOT)) for key, path in network_artifacts.items()},
            },
            "source_title": filled.get("title") or dialog.get("title") or node.get("ui_surface"),
            "source_url": filled.get("href") or dialog.get("href") or node["source_url"],
            "status": "ok",
            "mutation_status": "captured_readonly",
            "reason": trace["reason"],
        }

    submit = session.submit_dialog(config["submit_labels"])
    time.sleep(1.6)
    after = session.capture_page(flow_root, label="after-submit")
    after_state = session.inspect_interaction_state(flow_root, label="after-submit")
    network_artifacts = session.write_network_artifacts(flow_root)
    created_url = after.get("href")
    submitted = bool(submit.get("ok"))
    mutation = {
        "flow": flow_key,
        "entity_type": config["entity_type"],
        "status": "ok" if submitted else "captured_readonly",
        "name": entity_name,
        "created_url": created_url,
        "owned": entity_name.startswith(policy["entity_name_prefix"]),
        "cleanup": {
            "status": "manual_cleanup_required" if submitted else "not_submitted",
            "allowed_destructive_on_owned_entities_only": policy.get(
                "allow_destructive_on_owned_entities_only", True
            ),
        },
        "captured_at": iso_now(),
    }
    mutation_path = record_mutation(run_dir, f"{flow_key}-{run_dir.name}", mutation)
    trace = {
        "node": node,
        "status": mutation["status"],
        "trigger": click,
        "fill": fill,
        "submit": submit,
        "before_url": before.get("href"),
        "after_url": created_url,
        "entity_name": entity_name,
        "before_state": before_state,
        "dialog_state": dialog_state,
        "filled_state": filled_state,
        "after_state": after_state,
        "mutation_path": str(mutation_path.relative_to(TMP_ROOT)),
        "captured_at": iso_now(),
    }
    record_flow_trace(run_dir, flow_key, trace)
    summary = {
        "node": node,
        "status": mutation["status"],
        "mutation": mutation,
        "form_state": {
            "before": summarize_interaction_state(before_state),
            "dialog": summarize_interaction_state(dialog_state),
            "filled": summarize_interaction_state(filled_state),
            "after": summarize_interaction_state(after_state),
        },
        "network": {key: str(path.relative_to(TMP_ROOT)) for key, path in network_artifacts.items()},
    }
    if not submitted:
        session.press_escape()
    return {
        "run_type": "flow",
        "summary": summary,
        "source_title": after.get("title") or dialog.get("title") or node.get("ui_surface"),
        "source_url": created_url or dialog.get("href") or node["source_url"],
        "status": "ok",
        "mutation_status": "captured_mutation" if submitted else "captured_readonly",
        "reason": mutation["cleanup"]["status"] if submitted else submit.get("reason"),
    }


def execute_flow_node(session: CdpSession, run_dir: Path, node: dict, policy: dict):
    if not flow_allowed(node, policy):
        summary = {
            "node": node,
            "status": "captured_readonly",
            "reason": "sandbox_not_allowed",
        }
        record_flow_trace(run_dir, node["scope_key"], summary)
        return {
            "run_type": "flow",
            "summary": summary,
            "source_title": node.get("ui_surface"),
            "source_url": node.get("source_url"),
            "status": "ok",
            "mutation_status": "captured_readonly",
            "reason": "sandbox_not_allowed",
        }
    if node["scope_key"] in SAFE_CREATE_FLOW_CONFIG:
        return execute_safe_create_flow(session, run_dir, node, policy)
    if node.get("metadata", {}).get("flow_kind") == "readonly_form_probe":
        return execute_readonly_form_probe(session, run_dir, node)
    summary = {
        "node": node,
        "status": "blocked",
        "reason": "flow_not_implemented",
    }
    record_flow_trace(run_dir, node["scope_key"], summary)
    return {
        "run_type": "flow",
        "summary": summary,
        "source_title": node.get("ui_surface"),
        "source_url": node.get("source_url"),
        "status": "blocked",
        "mutation_status": "blocked",
        "reason": "flow_not_implemented",
    }


def execute_node(session: CdpSession, run_dir: Path, node: dict, frontier: dict, ledger: dict, policy: dict):
    if node["node_type"] == "page":
        return execute_page_node(session, run_dir, node, frontier, ledger)
    if node["node_type"] == "interaction":
        return execute_interaction_node(session, run_dir, node, frontier, ledger)
    if node["node_type"] == "flow":
        return execute_flow_node(session, run_dir, node, policy)
    raise RuntimeError(f"unsupported node_type: {node['node_type']}")


def blocked_response(status: dict, reason: str):
    return {
        "status": "infra-blocked",
        "reason": reason,
        "consumer_policy": status.get("consumer_policy"),
        "websocket_attach": status.get("websocket_attach"),
        "linear_target_title": status.get("linear_target_title"),
        "linear_target_url": status.get("linear_target_url"),
        "updated_at": iso_now(),
    }


def is_recoverable_capture_error(exc: Exception) -> bool:
    message = f"{type(exc).__name__}: {exc}"
    return is_recoverable_error_message(message)


def execute_node_with_retry(status: dict, run_dir: Path, node: dict, frontier: dict, ledger: dict, policy: dict):
    attempt_errors = []
    current_status = status
    for attempt in range(2):
        try:
            if attempt > 0:
                current_status = read_watchdog_status(WATCHDOG_STATUS_PATH)
            if current_status.get("websocket_attach") != "ok":
                raise RuntimeError("websocket_attach_not_ok_before_attempt")
            with CdpSession.from_watchdog_status(current_status) as session:
                result = execute_node(session, run_dir, node, frontier, ledger, policy)
            return result, attempt_errors
        except Exception as exc:
            attempt_errors.append(f"attempt_{attempt + 1}: {type(exc).__name__}: {exc}")
            if attempt == 0 and is_recoverable_capture_error(exc):
                current_status = read_watchdog_status(WATCHDOG_STATUS_PATH)
                if current_status.get("websocket_attach") != "ok":
                    raise
                if run_dir.exists():
                    shutil.rmtree(run_dir)
                run_dir.mkdir(parents=True, exist_ok=True)
                continue
            raise


def run_capture_once():
    lock_handle = try_acquire_capture_lock()
    if lock_handle is None:
        payload = {
            "status": "already-running",
            "reason": "capture_lock_held",
            "lock_path": str(CAPTURE_LOCK_PATH.relative_to(REPO_ROOT)),
            "updated_at": iso_now(),
        }
        print(json.dumps(payload, ensure_ascii=False, indent=2))
        return 0
    try:
        return run_capture_once_unlocked()
    finally:
        fcntl.flock(lock_handle, fcntl.LOCK_UN)
        lock_handle.close()


def run_capture_once_unlocked():
    status = read_watchdog_status(WATCHDOG_STATUS_PATH)
    if status.get("consumer_policy") != "attached_cdp_only":
        payload = blocked_response(status, "consumer_policy_not_attached_cdp_only")
        print(json.dumps(payload, ensure_ascii=False, indent=2))
        return 0
    if status.get("websocket_attach") != "ok":
        payload = blocked_response(status, "websocket_attach_not_ok")
        print(json.dumps(payload, ensure_ascii=False, indent=2))
        return 0

    registry = initialize_registry(status)
    frontier = initialize_frontier(registry)
    ledger = initialize_coverage(registry)
    recapture_requests = load_recapture_requests()
    policy = load_mutation_policy()
    repaired = recover_legacy_retryable_nodes(frontier, ledger, status)
    reconciled = reconcile_ledger_from_successful_runs(ledger)
    recapture_applied = apply_recapture_requests(frontier, ledger, recapture_requests)
    if repaired or reconciled or recapture_applied:
        backup_state_file_once(TMP_ROOT / "state" / "frontier.json")
        backup_state_file_once(TMP_ROOT / "state" / "coverage-ledger.json")
        save_frontier(frontier)
        save_coverage(ledger)
        save_recapture_requests(recapture_requests)
    node = select_next_node(frontier)
    if not node:
        frontier_summary = summarize_frontier(frontier)
        if frontier_summary["retryable_blocked"] or frontier_summary["blocked_legacy"]:
            payload = {
                "status": "needs_requeue",
                "reason": "retryable_blocked_waiting_or_exhausted",
                "frontier": frontier_summary,
                "updated_at": iso_now(),
            }
            print(json.dumps(payload, ensure_ascii=False, indent=2))
            return 0
        payload = {
            "status": "no-work",
            "reason": "frontier_empty",
            "frontier": frontier_summary,
            "updated_at": iso_now(),
        }
        print(json.dumps(payload, ensure_ascii=False, indent=2))
        return 0

    node["status"] = "in_progress"
    node["started_at"] = iso_now()
    save_frontier(frontier)

    run_id = time.strftime("%Y%m%dT%H%M%S%z", time.localtime())
    run_dir = TMP_ROOT / "runs" / run_id
    run_dir.mkdir(parents=True, exist_ok=True)

    try:
        result, attempt_errors = execute_node_with_retry(
            status=status,
            run_dir=run_dir,
            node=node,
            frontier=frontier,
            ledger=ledger,
            policy=policy,
        )
        manifest, latest = finalize_run(
            run_dir=run_dir,
            run_type=result["run_type"],
            node=node,
            source_title=result["source_title"],
            source_url=result["source_url"],
            websocket_attach=status.get("websocket_attach", "unknown"),
            summary=result["summary"],
            status=result["status"],
        )
        node["status"] = "completed" if result["status"] == "ok" else "terminal_blocked"
        node["completed_at"] = iso_now()
        if result["status"] == "ok":
            node.pop("blocker_type", None)
            node.pop("last_error", None)
            node.pop("next_retry_at", None)
        else:
            node["blocker_type"] = "terminal"
            node["last_error"] = result.get("reason") or result["status"]
            node["next_retry_at"] = None
        update_ledger(
            ledger,
            node["node_key"],
            node["node_type"],
            node["scope_key"],
            result.get("mutation_status") or ("captured_readonly" if result["status"] == "ok" else "blocked"),
            run_id=run_id,
            artifact_hash=manifest["artifact_hash"],
            reason=result.get("reason") or result["status"],
        )
        mark_recapture_request_attempt(
            recapture_requests,
            node,
            run_id=run_id,
            status=result["status"],
            artifact_hash=manifest["artifact_hash"],
            error=result.get("reason"),
        )
        save_frontier(frontier)
        save_coverage(ledger)
        save_recapture_requests(recapture_requests)
        payload = {
            "status": result["status"],
            "run_id": run_id,
            "recapture_applied": recapture_applied,
            "node": {
                "node_key": node["node_key"],
                "node_type": node["node_type"],
                "scope_key": node["scope_key"],
                "source_url": node["source_url"],
            },
            "manifest": manifest,
            "latest": latest,
            "attempt_errors": attempt_errors,
            "frontier_path": str((TMP_ROOT / "state" / "frontier.json").relative_to(REPO_ROOT)),
            "coverage_ledger_path": str(
                (TMP_ROOT / "state" / "coverage-ledger.json").relative_to(REPO_ROOT)
            ),
        }
        print(json.dumps(payload, ensure_ascii=False, indent=2))
        return 0
    except Exception as exc:
        error_message = f"{type(exc).__name__}: {exc}"
        failure_status = mark_node_failure(node, error_message)
        update_ledger(
            ledger,
            node["node_key"],
            node["node_type"],
            node["scope_key"],
            failure_status,
            run_id=run_id,
            reason=error_message,
        )
        mark_recapture_request_attempt(
            recapture_requests,
            node,
            run_id=run_id,
            status=failure_status,
            error=error_message,
        )
        save_frontier(frontier)
        save_coverage(ledger)
        save_recapture_requests(recapture_requests)
        is_retryable = failure_status == "retryable_blocked"
        error_payload = {
            "status": "retryable_blocked" if is_retryable else "error",
            "run_id": run_id,
            "recapture_applied": recapture_applied,
            "blocker_type": node.get("blocker_type"),
            "next_retry_at": node.get("next_retry_at"),
            "node": {
                "node_key": node["node_key"],
                "node_type": node["node_type"],
                "scope_key": node["scope_key"],
            },
            "error": error_message,
        }
        print(json.dumps(error_payload, ensure_ascii=False, indent=2))
        return 0 if is_retryable else 1


def run_legacy_capture(out_root: Path = None):
    status = read_watchdog_status(WATCHDOG_STATUS_PATH)
    if status.get("consumer_policy") != "attached_cdp_only" or status.get("websocket_attach") != "ok":
        payload = blocked_response(status, "legacy_capture_infra_blocked")
        print(json.dumps(payload, ensure_ascii=False, indent=2))
        return 0
    out_root = out_root or TMP_ROOT
    run_id = time.strftime("%Y%m%dT%H%M%S%z", time.localtime())
    run_dir = out_root / "runs" / run_id
    run_dir.mkdir(parents=True, exist_ok=True)
    with CdpSession.from_watchdog_status(status) as session:
        active_node = make_page_node(
            {
                "scope_key": "workspace:cleantrack/team:CLE/active",
                "url": "https://linear.app/cleantrack/team/CLE/active",
                "ui_surface": "Legacy active issues baseline",
                "priority": 10,
                "provenance": "legacy-adapter",
            }
        )
        issue_node = make_page_node(
            {
                "scope_key": derive_scope_key(status.get("attached_url") or "https://linear.app/cleantrack/issue/CLE-28"),
                "url": status.get("attached_url") or "https://linear.app/cleantrack/issue/CLE-28",
                "ui_surface": "Legacy issue detail baseline",
                "priority": 11,
                "provenance": "legacy-adapter",
            }
        )
        active_result = execute_page_node(session, run_dir, active_node, {"nodes": []}, {"entries": {}})
        issue_result = execute_page_node(session, run_dir, issue_node, {"nodes": []}, {"entries": {}})
    summary = {
        "status": "ok",
        "legacy_adapter": True,
        "captures": [active_result["summary"], issue_result["summary"]],
    }
    manifest, latest = finalize_run(
        run_dir=run_dir,
        run_type="legacy-page-bundle",
        node={
            "scope_key": "linear-legacy-toolbar-issue-detail",
            "ui_surface": "Legacy toolbar + issue detail adapter",
        },
        source_title=issue_result["source_title"],
        source_url=issue_result["source_url"],
        websocket_attach=status.get("websocket_attach", "unknown"),
        summary=summary,
        status="ok",
    )
    payload = {
        "status": "ok",
        "run_id": run_id,
        "legacy_adapter": True,
        "manifest": manifest,
        "latest": latest,
    }
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    return 0


def main(argv=None):
    argv = argv or sys.argv[1:]
    if argv and argv[0] == "--legacy":
        out_root = Path(argv[1]).expanduser() if len(argv) > 1 else TMP_ROOT
        return run_legacy_capture(out_root=out_root)
    return run_capture_once()


if __name__ == "__main__":
    raise SystemExit(main())
