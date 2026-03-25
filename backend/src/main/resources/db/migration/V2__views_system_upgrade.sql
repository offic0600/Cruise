ALTER TABLE saved_view ADD COLUMN IF NOT EXISTS resource_type VARCHAR(30) NOT NULL DEFAULT 'ISSUE';
ALTER TABLE saved_view ADD COLUMN IF NOT EXISTS scope_type VARCHAR(30) NOT NULL DEFAULT 'WORKSPACE';
ALTER TABLE saved_view ADD COLUMN IF NOT EXISTS scope_id BIGINT;
ALTER TABLE saved_view ADD COLUMN IF NOT EXISTS owner_user_id BIGINT;
ALTER TABLE saved_view ADD COLUMN IF NOT EXISTS system_key VARCHAR(64);
ALTER TABLE saved_view ADD COLUMN IF NOT EXISTS query_state CLOB;
ALTER TABLE saved_view ADD COLUMN IF NOT EXISTS position INT NOT NULL DEFAULT 0;
ALTER TABLE saved_view ADD COLUMN IF NOT EXISTS layout VARCHAR(20) NOT NULL DEFAULT 'LIST';
ALTER TABLE saved_view ADD COLUMN IF NOT EXISTS icon VARCHAR(120);
ALTER TABLE saved_view ADD COLUMN IF NOT EXISTS color VARCHAR(32);
ALTER TABLE saved_view ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP;

UPDATE saved_view
SET resource_type = 'ISSUE'
WHERE resource_type IS NULL;

UPDATE saved_view
SET scope_type = CASE
    WHEN project_id IS NOT NULL THEN 'PROJECT'
    WHEN team_id IS NOT NULL THEN 'TEAM'
    ELSE 'WORKSPACE'
END
WHERE scope_type IS NULL OR scope_type = '';

UPDATE saved_view
SET scope_id = CASE
    WHEN project_id IS NOT NULL THEN project_id
    WHEN team_id IS NOT NULL THEN team_id
    ELSE NULL
END
WHERE scope_id IS NULL;

CREATE TABLE IF NOT EXISTS view_favorite (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    view_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_view_favorite UNIQUE (view_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_view_resource_scope
    ON saved_view (organization_id, resource_type, scope_type, scope_id, archived_at);
CREATE INDEX IF NOT EXISTS idx_saved_view_owner
    ON saved_view (owner_user_id, visibility, archived_at);
CREATE INDEX IF NOT EXISTS idx_saved_view_system
    ON saved_view (organization_id, resource_type, is_system, system_key);
CREATE INDEX IF NOT EXISTS idx_view_favorite_user
    ON view_favorite (user_id, view_id);
