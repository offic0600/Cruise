import hashlib
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional


REPO_ROOT = Path("/Users/liuzheng/Desktop/Cruise")
CAPTURE_ROOT = REPO_ROOT / "tmp" / "linear-capture"
IMPLEMENT_ROOT = REPO_ROOT / "tmp" / "linear-implement"
CAPTURE_LEDGER_PATH = CAPTURE_ROOT / "state" / "coverage-ledger.json"


def iso_now() -> str:
    return datetime.now(timezone.utc).astimezone().isoformat()


def json_load(path: Path, default=None):
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def json_dump(path: Path, payload):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def slugify(value: str) -> str:
    parts = []
    for char in value.lower():
        if char.isalnum():
            parts.append(char)
        else:
            parts.append("-")
    text = "".join(parts).strip("-")
    while "--" in text:
        text = text.replace("--", "-")
    return text or "surface"


def work_id_for(scope_key: str, artifact_hash: str) -> str:
    return f"{slugify(scope_key)}-{artifact_hash[:12]}"


def relative_to_repo(path: Path) -> str:
    return str(path.relative_to(REPO_ROOT))


def load_capture_paths(latest_capture: dict):
    manifest_path = CAPTURE_ROOT / latest_capture["latest_manifest"]
    summary_path = CAPTURE_ROOT / latest_capture["latest_summary"]
    manifest = json_load(manifest_path, default={}) or {}
    summary = json_load(summary_path, default={}) or {}

    scope_key = manifest.get("capture_scope") or latest_capture.get("latest_capture_scope")
    page_dir_name = slugify(scope_key.replace(":", "-").replace("/", "-"))
    page_root = CAPTURE_ROOT / "runs" / latest_capture["latest_run_id"] / "pages" / page_dir_name
    page_json_path = page_root / "page.json"
    elements_json_path = page_root / "elements.json"
    screenshot_path = page_root / "screenshots" / "default.png"
    dom_path = page_root / "dom" / "default.json"
    har_path = page_root / "har" / "session.har.json"

    return {
        "manifest_path": manifest_path,
        "summary_path": summary_path,
        "page_json_path": page_json_path,
        "elements_json_path": elements_json_path,
        "screenshot_path": screenshot_path,
        "dom_path": dom_path,
        "har_path": har_path,
        "manifest": manifest,
        "summary": summary,
        "page": json_load(page_json_path, default={}) or {},
        "elements": json_load(elements_json_path, default={}) or {},
    }


def capture_paths_are_actionable(capture_paths: dict) -> bool:
    return (
        bool(capture_paths.get("manifest"))
        and bool(capture_paths.get("summary"))
        and capture_paths["page_json_path"].exists()
        and capture_paths["elements_json_path"].exists()
    )


