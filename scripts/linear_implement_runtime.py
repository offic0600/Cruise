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
RECAPTURE_REQUESTS_PATH = CAPTURE_ROOT / "state" / "recapture-requests.json"
TEAM_ISSUES_CLUSTER_ID = "team-issues-list"
SETTINGS_CONFIGURATION_CLUSTER_ID = "settings-configuration"
ISSUE_CREATE_FLOW_CLUSTER_ID = "issue-create-flow"
TEAM_ISSUES_SCOPE_ORDER = [
    "workspace:cleantrack/team:CLE/active",
    "workspace:cleantrack/team:CLE/all",
    "workspace:cleantrack/team:CLE/backlog",
    "workspace:cleantrack/team:CLE/done",
]
CREATE_FLOW_SCOPE_ORDER = ["create_issue", "create_project", "create_view", "create_label"]
LINE_BUDGET = {"min": 50, "max": 300}


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


def capture_summary_from_manifest(manifest: dict) -> dict:
    run_id = manifest.get("run_id")
    artifact_hash = manifest.get("artifact_hash")
    scope_key = manifest.get("capture_scope")
    manifest_path = CAPTURE_ROOT / "runs" / run_id / "manifest.json"
    summary_path = CAPTURE_ROOT / "runs" / run_id / "summary.json"
    return {
        "latest_run_id": run_id,
        "latest_artifact_hash": artifact_hash,
        "latest_capture_scope": scope_key,
        "latest_status": manifest.get("status"),
        "latest_manifest": relative_to_repo(manifest_path).replace("tmp/linear-capture/", ""),
        "latest_summary": relative_to_repo(summary_path).replace("tmp/linear-capture/", ""),
        "run_type": manifest.get("run_type", "page"),
        "captured_at": manifest.get("captured_at", ""),
    }


def load_capture_paths(latest_capture: dict):
    manifest_path = CAPTURE_ROOT / latest_capture["latest_manifest"]
    summary_path = CAPTURE_ROOT / latest_capture["latest_summary"]
    manifest = json_load(manifest_path, default={}) or {}
    summary = json_load(summary_path, default={}) or {}

    scope_key = manifest.get("capture_scope") or latest_capture.get("latest_capture_scope")
    run_type = manifest.get("run_type", latest_capture.get("run_type", "page"))
    page_dir_name = slugify(scope_key.replace(":", "-").replace("/", "-"))
    page_root = CAPTURE_ROOT / "runs" / latest_capture["latest_run_id"] / "pages" / page_dir_name
    flow_root = CAPTURE_ROOT / "runs" / latest_capture["latest_run_id"] / "flows" / slugify(scope_key)
    page_json_path = page_root / "page.json"
    elements_json_path = page_root / "elements.json"
    screenshot_path = page_root / "screenshots" / "default.png"
    dom_path = page_root / "dom" / "default.json"
    har_path = page_root / "har" / "session.har.json"
    trace_path = flow_root / "trace.json"
    flow_har_path = flow_root / "har" / "session.har.json"

    return {
        "manifest_path": manifest_path,
        "summary_path": summary_path,
        "run_type": run_type,
        "page_json_path": page_json_path,
        "elements_json_path": elements_json_path,
        "screenshot_path": screenshot_path,
        "dom_path": dom_path,
        "har_path": har_path,
        "flow_root": flow_root,
        "trace_path": trace_path,
        "flow_har_path": flow_har_path,
        "manifest": manifest,
        "summary": summary,
        "page": json_load(page_json_path, default={}) or {},
        "elements": json_load(elements_json_path, default={}) or {},
        "trace": json_load(trace_path, default={}) or {},
    }


def capture_paths_are_actionable(capture_paths: dict) -> bool:
    if capture_paths.get("run_type") == "flow":
        return (
            bool(capture_paths.get("manifest"))
            and bool(capture_paths.get("summary"))
            and capture_paths["trace_path"].exists()
        )
    return (
        bool(capture_paths.get("manifest"))
        and bool(capture_paths.get("summary"))
        and capture_paths["page_json_path"].exists()
        and capture_paths["elements_json_path"].exists()
    )


