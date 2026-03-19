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

CREATE INDEX IF NOT EXISTS idx_label_definition_scope
    ON label_definition (organization_id, scope_type, scope_id, archived, sort_order);

CREATE INDEX IF NOT EXISTS idx_label_definition_name
    ON label_definition (organization_id, name_normalized);

CREATE TABLE IF NOT EXISTS issue_label (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    issue_id BIGINT NOT NULL,
    label_id BIGINT NOT NULL,
    applied_by BIGINT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_issue_label UNIQUE (issue_id, label_id)
);

CREATE INDEX IF NOT EXISTS idx_issue_label_issue_id ON issue_label (issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_label_label_id ON issue_label (label_id);

ALTER TABLE issue_template ADD COLUMN IF NOT EXISTS label_ids_json VARCHAR(4000);
ALTER TABLE issue_draft ADD COLUMN IF NOT EXISTS label_ids_json VARCHAR(4000);
ALTER TABLE recurring_issue_definition ADD COLUMN IF NOT EXISTS label_ids_json VARCHAR(4000);

INSERT INTO label_definition (
    organization_id,
    scope_type,
    scope_id,
    name,
    name_normalized,
    color,
    description,
    sort_order,
    archived,
    created_by,
    created_at,
    updated_at
)
SELECT
    1,
    'WORKSPACE',
    NULL,
    t.name,
    LOWER(TRIM(t.name)),
    COALESCE(t.color, '#3B82F6'),
    NULL,
    COALESCE(t.sort_order, 0),
    FALSE,
    NULL,
    COALESCE(t.created_at, CURRENT_TIMESTAMP),
    COALESCE(t.created_at, CURRENT_TIMESTAMP)
FROM issue_tag t
WHERE NOT EXISTS (
    SELECT 1
    FROM label_definition l
    WHERE l.organization_id = 1
      AND l.scope_type = 'WORKSPACE'
      AND l.name_normalized = LOWER(TRIM(t.name))
);
