-- Cruise Database Schema V3
-- Extended Task fields
-- Database: H2 (embedded)

-- Add new columns to task table
ALTER TABLE task ADD COLUMN IF NOT EXISTS progress INT DEFAULT 0;
ALTER TABLE task ADD COLUMN IF NOT EXISTS team_id BIGINT;
ALTER TABLE task ADD COLUMN IF NOT EXISTS planned_start_date DATE;
ALTER TABLE task ADD COLUMN IF NOT EXISTS planned_end_date DATE;
ALTER TABLE task ADD COLUMN IF NOT EXISTS estimated_days FLOAT;
ALTER TABLE task ADD COLUMN IF NOT EXISTS planned_days FLOAT;
ALTER TABLE task ADD COLUMN IF NOT EXISTS remaining_days FLOAT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_task_team_id ON task(team_id);
