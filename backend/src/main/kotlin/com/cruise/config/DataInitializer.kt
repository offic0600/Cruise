package com.cruise.config

import com.cruise.entity.Issue
import com.cruise.entity.IssueTag
import com.cruise.entity.Project
import com.cruise.entity.TeamMember
import com.cruise.entity.User
import com.cruise.repository.IssueRepository
import com.cruise.repository.IssueTagRepository
import com.cruise.repository.ProjectRepository
import com.cruise.repository.TeamMemberRepository
import com.cruise.repository.UserRepository
import org.springframework.boot.CommandLineRunner
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.core.annotation.Order
import org.springframework.security.crypto.password.PasswordEncoder
import java.time.LocalDate

@Configuration
open class DataInitializer {

    @Bean
    @Order(10)
    open fun initData(
        projectRepository: ProjectRepository,
        userRepository: UserRepository,
        teamMemberRepository: TeamMemberRepository,
        issueTagRepository: IssueTagRepository,
        issueRepository: IssueRepository,
        passwordEncoder: PasswordEncoder
    ): CommandLineRunner {
        return CommandLineRunner {
            if (projectRepository.count() == 0L) {
                projectRepository.save(
                    Project(
                        name = "Cruise RnD Workspace",
                        description = "Unified work tracking and analytics workspace",
                        status = "ACTIVE"
                    )
                )
            }

            if (userRepository.count() == 0L) {
                userRepository.save(
                    User(
                        username = "admin",
                        password = passwordEncoder.encode("admin123"),
                        email = "admin@cruise.com",
                        role = "ADMIN"
                    )
                )
            }

            if (teamMemberRepository.count() == 0L) {
                listOf(
                    TeamMember(name = "Zhang San", email = "zhangsan@cruise.com", role = "PM", skills = "product,planning", teamId = 1),
                    TeamMember(name = "Li Si", email = "lisi@cruise.com", role = "LEAD", skills = "architecture,kotlin,spring", teamId = 1),
                    TeamMember(name = "Wang Wu", email = "wangwu@cruise.com", role = "DEVELOPER", skills = "react,nextjs,typescript", teamId = 1),
                    TeamMember(name = "Zhao Liu", email = "zhaoliu@cruise.com", role = "DEVELOPER", skills = "kotlin,postgresql,docker", teamId = 1),
                    TeamMember(name = "Qian Qi", email = "qianqi@cruise.com", role = "TESTER", skills = "automation,jmeter,selenium", teamId = 1),
                    TeamMember(name = "Sun Ba", email = "sunba@cruise.com", role = "ARCHITECT", skills = "systems,devops", teamId = 1)
                ).forEach(teamMemberRepository::save)
            }

            if (issueTagRepository.count() == 0L) {
                listOf(
                    IssueTag(name = "Feature", color = "#3B82F6", sortOrder = 1),
                    IssueTag(name = "Bugfix", color = "#EF4444", sortOrder = 2),
                    IssueTag(name = "Performance", color = "#F59E0B", sortOrder = 3),
                    IssueTag(name = "Security", color = "#8B5CF6", sortOrder = 4),
                    IssueTag(name = "UX", color = "#10B981", sortOrder = 5),
                    IssueTag(name = "Tech Debt", color = "#6B7280", sortOrder = 6)
                ).forEach(issueTagRepository::save)
            }

            if (issueRepository.count() == 0L) {
                val feature1 = issueRepository.save(
                    Issue(
                        identifier = "ISSUE-1",
                        type = "FEATURE",
                        title = "Complete authentication flow",
                        description = "Unify login, registration, token refresh, and permission checks.",
                        state = "IN_PROGRESS",
                        priority = "HIGH",
                        projectId = 1,
                        teamId = 1,
                        assigneeId = 1,
                        progress = 60,
                        plannedStartDate = LocalDate.of(2026, 3, 1),
                        plannedEndDate = LocalDate.of(2026, 3, 15),
                        sourceType = "NATIVE",
                        legacyPayload = """{"productOwnerId":1,"devOwnerId":2,"devParticipants":"Zhang San,Li Si","testOwnerId":5,"tags":"Feature","estimatedDays":10,"plannedDays":8,"gapDays":0,"gapBudget":0,"actualDays":5,"applicationCodes":"cruise-auth","vendors":"","vendorStaff":"","createdBy":"admin"}"""
                    )
                )
                val feature2 = issueRepository.save(
                    Issue(
                        identifier = "ISSUE-2",
                        type = "FEATURE",
                        title = "Unify work item views",
                        description = "Move requirements, tasks, and defects onto a single Issue source of truth.",
                        state = "BACKLOG",
                        priority = "HIGH",
                        projectId = 1,
                        teamId = 1,
                        assigneeId = 1,
                        progress = 0,
                        plannedStartDate = LocalDate.of(2026, 3, 10),
                        plannedEndDate = LocalDate.of(2026, 3, 25),
                        sourceType = "NATIVE",
                        legacyPayload = """{"productOwnerId":1,"devOwnerId":3,"testOwnerId":5,"tags":"Feature","estimatedDays":12,"plannedDays":10,"gapDays":0,"gapBudget":0,"actualDays":0,"applicationCodes":"cruise-core","vendors":"","vendorStaff":"","createdBy":"admin"}"""
                    )
                )
                issueRepository.save(
                    Issue(
                        identifier = "ISSUE-3",
                        type = "FEATURE",
                        title = "Task collaboration workspace",
                        description = "Support task breakdown, assignment, progress tracking, and time logging.",
                        state = "BACKLOG",
                        priority = "MEDIUM",
                        projectId = 1,
                        teamId = 1,
                        assigneeId = 1,
                        progress = 0,
                        plannedStartDate = LocalDate.of(2026, 3, 15),
                        plannedEndDate = LocalDate.of(2026, 3, 30),
                        sourceType = "NATIVE",
                        legacyPayload = """{"productOwnerId":1,"devOwnerId":4,"testOwnerId":5,"tags":"Feature","estimatedDays":10,"plannedDays":8,"gapDays":0,"gapBudget":0,"actualDays":0,"applicationCodes":"cruise-core","vendors":"","vendorStaff":"","createdBy":"admin"}"""
                    )
                )
                issueRepository.save(
                    Issue(
                        identifier = "ISSUE-4",
                        type = "FEATURE",
                        title = "Project dashboard",
                        description = "Show unified issue metrics, team load, and project risk.",
                        state = "DONE",
                        priority = "MEDIUM",
                        projectId = 1,
                        teamId = 1,
                        assigneeId = 1,
                        progress = 100,
                        plannedStartDate = LocalDate.of(2026, 2, 20),
                        plannedEndDate = LocalDate.of(2026, 3, 5),
                        sourceType = "NATIVE",
                        legacyPayload = """{"productOwnerId":1,"devOwnerId":3,"testOwnerId":5,"tags":"Feature,UX","estimatedDays":8,"plannedDays":7,"gapDays":0,"gapBudget":0,"actualDays":7,"applicationCodes":"cruise-frontend","vendors":"","vendorStaff":"","createdBy":"admin"}"""
                    )
                )
                issueRepository.save(
                    Issue(
                        identifier = "ISSUE-5",
                        type = "FEATURE",
                        title = "Improve API performance",
                        description = "Identify slow endpoints and add caching where needed.",
                        state = "BACKLOG",
                        priority = "LOW",
                        projectId = 1,
                        teamId = 1,
                        assigneeId = 1,
                        progress = 0,
                        plannedStartDate = LocalDate.of(2026, 4, 1),
                        plannedEndDate = LocalDate.of(2026, 4, 15),
                        sourceType = "NATIVE",
                        legacyPayload = """{"productOwnerId":1,"devOwnerId":6,"testOwnerId":5,"tags":"Performance","estimatedDays":5,"plannedDays":4,"gapDays":0,"gapBudget":0,"actualDays":0,"applicationCodes":"cruise-api","vendors":"","vendorStaff":"","createdBy":"admin"}"""
                    )
                )

                issueRepository.save(
                    Issue(
                        identifier = "ISSUE-6",
                        type = "TASK",
                        title = "Design user table",
                        description = "Define username, password, email, and role constraints.",
                        state = "DONE",
                        priority = "MEDIUM",
                        projectId = 1,
                        teamId = 1,
                        parentIssueId = feature1.id,
                        assigneeId = 2,
                        progress = 100,
                        plannedStartDate = LocalDate.of(2026, 3, 1),
                        plannedEndDate = LocalDate.of(2026, 3, 2),
                        estimatedHours = 8f,
                        actualHours = 8f,
                        sourceType = "NATIVE",
                        legacyPayload = """{"estimatedDays":1,"plannedDays":1,"remainingDays":0}"""
                    )
                )
                issueRepository.save(
                    Issue(
                        identifier = "ISSUE-7",
                        type = "TASK",
                        title = "Implement JWT filter",
                        description = "Parse bearer tokens and inject authenticated user context.",
                        state = "IN_PROGRESS",
                        priority = "MEDIUM",
                        projectId = 1,
                        teamId = 1,
                        parentIssueId = feature1.id,
                        assigneeId = 2,
                        progress = 80,
                        plannedStartDate = LocalDate.of(2026, 3, 2),
                        plannedEndDate = LocalDate.of(2026, 3, 5),
                        estimatedHours = 24f,
                        actualHours = 20f,
                        sourceType = "NATIVE",
                        legacyPayload = """{"estimatedDays":3,"plannedDays":3,"remainingDays":0.5}"""
                    )
                )
                val task3 = issueRepository.save(
                    Issue(
                        identifier = "ISSUE-8",
                        type = "TASK",
                        title = "Build auth endpoints",
                        description = "Ship login and registration endpoints with consistent responses.",
                        state = "IN_PROGRESS",
                        priority = "MEDIUM",
                        projectId = 1,
                        teamId = 1,
                        parentIssueId = feature1.id,
                        assigneeId = 4,
                        progress = 50,
                        plannedStartDate = LocalDate.of(2026, 3, 5),
                        plannedEndDate = LocalDate.of(2026, 3, 8),
                        estimatedHours = 24f,
                        actualHours = 12f,
                        sourceType = "NATIVE",
                        legacyPayload = """{"estimatedDays":3,"plannedDays":2.5,"remainingDays":1}"""
                    )
                )
                issueRepository.save(
                    Issue(
                        identifier = "ISSUE-9",
                        type = "TASK",
                        title = "Build login page",
                        description = "Complete login interactions, validation, and error states.",
                        state = "TODO",
                        priority = "MEDIUM",
                        projectId = 1,
                        teamId = 1,
                        parentIssueId = feature1.id,
                        assigneeId = 3,
                        progress = 0,
                        plannedStartDate = LocalDate.of(2026, 3, 8),
                        plannedEndDate = LocalDate.of(2026, 3, 12),
                        estimatedHours = 32f,
                        actualHours = 0f,
                        sourceType = "NATIVE",
                        legacyPayload = """{"estimatedDays":4,"plannedDays":3,"remainingDays":3}"""
                    )
                )
                issueRepository.save(
                    Issue(
                        identifier = "ISSUE-10",
                        type = "TASK",
                        title = "Design Issue entity",
                        description = "Define common fields, hierarchy, and legacy mappings.",
                        state = "TODO",
                        priority = "MEDIUM",
                        projectId = 1,
                        teamId = 1,
                        parentIssueId = feature2.id,
                        assigneeId = 2,
                        progress = 0,
                        plannedStartDate = LocalDate.of(2026, 3, 10),
                        plannedEndDate = LocalDate.of(2026, 3, 12),
                        estimatedHours = 16f,
                        actualHours = 0f,
                        sourceType = "NATIVE",
                        legacyPayload = """{"estimatedDays":2,"plannedDays":2,"remainingDays":2}"""
                    )
                )
                issueRepository.save(
                    Issue(
                        identifier = "ISSUE-11",
                        type = "TASK",
                        title = "Build Issue API",
                        description = "Support issue listing, creation, updates, and state transitions.",
                        state = "TODO",
                        priority = "MEDIUM",
                        projectId = 1,
                        teamId = 1,
                        parentIssueId = feature2.id,
                        assigneeId = 4,
                        progress = 0,
                        plannedStartDate = LocalDate.of(2026, 3, 12),
                        plannedEndDate = LocalDate.of(2026, 3, 18),
                        estimatedHours = 40f,
                        actualHours = 0f,
                        sourceType = "NATIVE",
                        legacyPayload = """{"estimatedDays":5,"plannedDays":4,"remainingDays":4}"""
                    )
                )
                issueRepository.save(
                    Issue(
                        identifier = "ISSUE-12",
                        type = "TASK",
                        title = "Migrate frontend views",
                        description = "Switch requirement, task, and defect pages to unified issue APIs.",
                        state = "TODO",
                        priority = "MEDIUM",
                        projectId = 1,
                        teamId = 1,
                        parentIssueId = feature2.id,
                        assigneeId = 3,
                        progress = 0,
                        plannedStartDate = LocalDate.of(2026, 3, 15),
                        plannedEndDate = LocalDate.of(2026, 3, 25),
                        estimatedHours = 64f,
                        actualHours = 0f,
                        sourceType = "NATIVE",
                        legacyPayload = """{"estimatedDays":8,"plannedDays":6,"remainingDays":6}"""
                    )
                )

                issueRepository.save(
                    Issue(
                        identifier = "ISSUE-13",
                        type = "BUG",
                        title = "Login page layout breaks on small screens",
                        description = "The form shifts on mobile and narrow-width layouts.",
                        state = "IN_PROGRESS",
                        priority = "HIGH",
                        projectId = 1,
                        parentIssueId = task3.id,
                        reporterId = 1,
                        severity = "HIGH",
                        sourceType = "NATIVE"
                    )
                )
                issueRepository.save(
                    Issue(
                        identifier = "ISSUE-14",
                        type = "BUG",
                        title = "Expired token has no user feedback",
                        description = "The session expires and redirects without a visible message.",
                        state = "TODO",
                        priority = "MEDIUM",
                        projectId = 1,
                        reporterId = 1,
                        severity = "MEDIUM",
                        sourceType = "NATIVE"
                    )
                )
                issueRepository.save(
                    Issue(
                        identifier = "ISSUE-15",
                        type = "BUG",
                        title = "Task list becomes slow at scale",
                        description = "Rendering degrades as the number of tasks increases.",
                        state = "TODO",
                        priority = "HIGH",
                        projectId = 1,
                        reporterId = 5,
                        severity = "HIGH",
                        sourceType = "NATIVE"
                    )
                )
                issueRepository.save(
                    Issue(
                        identifier = "ISSUE-16",
                        type = "BUG",
                        title = "Delete confirmation text is incorrect",
                        description = "Deleting a feature still shows task-related confirmation copy.",
                        state = "IN_REVIEW",
                        priority = "LOW",
                        projectId = 1,
                        reporterId = 2,
                        severity = "LOW",
                        sourceType = "NATIVE"
                    )
                )
                issueRepository.save(
                    Issue(
                        identifier = "ISSUE-17",
                        type = "BUG",
                        title = "Avatar initials fail for CJK names",
                        description = "Initial extraction is inconsistent for non-Latin names.",
                        state = "DONE",
                        priority = "LOW",
                        projectId = 1,
                        reporterId = 3,
                        severity = "LOW",
                        sourceType = "NATIVE"
                    )
                )
                issueRepository.save(
                    Issue(
                        identifier = "ISSUE-18",
                        type = "BUG",
                        title = "Null values render as literal text",
                        description = "The UI still shows raw null strings in some fields.",
                        state = "TODO",
                        priority = "MEDIUM",
                        projectId = 1,
                        reporterId = 5,
                        severity = "MEDIUM",
                        sourceType = "NATIVE"
                    )
                )
            }

            println("=== Test data initialized successfully ===")
        }
    }
}