def capture_evidence_quality(capture_paths: dict) -> dict:
    reasons = []
    if capture_paths.get("run_type") == "flow":
        if not capture_paths_are_actionable(capture_paths):
            reasons.append("capture_bundle_missing_flow_trace")
            return {"status": "invalid", "reasons": reasons, "element_count": 0}
        summary = capture_paths.get("summary") or {}
        trace = capture_paths.get("trace") or {}
        reason = summary.get("reason") or trace.get("reason") or summary.get("status")
        return {
            "status": "valid",
            "reasons": [],
            "element_count": int((trace.get("after_state") or {}).get("form_control_count", 0) or 0),
            "title": capture_paths.get("manifest", {}).get("source_target_title"),
            "url": capture_paths.get("manifest", {}).get("source_target_url"),
            "flow_status": summary.get("status") or trace.get("status"),
            "flow_reason": reason,
            "mutation_status": (summary.get("mutation") or {}).get("status"),
        }

    if not capture_paths_are_actionable(capture_paths):
        reasons.append("capture_bundle_missing_page_or_elements")
        return {"status": "invalid", "reasons": reasons, "element_count": 0}

    elements = capture_paths.get("elements") or {}
    element_count = int(elements.get("count") or len(elements.get("elements") or []))
    page = capture_paths.get("page") or {}
    text = " ".join(
        str(page.get(key) or "")
        for key in ("title", "header_text", "visible_text_excerpt", "url")
    )
    normalized = " ".join(text.lower().split())

    if element_count <= 0:
        reasons.append("elements=0")
    if "loading" in normalized and element_count <= 1:
        reasons.append("loading-only")
    if "we could not find the page" in normalized or "not found we could not find the page" in normalized:
        reasons.append("not-found")

    return {
        "status": "valid" if not reasons else "invalid",
        "reasons": reasons,
        "element_count": element_count,
        "title": page.get("title"),
        "url": page.get("url"),
    }


def load_recapture_requests() -> dict:
    return json_load(RECAPTURE_REQUESTS_PATH, default={"version": 1, "requests": []}) or {
        "version": 1,
        "requests": [],
    }


def save_recapture_requests(payload: dict):
    payload["updated_at"] = iso_now()
    json_dump(RECAPTURE_REQUESTS_PATH, payload)


def upsert_recapture_request(requests: dict, *, scope_key: str, capture: dict, quality: dict, cluster_id=None):
    request_key = f"{scope_key}:{capture.get('latest_artifact_hash')}"
    existing = None
    for item in requests.setdefault("requests", []):
        if item.get("request_key") == request_key:
            existing = item
            break
    payload = {
        "request_key": request_key,
        "scope_key": scope_key,
        "cluster_id": cluster_id,
        "capture_run_id": capture.get("latest_run_id"),
        "artifact_hash": capture.get("latest_artifact_hash"),
        "status": "pending",
        "reason": ",".join(quality.get("reasons") or ["invalid_evidence"]),
        "evidence_quality": quality,
        "requested_at": existing.get("requested_at") if existing else iso_now(),
        "updated_at": iso_now(),
    }
    if existing:
        existing.update(payload)
    else:
        requests["requests"].append(payload)
    return payload


