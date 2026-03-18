ALTER TABLE issue_attachment
    ADD COLUMN IF NOT EXISTS attachment_type VARCHAR(20) DEFAULT 'FILE' NOT NULL;

ALTER TABLE issue_attachment
    ADD COLUMN IF NOT EXISTS external_url VARCHAR(1000);

ALTER TABLE issue_attachment
    ADD COLUMN IF NOT EXISTS link_title VARCHAR(255);

ALTER TABLE issue_attachment
    ADD COLUMN IF NOT EXISTS metadata_json VARCHAR(4000);

ALTER TABLE issue_attachment
    ALTER COLUMN storage_path DROP NOT NULL;

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
    legacy_payload VARCHAR(4000),
    custom_fields_json VARCHAR(4000),
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
    status VARCHAR(30) NOT NULL,
    legacy_payload VARCHAR(4000),
    custom_fields_json VARCHAR(4000),
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
    cadence_type VARCHAR(20) NOT NULL,
    cadence_interval INT NOT NULL DEFAULT 1,
    weekdays_csv VARCHAR(100),
    next_run_at TIMESTAMP NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    legacy_payload VARCHAR(4000),
    custom_fields_json VARCHAR(4000),
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