def existing_source_paths(scope_key: str):
    candidates = {
        "inbox": [
            REPO_ROOT / "frontend/src/components/inbox/InboxPage.tsx",
            REPO_ROOT / "frontend/src/app/[workspaceSlug]/inbox/page.tsx",
            REPO_ROOT / "frontend/src/i18n/messages/en.ts",
            REPO_ROOT / "frontend/src/i18n/messages/zh-CN.ts",
        ],
        "issue": [
            REPO_ROOT / "frontend/src/components/issues/IssueDetailPage.tsx",
            REPO_ROOT / "frontend/src/lib/routes.ts",
        ],
        "projects": [
            REPO_ROOT / "frontend/src/components/projects/WorkspaceProjectsPage.tsx",
            REPO_ROOT / "frontend/src/lib/routes.ts",
        ],
        "views": [
            REPO_ROOT / "frontend/src/app/views/page.tsx",
            REPO_ROOT / "frontend/src/lib/routes.ts",
        ],
        "cycles": [
            REPO_ROOT / "frontend/src/components/AppLayout.tsx",
            REPO_ROOT / "frontend/src/lib/routes.ts",
        ],
        "team_issues": [
            REPO_ROOT / "frontend/src/components/issues/ActiveIssuesWorkbenchPage.tsx",
            REPO_ROOT / "frontend/src/app/[workspaceSlug]/team/[teamKey]/active/page.tsx",
            REPO_ROOT / "frontend/src/app/[workspaceSlug]/team/[teamKey]/backlog/page.tsx",
            REPO_ROOT / "frontend/src/app/[workspaceSlug]/team/[teamKey]/done/page.tsx",
            REPO_ROOT / "frontend/src/lib/routes.ts",
            REPO_ROOT / "frontend/src/i18n/messages/en.ts",
            REPO_ROOT / "frontend/src/i18n/messages/zh-CN.ts",
        ],
        "roadmap": [
            REPO_ROOT / "frontend/src/components/AppLayout.tsx",
            REPO_ROOT / "frontend/src/lib/routes.ts",
        ],
        "settings": [
            REPO_ROOT / "frontend/src/components/AppLayout.tsx",
            REPO_ROOT / "frontend/src/lib/routes.ts",
        ],
    }
    if scope_key == "inbox":
        selected = candidates["inbox"]
    elif scope_key.startswith("issue:"):
        selected = candidates["issue"]
    elif scope_key.startswith("projects") or scope_key.startswith("project:"):
        selected = candidates["projects"]
    elif scope_key.startswith("views"):
        selected = candidates["views"]
    elif scope_key.startswith("cycles"):
        selected = candidates["cycles"]
    elif "/team:" in scope_key:
        selected = candidates["team_issues"]
    elif scope_key.startswith("roadmap"):
        selected = candidates["roadmap"]
    elif scope_key.startswith("settings:"):
        selected = candidates["settings"]
    else:
        selected = [REPO_ROOT / "frontend/src/components/AppLayout.tsx", REPO_ROOT / "frontend/src/lib/routes.ts"]
    return [relative_to_repo(path) for path in selected if path.exists()]


