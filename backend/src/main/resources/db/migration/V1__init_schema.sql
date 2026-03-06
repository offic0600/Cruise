-- Cruise Database Schema Initialization
-- Phase 0: Core data model

-- Project table
CREATE TABLE IF NOT EXISTS project (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Requirement table
CREATE TABLE IF NOT EXISTS requirement (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'NEW',
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    project_id BIGINT NOT NULL REFERENCES project(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Task table
CREATE TABLE IF NOT EXISTS task (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',
    requirement_id BIGINT NOT NULL REFERENCES requirement(id),
    assignee_id BIGINT,
    estimated_hours FLOAT DEFAULT 0,
    actual_hours FLOAT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team Member table
CREATE TABLE IF NOT EXISTS team_member (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    role VARCHAR(50) DEFAULT 'DEVELOPER',
    skills TEXT,
    team_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Defect table
CREATE TABLE IF NOT EXISTS defect (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(20) DEFAULT 'MEDIUM',
    status VARCHAR(50) DEFAULT 'OPEN',
    project_id BIGINT NOT NULL REFERENCES project(id),
    task_id BIGINT,
    reporter_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_requirement_project_id ON requirement(project_id);
CREATE INDEX idx_task_requirement_id ON task(requirement_id);
CREATE INDEX idx_task_assignee_id ON task(assignee_id);
CREATE INDEX idx_defect_project_id ON defect(project_id);
CREATE INDEX idx_defect_task_id ON defect(task_id);