ALTER TABLE issue
    ALTER COLUMN legacy_payload SET DEFAULT NULL;

ALTER TABLE issue_draft
    ALTER COLUMN legacy_payload SET DEFAULT NULL;

ALTER TABLE issue_template
    ALTER COLUMN legacy_payload SET DEFAULT NULL;

ALTER TABLE recurring_issue_definition
    ALTER COLUMN legacy_payload SET DEFAULT NULL;

DROP TABLE IF EXISTS issue_application_link;
DROP TABLE IF EXISTS issue_delivery_plan;
DROP TABLE IF EXISTS issue_extension_payload;
DROP TABLE IF EXISTS issue_feature_extension;
DROP TABLE IF EXISTS issue_vendor_assignment;
