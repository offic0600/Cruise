-- Cruise baseline schema
-- This file replaces the previous incremental migration chain.
-- Legacy requirement/task/defect tables and legacy payload columns are intentionally omitted.
-- Sample workspace data is seeded by DataInitializer at application startup, not by SQL migrations.

CREATE TABLE IF NOT EXISTS app_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL,
    display_name VARCHAR(100),
    avatar_url VARCHAR(500),
    role VARCHAR(50) DEFAULT 'USER',
    status VARCHAR(30) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS organization (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS team (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    team_key VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    default_workflow_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS membership (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    team_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'MEMBER',
    title VARCHAR(50),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS team_member (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    role VARCHAR(50) DEFAULT 'DEVELOPER',
    skills VARCHAR(500),
    team_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workflow (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    team_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    applies_to_type VARCHAR(20) NOT NULL DEFAULT 'ALL',
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workflow_state (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    workflow_id BIGINT NOT NULL,
    state_key VARCHAR(50) NOT NULL,
    label VARCHAR(100) NOT NULL,
    category VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS workflow_transition (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    workflow_id BIGINT NOT NULL,
    from_state_key VARCHAR(50) NOT NULL,
    to_state_key VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS project (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    team_id BIGINT,
    project_key VARCHAR(30) UNIQUE,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    owner_id BIGINT,
    start_date DATE,
    target_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    archived_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_status (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(32),
    type VARCHAR(30) NOT NULL DEFAULT 'active',
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    archived_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_milestone (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    target_date DATE,
    status VARCHAR(30) DEFAULT 'planned',
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    archived_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_update (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    body VARCHAR(4000),
    health VARCHAR(30),
    user_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    archived_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cycle (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    team_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    number INT NOT NULL DEFAULT 1,
    starts_at DATE,
    ends_at DATE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    archived_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS initiative (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    parent_initiative_id BIGINT,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    slug_id VARCHAR(64),
    status VARCHAR(30) NOT NULL DEFAULT 'planned',
    health VARCHAR(30),
    owner_id BIGINT,
    creator_id BIGINT,
    target_date DATE,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    archived_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS initiative_relation (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    initiative_id BIGINT NOT NULL,
    related_initiative_id BIGINT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    archived_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS initiative_to_project (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    initiative_id BIGINT NOT NULL,
    project_id BIGINT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    archived_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS initiative_update (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    initiative_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    body VARCHAR(4000),
    health VARCHAR(30),
    user_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    archived_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roadmap (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    color VARCHAR(32),
    slug_id VARCHAR(64),
    sort_order INT NOT NULL DEFAULT 0,
    owner_id BIGINT,
    creator_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    archived_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roadmap_to_project (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    roadmap_id BIGINT NOT NULL,
    project_id BIGINT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    archived_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customer_status (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(32),
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    archived_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customer_tier (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(32),
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    archived_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customer (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug_id VARCHAR(64),
    owner_id BIGINT,
    status_id BIGINT,
    tier_id BIGINT,
    integration_id BIGINT,
    domains VARCHAR(512),
    external_ids VARCHAR(1000),
    logo_url VARCHAR(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    archived_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customer_need (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    project_id BIGINT,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(4000),
    priority VARCHAR(30) NOT NULL DEFAULT 'medium',
    status VARCHAR(30) NOT NULL DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    archived_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS issue (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    identifier VARCHAR(50) NOT NULL UNIQUE,
    type VARCHAR(30) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(4000),
    state VARCHAR(50) NOT NULL,
    resolution VARCHAR(30),
    priority VARCHAR(20) NOT NULL,
    project_id BIGINT NOT NULL,
    team_id BIGINT,
    parent_issue_id BIGINT,
    assignee_id BIGINT,
    reporter_id BIGINT,
    estimate_points INT,
    progress INT DEFAULT 0,
    planned_start_date DATE,
    planned_end_date DATE,
    estimated_hours FLOAT DEFAULT 0,
    actual_hours FLOAT DEFAULT 0,
    severity VARCHAR(20),
    source_type VARCHAR(30) NOT NULL DEFAULT 'NATIVE',
    source_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    archived_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS issue_relation (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    from_issue_id BIGINT NOT NULL,
    to_issue_id BIGINT NOT NULL,
    relation_type VARCHAR(30) NOT NULL DEFAULT 'RELATES_TO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS issue_attachment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    issue_id BIGINT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    attachment_type VARCHAR(20) NOT NULL DEFAULT 'FILE',
    content_type VARCHAR(200),
    size BIGINT NOT NULL DEFAULT 0,
    storage_path VARCHAR(1000),
    external_url VARCHAR(1000),
    link_title VARCHAR(255),
    metadata_json VARCHAR(4000),
    uploaded_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS issue_template (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    team_id BIGINT,
    project_id BIGINT,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    description VARCHAR(4000),
    type VARCHAR(30) NOT NULL,
    state VARCHAR(50),
    priority VARCHAR(20),
    assignee_id BIGINT,
    estimate_points INT,
    planned_start_date DATE,
    planned_end_date DATE,
    custom_fields_json VARCHAR(4000),
    label_ids_json VARCHAR(4000),
    sub_issues_json VARCHAR(4000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS issue_draft (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    team_id BIGINT,
    project_id BIGINT,
    template_id BIGINT,
    title VARCHAR(255),
    description VARCHAR(4000),
    type VARCHAR(30) NOT NULL,
    state VARCHAR(50),
    priority VARCHAR(20),
    assignee_id BIGINT,
    parent_issue_id BIGINT,
    estimate_points INT,
    planned_start_date DATE,
    planned_end_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'SAVED_DRAFT',
    custom_fields_json VARCHAR(4000),
    label_ids_json VARCHAR(4000),
    attachments_pending_json VARCHAR(4000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recurring_issue_definition (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    team_id BIGINT,
    project_id BIGINT NOT NULL,
    template_id BIGINT,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    description VARCHAR(4000),
    type VARCHAR(30) NOT NULL,
    state VARCHAR(50),
    priority VARCHAR(20),
    assignee_id BIGINT,
    estimate_points INT,
    cadence_type VARCHAR(20) NOT NULL DEFAULT 'DAILY',
    cadence_interval INT NOT NULL DEFAULT 1,
    weekdays_csv VARCHAR(100),
    next_run_at TIMESTAMP NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    custom_fields_json VARCHAR(4000),
    label_ids_json VARCHAR(4000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS email_intake_config (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    team_id BIGINT,
    project_id BIGINT,
    template_id BIGINT,
    name VARCHAR(255) NOT NULL,
    email_address VARCHAR(255) NOT NULL UNIQUE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS email_intake_message (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    config_id BIGINT NOT NULL,
    source_message_id VARCHAR(255) NOT NULL,
    sender_email VARCHAR(255),
    subject VARCHAR(255),
    body VARCHAR(4000),
    attachments_json VARCHAR(4000),
    processed_issue_id BIGINT,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_email_intake_message UNIQUE (config_id, source_message_id)
);

CREATE TABLE IF NOT EXISTS saved_view (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    team_id BIGINT,
    project_id BIGINT,
    name VARCHAR(120) NOT NULL,
    description VARCHAR(500),
    filter_json CLOB,
    group_by VARCHAR(64),
    sort_json CLOB,
    visibility VARCHAR(32) NOT NULL DEFAULT 'WORKSPACE',
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS doc (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    team_id BIGINT,
    project_id BIGINT,
    issue_id BIGINT,
    initiative_id BIGINT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    author_id BIGINT NOT NULL,
    current_content_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    archived_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS document_content (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    document_id BIGINT NOT NULL,
    content VARCHAR(4000) NOT NULL,
    version_number INT NOT NULL DEFAULT 1,
    author_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS comment_entry (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    target_type VARCHAR(50) NOT NULL,
    target_id BIGINT NOT NULL,
    document_content_id BIGINT,
    parent_comment_id BIGINT,
    author_id BIGINT NOT NULL,
    body VARCHAR(4000) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    archived_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS issue_tag (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS label_definition (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    scope_type VARCHAR(20) NOT NULL,
    scope_id BIGINT,
    name VARCHAR(120) NOT NULL,
    name_normalized VARCHAR(120) NOT NULL,
    color VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
    description VARCHAR(500),
    sort_order INT NOT NULL DEFAULT 0,
    archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS issue_label (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    issue_id BIGINT NOT NULL,
    label_id BIGINT NOT NULL,
    applied_by BIGINT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_issue_label UNIQUE (issue_id, label_id)
);

CREATE TABLE IF NOT EXISTS custom_field_definition (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    entity_type VARCHAR(30) NOT NULL,
    scope_type VARCHAR(20) NOT NULL,
    scope_id BIGINT,
    field_key VARCHAR(80) NOT NULL,
    name VARCHAR(120) NOT NULL,
    description VARCHAR(1000),
    data_type VARCHAR(30) NOT NULL,
    required BOOLEAN NOT NULL DEFAULT FALSE,
    multiple BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    is_filterable BOOLEAN NOT NULL DEFAULT FALSE,
    is_sortable BOOLEAN NOT NULL DEFAULT FALSE,
    show_on_create BOOLEAN NOT NULL DEFAULT TRUE,
    show_on_detail BOOLEAN NOT NULL DEFAULT TRUE,
    show_on_list BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INT NOT NULL DEFAULT 0,
    config_json VARCHAR(4000),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_custom_field_definition UNIQUE (organization_id, entity_type, field_key)
);

CREATE TABLE IF NOT EXISTS custom_field_option (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    field_definition_id BIGINT NOT NULL,
    option_value VARCHAR(120) NOT NULL,
    label VARCHAR(120) NOT NULL,
    color VARCHAR(20),
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS custom_field_value (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    field_definition_id BIGINT NOT NULL,
    entity_type VARCHAR(30) NOT NULL,
    entity_id BIGINT NOT NULL,
    value_text VARCHAR(4000),
    value_number DOUBLE,
    value_boolean BOOLEAN,
    value_date DATE,
    value_datetime TIMESTAMP,
    value_json VARCHAR(4000),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_custom_field_value UNIQUE (field_definition_id, entity_type, entity_id)
);

CREATE TABLE IF NOT EXISTS import_field_mapping_template (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    entity_type VARCHAR(30) NOT NULL,
    name VARCHAR(120) NOT NULL,
    source_type VARCHAR(20) NOT NULL DEFAULT 'EXCEL',
    mapping_json VARCHAR(4000) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activity_event (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    actor_id BIGINT,
    entity_type VARCHAR(30) NOT NULL,
    entity_id BIGINT NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    summary VARCHAR(1000) NOT NULL,
    payload_json VARCHAR(4000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notification (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,
    actor_id BIGINT,
    type VARCHAR(30) NOT NULL DEFAULT 'SYSTEM',
    category VARCHAR(50) NOT NULL DEFAULT 'system',
    resource_type VARCHAR(50),
    resource_id BIGINT,
    title VARCHAR(255) NOT NULL,
    body VARCHAR(2000) NOT NULL,
    payload_json VARCHAR(4000),
    read_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    archived_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notification_subscription (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id BIGINT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    archived_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notification_preference (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category VARCHAR(50) NOT NULL,
    channel VARCHAR(50) NOT NULL DEFAULT 'in_app',
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agent_session (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL UNIQUE,
    user_id BIGINT,
    user_name VARCHAR(100),
    current_intent VARCHAR(100),
    context CLOB,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    message_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agent_activity (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    agent_session_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'message',
    content CLOB,
    issue_id BIGINT,
    comment_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS external_entity_info (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    service VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT NOT NULL,
    external_id VARCHAR(255) NOT NULL,
    external_url VARCHAR(1000),
    metadata_json VARCHAR(4000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS external_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    service VARCHAR(50) NOT NULL,
    external_id VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    avatar_url VARCHAR(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS entity_external_link (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    url VARCHAR(1000) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reaction (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    issue_id BIGINT,
    comment_id BIGINT,
    project_update_id BIGINT,
    initiative_update_id BIGINT,
    emoji VARCHAR(64) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_membership_team_user ON membership (team_id, user_id);
CREATE INDEX IF NOT EXISTS idx_project_org_team ON project (organization_id, team_id);
CREATE INDEX IF NOT EXISTS idx_issue_project_team ON issue (project_id, team_id);
CREATE INDEX IF NOT EXISTS idx_issue_parent ON issue (parent_issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_relation_from_issue ON issue_relation (from_issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_relation_to_issue ON issue_relation (to_issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_attachment_issue ON issue_attachment (issue_id);
CREATE INDEX IF NOT EXISTS idx_saved_view_scope ON saved_view (organization_id, team_id, project_id);
CREATE INDEX IF NOT EXISTS idx_label_definition_scope ON label_definition (organization_id, scope_type, scope_id, archived, sort_order);
CREATE INDEX IF NOT EXISTS idx_issue_label_issue ON issue_label (issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_label_label ON issue_label (label_id);
CREATE INDEX IF NOT EXISTS idx_custom_field_option_definition ON custom_field_option (field_definition_id);
CREATE INDEX IF NOT EXISTS idx_custom_field_value_entity ON custom_field_value (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_doc_scope ON doc (organization_id, team_id, project_id, issue_id, initiative_id);
CREATE INDEX IF NOT EXISTS idx_comment_target ON comment_entry (target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_project_update_project ON project_update (project_id);
CREATE INDEX IF NOT EXISTS idx_initiative_project_link ON initiative_to_project (initiative_id, project_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_project_link ON roadmap_to_project (roadmap_id, project_id);
CREATE INDEX IF NOT EXISTS idx_customer_need_customer ON customer_need (customer_id);
CREATE INDEX IF NOT EXISTS idx_notification_user_created ON notification (user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_notification_subscription_target ON notification_subscription (resource_type, resource_id, user_id);
CREATE INDEX IF NOT EXISTS idx_external_entity_lookup ON external_entity_info (service, entity_type, entity_id);