def blueprint_for(scope_key: str, page: dict, elements: dict):
    title = page.get("title") or scope_key
    interaction_count = int(elements.get("count", 0) or 0)

    if scope_key == "inbox":
        return {
            "goal": "围绕 Inbox 做一个页面级小闭环：收紧顶部 chrome、过滤/显示控制与双栏 detail split 的 Linear 风格密度与反馈。",
            "candidate_changes": [
                "对齐顶部 title / more menu / segmented tabs count 的位置、层级和视觉密度。",
                "对齐 filter chip 计数、display toggle 与二级控制区的排列和反馈样式。",
                "对齐左侧通知列表与右侧 detail panel 的分栏比例、空态与 loading/empty feedback。",
            ],
            "acceptance_checks": [
                "Inbox 页在当前 workspace 下具备与 capture 一致的标题行、tabs、filter/display 控制区和双栏骨架。",
                "Inbox detail 面板里的资源跳转不回归，issue/project/view 链接仍能正确生成。",
                "`cd frontend && npx tsc --noEmit`",
                "若本轮修改了路由或抽出了纯 helper，则补最小 focused test 并运行对应 `pnpm test -- --run ...`。",
            ],
            "milestone_summary_template": "Inbox 页面级小闭环：顶部 chrome、filter/display controls 与双栏 detail split 已按 capture 对齐。",
        }

    if scope_key.startswith("issue:"):
        return {
            "goal": f"围绕 {title} 做一个 issue detail 页面级小闭环：收紧顶部 hero、右侧属性栏和详情内容层级。",
            "candidate_changes": [
                "对齐 issue hero 区域的层级、标题/面包屑/父任务信息与操作入口。",
                "对齐右侧属性栏的信息密度、状态徽标与关键字段排列。",
                "对齐详情正文与活动/属性分区的骨架和空态反馈。",
            ],
            "acceptance_checks": [
                "Issue detail 页的 hero、属性栏与内容分区对齐 capture 证据，不引入 route contract 回归。",
                "`cd frontend && npx tsc --noEmit`",
                "若触及 `routes.ts` 或 issue detail shell helper，则运行相应 focused tests。",
            ],
            "milestone_summary_template": f"{scope_key} 页面级小闭环：issue hero、属性栏与正文分区已按 capture 收口。",
        }

    if scope_key.startswith("projects") or scope_key.startswith("project:"):
        return {
            "goal": f"围绕 {title} 做一个项目页页面级小闭环：收紧页面壳层、主操作区和主内容布局。",
            "candidate_changes": [
                "对齐项目页标题区、主操作入口和筛选/切换控件。",
                "对齐主内容区卡片、列表或概览模块的节奏和层级。",
                "补齐关键空态/loading/feedback，不做跨页面功能扩张。",
            ],
            "acceptance_checks": [
                "Projects surface 的页面壳层、主操作和主内容布局对齐当前 capture。",
                "`cd frontend && npx tsc --noEmit`",
            ],
            "milestone_summary_template": f"{scope_key} 页面级小闭环：项目页壳层、主操作与主内容布局已按 capture 收口。",
        }

    if scope_key.startswith("views"):
        return {
            "goal": f"围绕 {title} 做一个 Views 页面级小闭环：收紧列表壳层、管理入口与关键反馈状态。",
            "candidate_changes": [
                "对齐 Views 标题区、主操作与列表头部密度。",
                "对齐创建/管理入口的可见性和控制区节奏。",
                "补齐空态/loading/反馈骨架，避免只做 wording 微调。",
            ],
            "acceptance_checks": [
                "Views 页主壳层、列表控制与关键反馈状态对齐当前 capture。",
                "`cd frontend && npx tsc --noEmit`",
            ],
            "milestone_summary_template": f"{scope_key} 页面级小闭环：Views 主壳层、管理入口与反馈状态已按 capture 收口。",
        }

    generic_changes = [
        "对齐页面标题区、主操作入口和一级导航/切换控件。",
        "对齐主内容区的容器层级、间距和主要反馈状态。",
        "补齐当前 capture 明确暴露出的可见空态、loading 或交互反馈差异。",
    ]
    if interaction_count < 3:
        generic_changes = generic_changes[:2]

    return {
        "goal": f"围绕 {title} 做一个页面级小闭环：把 capture 明确暴露出的主壳层与关键交互差异收口。",
        "candidate_changes": generic_changes,
        "acceptance_checks": [
            "当前 scope 的主壳层、主操作与关键反馈状态对齐 capture 证据。",
            "`cd frontend && npx tsc --noEmit`",
        ],
        "milestone_summary_template": f"{scope_key} 页面级小闭环：主壳层、主操作与关键反馈状态已按 capture 收口。",
    }


def build_evidence_refs(latest_capture: dict, capture_paths: dict):
    refs = {
        "capture_latest": relative_to_repo(CAPTURE_ROOT / "latest.json"),
        "capture_manifest": relative_to_repo(capture_paths["manifest_path"]),
        "capture_summary": relative_to_repo(capture_paths["summary_path"]),
    }
    for key in ("page_json_path", "elements_json_path", "screenshot_path", "dom_path", "har_path"):
        path = capture_paths[key]
        if path.exists():
            refs[key.replace("_path", "")] = relative_to_repo(path)
    return refs


def build_work_item(latest_capture: dict, capture_paths: dict):
    manifest = capture_paths["manifest"]
    summary = capture_paths["summary"]
    page = capture_paths["page"]
    elements = capture_paths["elements"]
    scope_key = manifest.get("capture_scope") or latest_capture["latest_capture_scope"]
    blueprint = blueprint_for(scope_key, page, elements)
    artifact_hash = latest_capture["latest_artifact_hash"]
    work_id = work_id_for(scope_key, artifact_hash)

    return {
        "work_id": work_id,
        "capture_run_id": latest_capture["latest_run_id"],
        "source_capture_run_id": latest_capture["latest_run_id"],
        "source_ledger_key": f"{manifest.get('run_type', 'page')}:{scope_key}",
        "scope_dedupe_key": scope_key,
        "artifact_hash": artifact_hash,
        "scope_key": scope_key,
        "ui_surface": manifest.get("ui_surface") or page.get("title") or scope_key,
        "goal": blueprint["goal"],
        "candidate_changes": blueprint["candidate_changes"][:4],
        "evidence_refs": build_evidence_refs(latest_capture, capture_paths),
        "acceptance_checks": blueprint["acceptance_checks"],
        "source_paths": existing_source_paths(scope_key),
        "milestone_summary": blueprint["milestone_summary_template"],
        "status": "pending",
        "created_at": iso_now(),
        "updated_at": iso_now(),
    }