def resolve_recapture_request(requests: dict, *, scope_key: str, artifact_hash: str):
    changed = False
    for item in requests.setdefault("requests", []):
        if (
            item.get("scope_key") == scope_key
            and item.get("status") in {"pending", "recaptured_pending_validation"}
            and artifact_hash in {item.get("artifact_hash"), item.get("recaptured_artifact_hash")}
        ):
            item["status"] = "resolved_valid_evidence"
            item["resolved_at"] = iso_now()
            item["updated_at"] = iso_now()
            changed = True
    return changed


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
            REPO_ROOT / "frontend/src/components/settings/TeamSettingsShell.tsx",
            REPO_ROOT / "frontend/src/components/settings/TemplateSettingsView.tsx",
            REPO_ROOT / "frontend/src/components/settings/RecurringSettingsView.tsx",
            REPO_ROOT / "frontend/src/components/settings/EmailIntakeSettingsView.tsx",
            REPO_ROOT / "frontend/src/app/[workspaceSlug]/team/[teamKey]/settings/[[...section]]/page.tsx",
            REPO_ROOT / "frontend/src/app/teams/current/settings/templates/page.tsx",
            REPO_ROOT / "frontend/src/app/teams/current/settings/recurring/page.tsx",
            REPO_ROOT / "frontend/src/app/teams/current/settings/email-intake/page.tsx",
            REPO_ROOT / "frontend/src/components/AppLayout.tsx",
            REPO_ROOT / "frontend/src/lib/routes.ts",
            REPO_ROOT / "frontend/src/i18n/messages/en.ts",
            REPO_ROOT / "frontend/src/i18n/messages/zh-CN.ts",
        ],
        "issue_create_flow": [
            REPO_ROOT / "frontend/src/components/issues/IssueComposer.tsx",
            REPO_ROOT / "frontend/src/components/issues/MarkdownEditor.tsx",
            REPO_ROOT / "frontend/src/components/issues/IssueAssigneeSelectMenu.tsx",
            REPO_ROOT / "frontend/src/components/issues/IssueLabelsSelectMenu.tsx",
            REPO_ROOT / "frontend/src/components/issues/IssuePrioritySelectMenu.tsx",
            REPO_ROOT / "frontend/src/components/issues/IssueStatusSelectMenu.tsx",
            REPO_ROOT / "frontend/src/app/issues/new/page.tsx",
            REPO_ROOT / "frontend/src/app/[workspaceSlug]/views/issues/new/page.tsx",
            REPO_ROOT / "frontend/src/lib/forms/issue.ts",
            REPO_ROOT / "frontend/src/lib/issues/composer.ts",
            REPO_ROOT / "frontend/src/lib/toast/issue-created.ts",
            REPO_ROOT / "frontend/src/lib/routes.ts",
            REPO_ROOT / "frontend/src/i18n/messages/en.ts",
            REPO_ROOT / "frontend/src/i18n/messages/zh-CN.ts",
        ],
    }
    if scope_key == TEAM_ISSUES_CLUSTER_ID:
        selected = candidates["team_issues"]
    elif scope_key == SETTINGS_CONFIGURATION_CLUSTER_ID:
        selected = candidates["settings"]
    elif scope_key == ISSUE_CREATE_FLOW_CLUSTER_ID:
        selected = candidates["issue_create_flow"]
    elif scope_key == "inbox":
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
    for key in (
        "page_json_path",
        "elements_json_path",
        "screenshot_path",
        "dom_path",
        "har_path",
        "trace_path",
        "flow_har_path",
    ):
        path = capture_paths.get(key)
        if path and path.exists():
            refs[key.replace("_path", "")] = relative_to_repo(path)
    flow_root = capture_paths.get("flow_root")
    if flow_root and flow_root.exists():
        for label in ("before", "dialog", "filled", "after-submit", "after-open"):
            screenshot = flow_root / "screenshots" / f"{label}.png"
            dom = flow_root / "dom" / f"{label}.json"
            state = flow_root / "interaction-state" / f"{label}.json"
            if screenshot.exists():
                refs[f"{label}_screenshot"] = relative_to_repo(screenshot)
            if dom.exists():
                refs[f"{label}_dom"] = relative_to_repo(dom)
            if state.exists():
                refs[f"{label}_interaction_state"] = relative_to_repo(state)
        mutation_dir = flow_root.parent.parent / "mutations"
        mutations = sorted(mutation_dir.glob("*.json")) if mutation_dir.exists() else []
        if mutations:
            refs["mutations"] = [relative_to_repo(path) for path in mutations]
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


