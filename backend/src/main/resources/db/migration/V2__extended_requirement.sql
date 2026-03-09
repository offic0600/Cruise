-- Cruise Database Schema V2
-- Phase 1: Extended Requirement fields + Requirement Tag table
-- Database: H2 (embedded)

-- Requirement Tag table
CREATE TABLE IF NOT EXISTS requirement_tag (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add new columns to requirement table
ALTER TABLE requirement ADD COLUMN IF NOT EXISTS team_id BIGINT;
ALTER TABLE requirement ADD COLUMN IF NOT EXISTS planned_start_date DATE;
ALTER TABLE requirement ADD COLUMN IF NOT EXISTS expected_delivery_date DATE;
ALTER TABLE requirement ADD COLUMN IF NOT EXISTS requirement_owner_id BIGINT;
ALTER TABLE requirement ADD COLUMN IF NOT EXISTS product_owner_id BIGINT;
ALTER TABLE requirement ADD COLUMN IF NOT EXISTS dev_owner_id BIGINT;
ALTER TABLE requirement ADD COLUMN IF NOT EXISTS dev_participants VARCHAR(500);
ALTER TABLE requirement ADD COLUMN IF NOT EXISTS test_owner_id BIGINT;
ALTER TABLE requirement ADD COLUMN IF NOT EXISTS progress INT DEFAULT 0;
ALTER TABLE requirement ADD COLUMN IF NOT EXISTS tags VARCHAR(500);
ALTER TABLE requirement ADD COLUMN IF NOT EXISTS estimated_days FLOAT;
ALTER TABLE requirement ADD COLUMN IF NOT EXISTS planned_days FLOAT;
ALTER TABLE requirement ADD COLUMN IF NOT EXISTS gap_days FLOAT;
ALTER TABLE requirement ADD COLUMN IF NOT EXISTS gap_budget FLOAT;
ALTER TABLE requirement ADD COLUMN IF NOT EXISTS actual_days FLOAT;
ALTER TABLE requirement ADD COLUMN IF NOT EXISTS application_codes VARCHAR(500);
ALTER TABLE requirement ADD COLUMN IF NOT EXISTS vendors VARCHAR(500);
ALTER TABLE requirement ADD COLUMN IF NOT EXISTS vendor_staff VARCHAR(500);
ALTER TABLE requirement ADD COLUMN IF NOT EXISTS created_by VARCHAR(100);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_requirement_team_id ON requirement(team_id);
CREATE INDEX IF NOT EXISTS idx_requirement_owner_id ON requirement(requirement_owner_id);
CREATE INDEX IF NOT EXISTS idx_requirement_dev_owner_id ON requirement(dev_owner_id);
CREATE INDEX IF NOT EXISTS idx_requirement_test_owner_id ON requirement(test_owner_id);
