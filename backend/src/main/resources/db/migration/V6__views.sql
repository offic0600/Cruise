CREATE TABLE IF NOT EXISTS saved_view (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    team_id BIGINT NULL,
    project_id BIGINT NULL,
    name VARCHAR(120) NOT NULL,
    description VARCHAR(500) NULL,
    filter_json TEXT NULL,
    group_by VARCHAR(64) NULL,
    sort_json TEXT NULL,
    visibility VARCHAR(32) NOT NULL,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