def build_team_issues_cluster(captures_by_scope: dict, quality_by_scope: dict):
    cluster_scopes = [scope for scope in TEAM_ISSUES_SCOPE_ORDER if scope in captures_by_scope]
    valid_scopes = [
        scope
        for scope in TEAM_ISSUES_SCOPE_ORDER
        if scope in captures_by_scope and quality_by_scope.get(scope, {}).get("status") == "valid"
    ]
    if len(valid_scopes) < 2:
        return None

    captures = [captures_by_scope[scope] for scope in cluster_scopes]
    artifact_hashes = [capture["latest_artifact_hash"] for capture in captures]
    cluster_hash = hashlib.sha256("|".join(artifact_hashes).encode("utf-8")).hexdigest()
    capture_refs = []
    for scope, capture in zip(cluster_scopes, captures):
        paths = load_capture_paths(capture)
        capture_refs.append(
            {
                "scope_key": scope,
                "capture_run_id": capture["latest_run_id"],
                "artifact_hash": capture["latest_artifact_hash"],
                **build_evidence_refs(capture, paths),
            }
        )

    return {
        "work_id": f"{TEAM_ISSUES_CLUSTER_ID}-{cluster_hash[:12]}",
        "work_type": "evidence_cluster",
        "cluster_id": TEAM_ISSUES_CLUSTER_ID,
        "capture_run_id": captures[-1]["latest_run_id"],
        "source_capture_run_id": captures[-1]["latest_run_id"],
        "capture_run_ids": [capture["latest_run_id"] for capture in captures],
        "artifact_hash": cluster_hash,
        "artifact_hashes": artifact_hashes,
        "source_ledger_key": f"cluster:{TEAM_ISSUES_CLUSTER_ID}",
        "scope_dedupe_key": f"cluster:{TEAM_ISSUES_CLUSTER_ID}",
        "scope_key": TEAM_ISSUES_CLUSTER_ID,
        "scope_keys": cluster_scopes,
        "ui_surface": "Team issues list",
        "goal": "围绕 Team issues list 做一个 evidence cluster 复刻：合并 active/all/backlog 的 toolbar、tabs、列表密度、空态与 loading/error feedback 差异。",
        "candidate_changes": [
            "对齐 team issues 顶部标题、tabs、filter/display/sort/new issue 控制区在 active/all/backlog 间的一致布局。",
            "对齐 issue list rows 的密度、元信息、状态徽标、优先级/标签信息和空态反馈。",
            "把 active 已完成壳层作为基线，补齐 all/backlog 的可见 UI parity，而不是只改路由或导航。",
            "补齐必要 i18n 和 focused tests，确保 team issues cluster 不回退已有 active 行为。",
        ],
        "implementation_slice": {
            "name": "team issues list visible shell and list feedback",
            "expected_change": "50-300 lines across team issue list component, route shells, i18n, and focused tests",
            "allowed_gap_count": "2-6 strongly related UI gaps",
        },
        "line_budget": LINE_BUDGET,
        "evidence_quality": {scope: quality_by_scope[scope] for scope in cluster_scopes},
        "blocked_scope_keys": [
            scope
            for scope in TEAM_ISSUES_SCOPE_ORDER
            if scope in quality_by_scope and quality_by_scope[scope].get("status") != "valid"
        ],
        "evidence_refs": {
            "capture_latest": relative_to_repo(CAPTURE_ROOT / "latest.json"),
            "captures": capture_refs,
        },
        "acceptance_checks": [
            "active/all/backlog 在同一 team issues cluster 下共享一致的 toolbar、tabs、列表密度和反馈状态。",
            "本轮产品代码改动保持在 50-300 行左右，且不是 blocker-only / wording-only / route-only。",
            "`cd frontend && npx tsc --noEmit`",
            "若改动 list helper、route helper 或 i18n 行为，补 focused test 并运行对应 `pnpm test -- --run ...`。",
        ],
        "source_paths": existing_source_paths(TEAM_ISSUES_CLUSTER_ID),
        "milestone_summary": "team-issues-list evidence cluster：active/all/backlog 的 toolbar、tabs、列表密度与关键反馈状态已按 capture cluster 收口。",
        "status": "pending",
        "created_at": iso_now(),
        "updated_at": iso_now(),
    }


def capture_ref_for(scope_key: str, capture: dict) -> dict:
    paths = load_capture_paths(capture)
    return {
        "scope_key": scope_key,
        "capture_run_id": capture["latest_run_id"],
        "artifact_hash": capture["latest_artifact_hash"],
        "run_type": capture.get("run_type", "page"),
        **build_evidence_refs(capture, paths),
    }


