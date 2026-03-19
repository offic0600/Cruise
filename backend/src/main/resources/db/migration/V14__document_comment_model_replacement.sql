ALTER TABLE doc ADD COLUMN IF NOT EXISTS initiative_id BIGINT;
ALTER TABLE doc ADD COLUMN IF NOT EXISTS current_content_id BIGINT;
ALTER TABLE doc ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP;

ALTER TABLE document_content ADD COLUMN IF NOT EXISTS author_id BIGINT;

INSERT INTO document_content (document_id, content, version_number, author_id, created_at)
SELECT
    dr.doc_id,
    dr.content,
    dr.version_number,
    dr.author_id,
    dr.created_at
FROM doc_revision dr
WHERE NOT EXISTS (
    SELECT 1
    FROM document_content dc
    WHERE dc.document_id = dr.doc_id
      AND dc.version_number = dr.version_number
);

UPDATE doc d
SET current_content_id = (
    SELECT dc.id
    FROM document_content dc
    WHERE dc.document_id = d.id
    ORDER BY dc.version_number DESC, dc.id DESC
    LIMIT 1
)
WHERE d.current_content_id IS NULL;

ALTER TABLE comment_entry ADD COLUMN IF NOT EXISTS target_type VARCHAR(50);
ALTER TABLE comment_entry ADD COLUMN IF NOT EXISTS target_id BIGINT;
ALTER TABLE comment_entry ADD COLUMN IF NOT EXISTS document_content_id BIGINT;
ALTER TABLE comment_entry ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP;

UPDATE comment_entry
SET target_type = 'ISSUE',
    target_id = issue_id
WHERE target_type IS NULL AND issue_id IS NOT NULL;

UPDATE comment_entry
SET target_type = 'DOCUMENT',
    target_id = doc_id
WHERE target_type IS NULL AND doc_id IS NOT NULL;

UPDATE comment_entry ce
SET document_content_id = (
    SELECT d.current_content_id
    FROM doc d
    WHERE d.id = ce.doc_id
)
WHERE ce.document_content_id IS NULL
  AND ce.doc_id IS NOT NULL;

ALTER TABLE comment_entry ALTER COLUMN target_type SET NOT NULL;
ALTER TABLE comment_entry ALTER COLUMN target_id SET NOT NULL;
