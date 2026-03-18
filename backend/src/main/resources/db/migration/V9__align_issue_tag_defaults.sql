UPDATE issue_tag
SET name = 'Bug', color = '#EF4444', sort_order = 1
WHERE name = 'platform';

UPDATE issue_tag
SET name = 'Feature', color = '#A855F7', sort_order = 2
WHERE name = 'auth';

UPDATE issue_tag
SET name = 'Improvement', color = '#3B82F6', sort_order = 3
WHERE name = 'migration';