def build_settings_configuration_cluster(captures_by_scope: dict, quality_by_scope: dict):
    settings_scopes = sorted(scope for scope in captures_by_scope if scope.startswith("settings:"))
    valid_scopes = [
        scope for scope in settings_scopes if quality_by_scope.get(scope, {}).get("status") == "valid"
    ]
    if not valid_scopes:
        return None

    captures = [captures_by_scope[scope] for scope in valid_scopes]
    captures.sort(key=lambda capture: (capture.get("captured_at") or "", capture["latest_run_id"]))
    artifact_hashes = [capture["latest_artifact_hash"] for capture in captures]
    cluster_hash = hashlib.sha256("|".join(artifact_hashes).encode("utf-8")).hexdigest()
    latest_capture = captures[-1]

    return {
        "work_id": f"{SETTINGS_CONFIGURATION_CLUSTER_ID}-{cluster_hash[:12]}",
        "work_type": "evidence_cluster",
        "cluster_id": SETTINGS_CONFIGURATION_CLUSTER_ID,
        "capture_run_id": latest_capture["latest_run_id"],
        "source_capture_run_id": latest_capture["latest_run_id"],
        "capture_run_ids": [capture["latest_run_id"] for capture in captures],
        "artifact_hash": cluster_hash,
        "artifact_hashes": artifact_hashes,
        "source_ledger_key": f"cluster:{SETTINGS_CONFIGURATION_CLUSTER_ID}",
        "scope_dedupe_key": f"cluster:{SETTINGS_CONFIGURATION_CLUSTER_ID}",
        "scope_key": SETTINGS_CONFIGURATION_CLUSTER_ID,
        "scope_keys": valid_scopes,
        "ledger_refs": [f"page:{scope}" for scope in valid_scopes],
        "ui_surface": "Settings configuration",
        "goal": "围绕 Settings configuration 做一个 evidence cluster 复刻：合并 settings:* 页面证据，收口设置页导航、表单/模板列表、配置卡片和反馈状态。",
        "candidate_changes": [
            "对齐 settings 页面左/顶部导航、section tabs、标题层级和主操作入口。",
            "补齐 issue templates / labels / workflows / account 等设置面的列表、卡片、空态和 loading feedback。",
            "统一 TeamSettingsShell 与 workspace/team settings 路由映射，避免 settings:* 证据只能落到 AppLayout/routes。",
            "补齐必要 i18n 和 focused route/settings tests，确保配置页 contract 不回退。",
        ],
        "implementation_slice": {
            "name": "settings configuration navigation and form surfaces",
            "expected_change": "50-300 lines across settings shell, settings views, routes, i18n, and focused tests",
            "allowed_gap_count": "2-6 strongly related settings UI gaps",
        },
        "line_budget": LINE_BUDGET,
        "evidence_quality": {scope: quality_by_scope[scope] for scope in settings_scopes},
        "blocked_scope_keys": [
            scope for scope in settings_scopes if quality_by_scope.get(scope, {}).get("status") != "valid"
        ],
        "evidence_refs": {
            "capture_latest": relative_to_repo(CAPTURE_ROOT / "latest.json"),
            "captures": [capture_ref_for(scope, captures_by_scope[scope]) for scope in valid_scopes],
        },
        "acceptance_checks": [
            "settings:* valid scopes 在同一 settings-configuration cluster 下共享一致的设置导航、标题层级、表单/列表和反馈状态。",
            "本轮产品代码改动保持在 50-300 行左右，且不是 blocker-only / route-only。",
            "`cd frontend && npx tsc --noEmit`",
            "若改动 settings route helper、TeamSettingsShell 或 i18n，补 focused test 并运行对应 `pnpm test -- --run ...`。",
        ],
        "source_paths": existing_source_paths(SETTINGS_CONFIGURATION_CLUSTER_ID),
        "milestone_summary": "settings-configuration evidence cluster：settings:* 的导航、配置列表/表单与关键反馈状态已按 capture cluster 收口。",
        "status": "pending",
        "created_at": iso_now(),
        "updated_at": iso_now(),
    }


