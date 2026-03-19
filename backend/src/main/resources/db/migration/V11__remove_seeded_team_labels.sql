DELETE FROM issue_label
WHERE label_id IN (
    SELECT id
    FROM label_definition
    WHERE scope_type = 'TEAM'
      AND name_normalized IN ('auth', 'platform', 'migration')
);

DELETE FROM label_definition
WHERE scope_type = 'TEAM'
  AND name_normalized IN ('auth', 'platform', 'migration');
