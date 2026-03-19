ALTER TABLE issue
    DROP COLUMN IF EXISTS legacy_payload;

ALTER TABLE issue_draft
    DROP COLUMN IF EXISTS legacy_payload;

ALTER TABLE issue_template
    DROP COLUMN IF EXISTS legacy_payload;

ALTER TABLE recurring_issue_definition
    DROP COLUMN IF EXISTS legacy_payload;

DROP TABLE IF EXISTS legacy_issue_mapping;
DROP TABLE IF EXISTS requirement_tag;
DROP TABLE IF EXISTS defect;
DROP TABLE IF EXISTS task;
DROP TABLE IF EXISTS requirement;