def build_issue_create_flow_cluster(captures_by_scope: dict, quality_by_scope: dict):
    flow_scopes = [scope for scope in CREATE_FLOW_SCOPE_ORDER if scope in captures_by_scope]
    valid_scopes = [
        scope for scope in flow_scopes if quality_by_scope.get(scope, {}).get("status") == "valid"
    ]
    if not valid_scopes:
        return None

    captures = [captures_by_scope[scope] for scope in valid_scopes]
    captures.sort(key=lambda capture: (capture.get("captured_at") or "", capture["latest_run_id"]))
    artifact_hashes = [capture["latest_artifact_hash"] for capture in captures]
    cluster_hash = hashlib.sha256("|".join(artifact_hashes).encode("utf-8")).hexdigest()
    latest_capture = captures[-1]

    return {
        "work_id": f"{ISSUE_CREATE_FLOW_CLUSTER_ID}-{cluster_hash[:12]}",
        "work_type": "evidence_cluster",
        "cluster_id": ISSUE_CREATE_FLOW_CLUSTER_ID,
        "capture_run_id": latest_capture["latest_run_id"],
        "source_capture_run_id": latest_capture["latest_run_id"],
        "capture_run_ids": [capture["latest_run_id"] for capture in captures],
        "artifact_hash": cluster_hash,
        "artifact_hashes": artifact_hashes,
        "source_ledger_key": f"cluster:{ISSUE_CREATE_FLOW_CLUSTER_ID}",
        "scope_dedupe_key": f"cluster:{ISSUE_CREATE_FLOW_CLUSTER_ID}",
        "scope_key": ISSUE_CREATE_FLOW_CLUSTER_ID,
        "scope_keys": valid_scopes,
        "ledger_refs": [f"flow:{scope}" for scope in valid_scopes],
        "ui_surface": "Issue create flow",
        "goal": "围绕 Issue create flow 做一个 evidence cluster 复刻：把 create_issue flow 证据转成可执行的创建入口、composer 弹窗/页面和提交反馈闭环。",
        "candidate_changes": [
            "让 issue detail / issues list 等入口的 Create new issue 能打开与 Linear 对齐的 IssueComposer modal 或 page surface。",
            "对齐创建表单的标题、team/project/status/priority/assignee/label/template/description 控件层级和 loading feedback。",
            "补齐 create-more、保存草稿、创建成功 toast/跳转，以及失败/readonly 状态的反馈 contract。",
            "保留 sandbox 前缀证据约束，确保测试只验证创建 flow 行为，不触碰 destructive 操作。",
        ],
        "implementation_slice": {
            "name": "issue create entrypoints and composer feedback",
            "expected_change": "50-300 lines across IssueComposer, create routes, issue form helpers, toast, i18n, and focused tests",
            "allowed_gap_count": "2-6 strongly related issue create flow gaps",
        },
        "line_budget": LINE_BUDGET,
        "evidence_quality": {scope: quality_by_scope[scope] for scope in flow_scopes},
        "blocked_scope_keys": [
            scope for scope in flow_scopes if quality_by_scope.get(scope, {}).get("status") != "valid"
        ],
        "evidence_refs": {
            "capture_latest": relative_to_repo(CAPTURE_ROOT / "latest.json"),
            "captures": [capture_ref_for(scope, captures_by_scope[scope]) for scope in valid_scopes],
        },
        "acceptance_checks": [
            "Create new issue 入口能打开 issue create surface，而不是产生 no-op / safe_create_form_not_opened。",
            "IssueComposer 的核心控件、提交反馈和成功 toast/跳转对齐 create_issue flow evidence。",
            "`cd frontend && npx tsc --noEmit`",
            "若改动 composer helpers、routes 或 toast，补 focused test 并运行对应 `pnpm test -- --run ...`。",
        ],
        "source_paths": existing_source_paths(ISSUE_CREATE_FLOW_CLUSTER_ID),
        "milestone_summary": "issue-create-flow evidence cluster：创建入口、IssueComposer 表单与提交反馈已按 create_issue flow evidence 收口。",
        "status": "pending",
        "created_at": iso_now(),
        "updated_at": iso_now(),
    }


def enqueue_cluster_item(queue: dict, ledger: dict, cluster: dict):
    if not cluster:
        return []
    same_work = find_queue_item(queue, cluster["work_id"])
    if same_work and same_work.get("status") == "done":
        return []

    previous_done = find_queue_item_by_cluster(queue, cluster["cluster_id"])
    if (
        previous_done
        and previous_done.get("status") == "done"
        and previous_done.get("work_id") != cluster["work_id"]
    ):
        cluster["followup_of"] = previous_done.get("work_id")

    existing = same_work or find_queue_item_by_cluster(
        queue,
        cluster["cluster_id"],
        include_done=False,
    )
    if existing:
        created_at = existing.get("created_at") or cluster.get("created_at")
        work_id = existing.get("work_id")
        existing.update({key: value for key, value in cluster.items() if key != "work_id"})
        existing["work_id"] = work_id
        existing["created_at"] = created_at
        existing["status"] = "pending"
        existing["updated_at"] = iso_now()
        item = existing
        added = []
    else:
        queue.setdefault("items", []).append(cluster)
        item = cluster
        added = [cluster["work_id"]]

    for ledger_key in item.get("ledger_refs", []):
        entry = ledger.setdefault("entries", {}).get(ledger_key)
        if entry:
            entry["implementation_enqueued_at"] = iso_now()
            entry["implementation_work_id"] = item["work_id"]
    return added


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
            "mode": "evidence_cluster_worker",
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
        for artifact_hash in item.get("artifact_hashes") or []:
            if artifact_hash:
                artifact_hashes.add(artifact_hash)
        scope_key = item.get("scope_dedupe_key") or item.get("scope_key")
        if scope_key:
            scope_keys.add(scope_key)
        for covered_scope in item.get("scope_keys") or []:
            if covered_scope:
                scope_keys.add(covered_scope)
    return artifact_hashes, scope_keys


