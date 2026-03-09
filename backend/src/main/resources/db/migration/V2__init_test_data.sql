-- Cruise Test Data Initialization
-- Phase 1: Acceptance test data

-- Insert test project
INSERT INTO project (id, name, description, status, start_date, end_date)
VALUES (1, '测试项目', '用于验收测试的项目', 'ACTIVE', CURRENT_DATE, NULL);

-- Insert test team member
INSERT INTO team_member (id, name, email, role, skills, team_id)
VALUES (1, '张三', 'zhangsan@example.com', 'DEVELOPER', 'Java,Kotlin', 1);