def git_status_summary():
    result = subprocess.run(
        ["git", "-C", str(REPO_ROOT), "status", "--short"],
        capture_output=True,
        text=True,
        check=False,
    )
    tracked_dirty_paths = []
    untracked_paths = []
    raw_entries = []
    for raw_line in (result.stdout or "").splitlines():
        line = raw_line.rstrip()
        if not line:
            continue
        raw_entries.append(line)
        status = line[:2]
        path = line[3:]
        if status == "??":
            untracked_paths.append(path)
        else:
            tracked_dirty_paths.append(path)
    return {
        "raw": raw_entries,
        "tracked_dirty_paths": tracked_dirty_paths,
        "untracked_paths": untracked_paths,
    }


def worktree_context_for_item(item: dict):
    status = git_status_summary()
    source_set = set(item.get("source_paths", []))
    tracked_dirty_paths = status["tracked_dirty_paths"]
    source_dirty_paths = [path for path in tracked_dirty_paths if path in source_set]
    unrelated_tracked_dirty_paths = [path for path in tracked_dirty_paths if path not in source_set]
    return {
        "tracked_dirty_paths": tracked_dirty_paths,
        "untracked_paths": status["untracked_paths"],
        "source_dirty_paths": source_dirty_paths,
        "unrelated_tracked_dirty_paths": unrelated_tracked_dirty_paths,
        "selective_commit_required": bool(unrelated_tracked_dirty_paths or status["untracked_paths"]),
        "commit_scope_paths": item.get("source_paths", []),
        "raw": status["raw"],
    }


def bootstrap_state():
    path = IMPLEMENT_ROOT / "state.json"
    state = json_load(path, default=None)
    if state is None:
        state = {
            "version": 1,
            "mode": "evidence_driven_page_milestones",
            "last_consumed_capture_run_id": None,
            "last_consumed_artifact_hash": None,
            "active_work_id": None,
            "last_successful_commit": None,
            "updated_at": iso_now(),
        }
        json_dump(path, state)
    return state, path


def bootstrap_queue():
    path = IMPLEMENT_ROOT / "queue.json"
    queue = json_load(path, default=None)
    if queue is None:
        queue = {"version": 1, "items": [], "updated_at": iso_now()}
        json_dump(path, queue)
    return queue, path


def save_state(state: dict, path: Path):
    state["updated_at"] = iso_now()
    json_dump(path, state)


def save_queue(queue: dict, path: Path):
    queue["updated_at"] = iso_now()
    json_dump(path, queue)


def save_latest(payload: dict):
    path = IMPLEMENT_ROOT / "latest.json"
    payload["generated_at"] = iso_now()
    json_dump(path, payload)
    return path


def find_queue_item(queue: dict, work_id: str):
    for item in queue.get("items", []):
        if item.get("work_id") == work_id:
            return item
    return None


def queue_counts(queue: dict):
    counts = {}
    for item in queue.get("items", []):
        status = item.get("status", "unknown")
        counts[status] = counts.get(status, 0) + 1
    return counts


