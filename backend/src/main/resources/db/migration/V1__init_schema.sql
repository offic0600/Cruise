-- Cruise Database Schema Initialization
-- Phase 0: Core data model
-- Database: H2 (embedded)

-- User table
CREATE TABLE IF NOT EXISTS app_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project table
CREATE TABLE IF NOT EXISTS project (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Requirement table
CREATE TABLE IF NOT EXISTS requirement (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'NEW',
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    project_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Task table
CREATE TABLE IF NOT EXISTS task (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',
    requirement_id BIGINT NOT NULL,
    assignee_id BIGINT,
    estimated_hours FLOAT DEFAULT 0,
    actual_hours FLOAT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team Member table
CREATE TABLE IF NOT EXISTS team_member (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    role VARCHAR(50) DEFAULT 'DEVELOPER',
    skills TEXT,
    team_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Defect table
CREATE TABLE IF NOT EXISTS defect (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(20) DEFAULT 'MEDIUM',
    status VARCHAR(50) DEFAULT 'OPEN',
    project_id BIGINT NOT NULL,
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