def find_queue_item_by_cluster(queue: dict, cluster_id: str, *, include_done=True):
    for item in reversed(queue.get("items", [])):
        if item.get("cluster_id") == cluster_id:
            if not include_done and item.get("status") == "done":
                continue
            return item
    return None


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
        if item.get("work_type") == "evidence_cluster":
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


def mark_blocked_for_recapture(item: dict, requests: dict, reason: str):
    capture = {
        "latest_run_id": item.get("source_capture_run_id") or item.get("capture_run_id"),
        "latest_artifact_hash": item.get("artifact_hash"),
    }
    quality = {"status": "invalid", "reasons": [reason]}
    upsert_recapture_request(
        requests,
        scope_key=item.get("scope_key"),
        capture=capture,
        quality=quality,
        cluster_id=item.get("cluster_id"),
    )
    item["status"] = "blocked_needs_recapture"
    item["blocker"] = reason
    item["updated_at"] = iso_now()


def migrate_existing_page_items(state: dict, queue: dict, requests: dict):
    changed = False
    active_work_id = state.get("active_work_id")
    for item in queue.get("items", []):
        scope_key = item.get("scope_key")
        if item.get("status") == "done":
            continue
        if scope_key in {"my-issues", "cycles:list"}:
            mark_blocked_for_recapture(
                item,
                requests,
                "capture_bundle_missing_page_or_elements_or_not_found",
            )
            if active_work_id == item.get("work_id"):
                state["active_work_id"] = None
            changed = True
            continue
        if scope_key in TEAM_ISSUES_SCOPE_ORDER:
            item["status"] = "superseded"
            item["superseded_by"] = TEAM_ISSUES_CLUSTER_ID
            item["updated_at"] = iso_now()
            if active_work_id == item.get("work_id"):
                state["active_work_id"] = None
            changed = True
    return changed


def load_successful_captures_by_scope():
    captures = {}
    for capture in successful_capture_backlog():
        scope_key = capture.get("latest_capture_scope")
        if not scope_key:
            continue
        captures[scope_key] = capture
    return captures


