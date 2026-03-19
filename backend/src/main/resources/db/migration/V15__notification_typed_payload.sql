ALTER TABLE notification ADD COLUMN IF NOT EXISTS actor_id BIGINT;
ALTER TABLE notification ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'system';
ALTER TABLE notification ADD COLUMN IF NOT EXISTS resource_type VARCHAR(50);
ALTER TABLE notification ADD COLUMN IF NOT EXISTS resource_id BIGINT;
ALTER TABLE notification ADD COLUMN IF NOT EXISTS payload_json VARCHAR(4000);
ALTER TABLE notification ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE notification ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP;

UPDATE notification
SET category = COALESCE(category, LOWER(type), 'system')
WHERE category IS NULL OR category = '';