def capture_from_manifest(manifest_path: Path):
    manifest = json_load(manifest_path, default={}) or {}
    if manifest.get("status") != "ok":
        return None
    run_id = manifest.get("run_id") or manifest_path.parent.name
    summary_path = manifest_path.parent / "summary.json"
    if not summary_path.exists():
        return None
    artifact_hash = manifest.get("artifact_hash")
    if not artifact_hash:
        return None
    return {
        "latest_run_id": run_id,
        "latest_artifact_hash": artifact_hash,
        "latest_capture_scope": manifest.get("capture_scope"),
        "latest_status": manifest.get("status"),
        "latest_manifest": relative_to_repo(manifest_path).replace("tmp/linear-capture/", ""),
        "latest_summary": relative_to_repo(summary_path).replace("tmp/linear-capture/", ""),
        "run_type": manifest.get("run_type", "page"),
        "captured_at": manifest.get("captured_at", ""),
    }


def successful_capture_backlog():
    captures = []
    for manifest_path in sorted((CAPTURE_ROOT / "runs").glob("*/manifest.json")):
        capture = capture_from_manifest(manifest_path)
        if capture:
            captures.append(capture)
    captures.sort(
        key=lambda capture: (
            {"page": 0, "interaction": 1, "flow": 2}.get(capture.get("run_type"), 9),
            capture.get("captured_at") or "",
            capture.get("latest_run_id") or "",
        )
    )
    return captures


def existing_queue_keys(queue: dict):
    artifact_hashes = set()
    scope_keys = set()
    for item in queue.get("items", []):
        if item.get("artifact_hash"):
            artifact_hashes.add(item["artifact_hash"])
        scope_key = item.get("scope_dedupe_key") or item.get("scope_key")
        if scope_key:
            scope_keys.add(scope_key)
    return artifact_hashes, scope_keys


def mark_ledger_enqueued(ledger: dict, item: dict):
    entries = ledger.setdefault("entries", {})
    ledger_key = item.get("source_ledger_key") or f"page:{item.get('scope_key')}"
    entry = entries.get(ledger_key)
    if not entry:
        return False
    entry["implementation_enqueued_at"] = iso_now()
    entry["implementation_work_id"] = item["work_id"]
    return True


def reconcile_ledger_enqueued_from_queue(queue: dict, ledger: dict) -> bool:
    changed = False
    for item in queue.get("items", []):
        if item.get("status") not in {"pending", "in_progress", "blocked", "done"}:
            continue
        changed = mark_ledger_enqueued(ledger, item) or changed
    return changed


def item_has_actionable_evidence(item: dict) -> bool:
    refs = item.get("evidence_refs") or {}
    page_ref = refs.get("page_json") or refs.get("page")
    elements_ref = refs.get("elements_json") or refs.get("elements")
    if not page_ref or not elements_ref:
        return False
    return (REPO_ROOT / page_ref).exists() and (REPO_ROOT / elements_ref).exists()


def prune_non_actionable_items(state: dict, queue: dict) -> bool:
    changed = False
    active_work_id = state.get("active_work_id")
    for item in queue.get("items", []):
        if item.get("status") == "done":
            continue
        if item_has_actionable_evidence(item):
            continue
        item["status"] = "terminal_blocked"
        item["blocker"] = "capture_bundle_missing_page_or_elements"
        item["updated_at"] = iso_now()
        if active_work_id == item.get("work_id"):
            state["active_work_id"] = None
        changed = True
    return changed


def enqueue_missing_capture_backlog(queue: dict, ledger: dict):
    added = []
    artifact_hashes, scope_keys = existing_queue_keys(queue)
    for capture in successful_capture_backlog():
        scope_key = capture.get("latest_capture_scope")
        artifact_hash = capture.get("latest_artifact_hash")
        if not scope_key or not artifact_hash:
            continue
        if artifact_hash in artifact_hashes or scope_key in scope_keys:
            continue
        capture_paths = load_capture_paths(capture)
        if not capture_paths_are_actionable(capture_paths):
            continue
        item = build_work_item(capture, capture_paths)
        queue.setdefault("items", []).append(item)
        artifact_hashes.add(item["artifact_hash"])
        scope_keys.add(item["scope_dedupe_key"])
        mark_ledger_enqueued(ledger, item)
        added.append(item["work_id"])
    return added