def enqueue_evidence_clusters(queue: dict, ledger: dict, requests: dict):
    added = []
    captures_by_scope = load_successful_captures_by_scope()
    quality_by_scope = {}
    for scope, capture in captures_by_scope.items():
        capture_paths = load_capture_paths(capture)
        quality = capture_evidence_quality(capture_paths)
        quality_by_scope[scope] = quality
        if quality.get("status") != "valid":
            upsert_recapture_request(requests, scope_key=scope, capture=capture, quality=quality)
        else:
            resolve_recapture_request(
                requests,
                scope_key=scope,
                artifact_hash=capture.get("latest_artifact_hash"),
            )

    cluster = build_team_issues_cluster(captures_by_scope, quality_by_scope)
    if cluster:
        same_work = find_queue_item(queue, cluster["work_id"])
        if not (same_work and same_work.get("status") == "done"):
            previous_done = find_queue_item_by_cluster(queue, TEAM_ISSUES_CLUSTER_ID)
            if (
                previous_done
                and previous_done.get("status") == "done"
                and previous_done.get("work_id") != cluster["work_id"]
            ):
                cluster["followup_of"] = previous_done.get("work_id")
                cluster["implementation_slice"] = {
                    **cluster["implementation_slice"],
                    "name": "team issues list newly recaptured scope parity",
                    "expected_change": (
                        "50-300 lines focused on newly valid recaptured scopes plus shared team issue list feedback"
                    ),
                }

            existing = same_work or find_queue_item_by_cluster(
                queue,
                TEAM_ISSUES_CLUSTER_ID,
                include_done=False,
            )
            if existing and existing.get("status") != "done":
                existing.update(
                    {
                        "work_type": cluster["work_type"],
                        "scope_keys": cluster["scope_keys"],
                        "capture_run_ids": cluster["capture_run_ids"],
                        "artifact_hash": cluster["artifact_hash"],
                        "artifact_hashes": cluster["artifact_hashes"],
                        "goal": cluster["goal"],
                        "candidate_changes": cluster["candidate_changes"],
                        "implementation_slice": cluster["implementation_slice"],
                        "line_budget": cluster["line_budget"],
                        "evidence_quality": cluster["evidence_quality"],
                        "blocked_scope_keys": cluster["blocked_scope_keys"],
                        "evidence_refs": cluster["evidence_refs"],
                        "acceptance_checks": cluster["acceptance_checks"],
                        "source_paths": cluster["source_paths"],
                        "milestone_summary": cluster["milestone_summary"],
                        "status": "pending",
                        "updated_at": iso_now(),
                    }
                )
                item = existing
            elif not existing:
                queue.setdefault("items", []).append(cluster)
                item = cluster
                added.append(cluster["work_id"])
            else:
                item = existing

            for scope in item.get("scope_keys", []):
                entry = ledger.setdefault("entries", {}).get(f"page:{scope}")
                if entry:
                    entry["implementation_enqueued_at"] = iso_now()
                    entry["implementation_work_id"] = item["work_id"]

    added.extend(
        enqueue_cluster_item(
            queue,
            ledger,
            build_settings_configuration_cluster(captures_by_scope, quality_by_scope),
        )
    )
    added.extend(
        enqueue_cluster_item(
            queue,
            ledger,
            build_issue_create_flow_cluster(captures_by_scope, quality_by_scope),
        )
    )
    return added


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
    if item.get("status") in {
        "done",
        "blocked",
        "blocked_needs_recapture",
        "terminal_blocked",
        "superseded",
    }:
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


def emit_blocked_needs_recapture(state_path: Path, queue_path: Path, queue: dict, requests: dict):
    pending_requests = [request for request in requests.get("requests", []) if request.get("status") == "pending"]
    latest_path = save_latest(
        {
            "status": "blocked_needs_recapture",
            "reason": "no_executable_cluster_work",
            "recapture_requests": pending_requests,
            "state_path": relative_to_repo(state_path),
            "queue_path": relative_to_repo(queue_path),
            "recapture_requests_path": relative_to_repo(RECAPTURE_REQUESTS_PATH),
            "queue_counts": queue_counts(queue),
        }
    )
    print(
        json.dumps(
            {
                "status": "blocked_needs_recapture",
                "reason": "no_executable_cluster_work",
                "recapture_requests_path": relative_to_repo(RECAPTURE_REQUESTS_PATH),
                "latest_work_path": relative_to_repo(latest_path),
                "queue_counts": queue_counts(queue),
                "recapture_request_count": len(pending_requests),
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
    requests = load_recapture_requests()
    if state.get("mode") != "evidence_cluster_worker":
        state["mode"] = "evidence_cluster_worker"
    ledger_changed = reconcile_ledger_enqueued_from_queue(queue, ledger)
    if prune_non_actionable_items(state, queue):
        save_state(state, state_path)
        save_queue(queue, queue_path)
    migrated = migrate_existing_page_items(state, queue, requests)
    backlog_added = enqueue_evidence_clusters(queue, ledger, requests)
    backlog_added.extend(enqueue_missing_capture_backlog(queue, ledger))
    if backlog_added or ledger_changed or migrated:
        save_queue(queue, queue_path)
        save_state(state, state_path)
        json_dump(CAPTURE_LEDGER_PATH, ledger)
        save_recapture_requests(requests)

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

    if any(request.get("status") == "pending" for request in requests.get("requests", [])):
        return emit_blocked_needs_recapture(state_path, queue_path, queue, requests)

    return emit_no_work("no_executable_cluster_work", state_path, queue_path, queue=queue, latest_capture=latest_capture, backlog_added=backlog_added)


if __name__ == "__main__":
    raise SystemExit(main())
