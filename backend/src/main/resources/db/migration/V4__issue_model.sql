-- Cruise Database Schema V4
-- Unified issue model

CREATE TABLE IF NOT EXISTS issue (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    identifier VARCHAR(50) NOT NULL UNIQUE,
    type VARCHAR(30) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(4000),
    state VARCHAR(50) NOT NULL,
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
    source_type VARCHAR(30) NOT NULL,
    source_id BIGINT,
    legacy_payload VARCHAR(4000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS legacy_issue_mapping (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    source_type VARCHAR(30) NOT NULL,
    source_id BIGINT NOT NULL,
    issue_id BIGINT NOT NULL,
    CONSTRAINT uk_legacy_issue_mapping UNIQUE (source_type, source_id)
);