def select_existing_active(state: dict, queue: dict):
    active_work_id = state.get("active_work_id")
    if not active_work_id:
        return None
    item = find_queue_item(queue, active_work_id)
    if not item:
        state["active_work_id"] = None
        return None
    if item.get("status") in {"done", "blocked", "terminal_blocked"}:
        state["active_work_id"] = None
        return None
    item["status"] = "in_progress"
    if item.get("scope_key"):
        item["source_paths"] = existing_source_paths(item["scope_key"])
    item["updated_at"] = iso_now()
    return item


def select_oldest_pending(queue: dict, last_consumed_artifact_hash: Optional[str]):
    pending = [
        item
        for item in queue.get("items", [])
        if item.get("status") in {"pending", "in_progress"}
        and item.get("artifact_hash") != last_consumed_artifact_hash
    ]
    if not pending:
        return None
    pending.sort(key=lambda item: (item.get("created_at", ""), item.get("work_id", "")))
    item = pending[0]
    item["status"] = "in_progress"
    if item.get("scope_key"):
        item["source_paths"] = existing_source_paths(item["scope_key"])
    item["updated_at"] = iso_now()
    return item


def emit_no_work(reason: str, state_path: Path, queue_path: Path, queue: dict = None, latest_capture: dict = None, backlog_added=None):
    queue = queue or {"items": []}
    latest_capture = latest_capture or {}
    latest_path = save_latest(
        {
            "status": "no_work",
            "reason": reason,
            "state_path": relative_to_repo(state_path),
            "queue_path": relative_to_repo(queue_path),
            "latest_work_path": relative_to_repo(IMPLEMENT_ROOT / "latest.json"),
            "queue_counts": queue_counts(queue),
            "latest_capture_run_id": latest_capture.get("latest_run_id"),
            "latest_capture_scope": latest_capture.get("latest_capture_scope"),
            "backlog_added": backlog_added or [],
        }
    )
    print(
        json.dumps(
            {
                "status": "no_work",
                "reason": reason,
                "state_path": relative_to_repo(state_path),
                "queue_path": relative_to_repo(queue_path),
                "latest_work_path": relative_to_repo(latest_path),
                "queue_counts": queue_counts(queue),
                "latest_capture_run_id": latest_capture.get("latest_run_id"),
                "latest_capture_scope": latest_capture.get("latest_capture_scope"),
                "backlog_added": backlog_added or [],
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0


def main():
    state, state_path = bootstrap_state()
    queue, queue_path = bootstrap_queue()
    latest_capture = json_load(CAPTURE_ROOT / "latest.json", default=None)
    ledger = json_load(CAPTURE_LEDGER_PATH, default={"version": 1, "entries": {}}) or {"version": 1, "entries": {}}
    ledger_changed = reconcile_ledger_enqueued_from_queue(queue, ledger)
    if prune_non_actionable_items(state, queue):
        save_state(state, state_path)
        save_queue(queue, queue_path)
    backlog_added = enqueue_missing_capture_backlog(queue, ledger)
    if backlog_added or ledger_changed:
        save_queue(queue, queue_path)
        json_dump(CAPTURE_LEDGER_PATH, ledger)

    active_item = select_existing_active(state, queue)
    if active_item:
        worktree = worktree_context_for_item(active_item)
        save_state(state, state_path)
        save_queue(queue, queue_path)
        latest_path = save_latest(
            {
                "status": "active_retry",
                "selected_work_id": active_item["work_id"],
                "work_item": active_item,
                "worktree": worktree,
                "state_path": relative_to_repo(state_path),
                "queue_path": relative_to_repo(queue_path),
                "capture_latest_path": relative_to_repo(CAPTURE_ROOT / "latest.json"),
            }
        )
        print(
            json.dumps(
                {
                    "status": "active_retry",
                    "selected_work_id": active_item["work_id"],
                    "work_item": active_item,
                    "worktree": worktree,
                    "state_path": relative_to_repo(state_path),
                    "queue_path": relative_to_repo(queue_path),
                    "latest_work_path": relative_to_repo(latest_path),
                },
                ensure_ascii=False,
                indent=2,
            )
        )
        return 0

    pending_item = select_oldest_pending(queue, state.get("last_consumed_artifact_hash"))
    if pending_item:
        worktree = worktree_context_for_item(pending_item)
        state["active_work_id"] = pending_item["work_id"]
        save_state(state, state_path)
        save_queue(queue, queue_path)
        latest_path = save_latest(
            {
                "status": "ready",
                "selected_work_id": pending_item["work_id"],
                "work_item": pending_item,
                "worktree": worktree,
                "state_path": relative_to_repo(state_path),
                "queue_path": relative_to_repo(queue_path),
                "capture_latest_path": relative_to_repo(CAPTURE_ROOT / "latest.json"),
            }
        )
        print(
            json.dumps(
                {
                    "status": "ready",
                    "selected_work_id": pending_item["work_id"],
                    "work_item": pending_item,
                    "worktree": worktree,
                    "state_path": relative_to_repo(state_path),
                    "queue_path": relative_to_repo(queue_path),
                    "latest_work_path": relative_to_repo(latest_path),
                },
                ensure_ascii=False,
                indent=2,
            )
        )
        return 0

    if not latest_capture:
        return emit_no_work("capture_latest_missing", state_path, queue_path, queue=queue, latest_capture=None, backlog_added=backlog_added)
    if latest_capture.get("latest_status") != "ok":
        return emit_no_work("capture_latest_not_ok", state_path, queue_path, queue=queue, latest_capture=latest_capture, backlog_added=backlog_added)
    if state.get("last_consumed_artifact_hash") == latest_capture.get("latest_artifact_hash"):
        return emit_no_work("latest_capture_already_consumed", state_path, queue_path, queue=queue, latest_capture=latest_capture, backlog_added=backlog_added)

    capture_paths = load_capture_paths(latest_capture)
    if not capture_paths_are_actionable(capture_paths):
        return emit_no_work("capture_bundle_incomplete", state_path, queue_path, queue=queue, latest_capture=latest_capture, backlog_added=backlog_added)

    new_item = build_work_item(latest_capture, capture_paths)
    existing = find_queue_item(queue, new_item["work_id"])
    if existing:
        item = existing
        item.update(
            {
                "goal": new_item["goal"],
                "candidate_changes": new_item["candidate_changes"],
                "evidence_refs": new_item["evidence_refs"],
                "acceptance_checks": new_item["acceptance_checks"],
                "source_paths": new_item["source_paths"],
                "milestone_summary": new_item["milestone_summary"],
                "ui_surface": new_item["ui_surface"],
                "updated_at": iso_now(),
            }
        )
    else:
        item = new_item
        queue["items"].append(item)
        mark_ledger_enqueued(ledger, item)

    item["status"] = "in_progress"
    item["updated_at"] = iso_now()
    state["active_work_id"] = item["work_id"]
    worktree = worktree_context_for_item(item)
    save_state(state, state_path)
    save_queue(queue, queue_path)
    json_dump(CAPTURE_LEDGER_PATH, ledger)
    latest_path = save_latest(
        {
            "status": "ready",
            "selected_work_id": item["work_id"],
            "work_item": item,
            "worktree": worktree,
            "state_path": relative_to_repo(state_path),
            "queue_path": relative_to_repo(queue_path),
            "capture_latest_path": relative_to_repo(CAPTURE_ROOT / "latest.json"),
        }
    )
    print(
        json.dumps(
            {
                "status": "ready",
                "selected_work_id": item["work_id"],
                "work_item": item,
                "worktree": worktree,
                "state_path": relative_to_repo(state_path),
                "queue_path": relative_to_repo(queue_path),
                "latest_work_path": relative_to_repo(latest_path),
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
