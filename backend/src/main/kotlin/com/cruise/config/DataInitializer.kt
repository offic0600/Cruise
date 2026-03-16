package com.cruise.config

import com.cruise.entity.ActivityEvent
import com.cruise.entity.Comment
import com.cruise.entity.Doc
import com.cruise.entity.DocRevision
import com.cruise.entity.Epic
import com.cruise.entity.Issue
import com.cruise.entity.IssueApplicationLink
import com.cruise.entity.IssueDeliveryPlan
import com.cruise.entity.IssueExtensionPayload
import com.cruise.entity.IssueFeatureExtension
import com.cruise.entity.IssueRelation
import com.cruise.entity.IssueTag
import com.cruise.entity.IssueVendorAssignment
import com.cruise.entity.Membership
import com.cruise.entity.Notification
import com.cruise.entity.Organization
import com.cruise.entity.Project
import com.cruise.entity.Sprint
import com.cruise.entity.Team
import com.cruise.entity.TeamMember
import com.cruise.entity.User
import com.cruise.entity.Workflow
import com.cruise.entity.WorkflowState
import com.cruise.entity.WorkflowTransition
import com.cruise.repository.ActivityEventRepository
import com.cruise.repository.CommentRepository
import com.cruise.repository.DocRepository
import com.cruise.repository.DocRevisionRepository
import com.cruise.repository.EpicRepository
import com.cruise.repository.IssueApplicationLinkRepository
import com.cruise.repository.IssueDeliveryPlanRepository
import com.cruise.repository.IssueExtensionPayloadRepository
import com.cruise.repository.IssueFeatureExtensionRepository
import com.cruise.repository.IssueRelationRepository
import com.cruise.repository.IssueRepository
import com.cruise.repository.IssueTagRepository
import com.cruise.repository.IssueVendorAssignmentRepository
import com.cruise.repository.MembershipRepository
import com.cruise.repository.NotificationRepository
import com.cruise.repository.OrganizationRepository
import com.cruise.repository.ProjectRepository
import com.cruise.repository.SprintRepository
import com.cruise.repository.TeamMemberRepository
import com.cruise.repository.TeamRepository
import com.cruise.repository.UserRepository
import com.cruise.repository.WorkflowRepository
import com.cruise.repository.WorkflowStateRepository
import com.cruise.repository.WorkflowTransitionRepository
import org.springframework.boot.CommandLineRunner
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.crypto.password.PasswordEncoder
import java.time.LocalDate
import java.time.LocalDateTime

@Configuration(proxyBeanMethods = false)
open class DataInitializer {

    @Bean
    open fun initData(
        organizationRepository: OrganizationRepository,
        teamRepository: TeamRepository,
        membershipRepository: MembershipRepository,
        workflowRepository: WorkflowRepository,
        workflowStateRepository: WorkflowStateRepository,
        workflowTransitionRepository: WorkflowTransitionRepository,
        projectRepository: ProjectRepository,
        epicRepository: EpicRepository,
        sprintRepository: SprintRepository,
        userRepository: UserRepository,
        teamMemberRepository: TeamMemberRepository,
        issueTagRepository: IssueTagRepository,
        issueRepository: IssueRepository,
        issueFeatureExtensionRepository: IssueFeatureExtensionRepository,
        issueDeliveryPlanRepository: IssueDeliveryPlanRepository,
        issueApplicationLinkRepository: IssueApplicationLinkRepository,
        issueVendorAssignmentRepository: IssueVendorAssignmentRepository,
        issueExtensionPayloadRepository: IssueExtensionPayloadRepository,
        issueRelationRepository: IssueRelationRepository,
        docRepository: DocRepository,
        docRevisionRepository: DocRevisionRepository,
        commentRepository: CommentRepository,
        activityEventRepository: ActivityEventRepository,
        notificationRepository: NotificationRepository,
        passwordEncoder: PasswordEncoder
    ) = CommandLineRunner {
        if (issueRepository.count() > 0) {
            return@CommandLineRunner
        }

        val now = LocalDateTime.now()
        val organization = organizationRepository.save(
            Organization(
                name = "Cruise",
                slug = "cruise",
                status = "ACTIVE",
                createdAt = now
            )
        )

        val admin = userRepository.findByUsername("admin") ?: userRepository.save(
            User(
                username = "admin",
                password = passwordEncoder.encode("admin123"),
                email = "admin@cruise.local",
                displayName = "Cruise Admin",
                role = "ADMIN",
                status = "ACTIVE",
                createdAt = now,
                updatedAt = now
            )
        )

        val analyst = userRepository.findByUsername("analyst") ?: userRepository.save(
            User(
                username = "analyst",
                password = passwordEncoder.encode("analyst123"),
                email = "analyst@cruise.local",
                displayName = "Delivery Analyst",
                role = "USER",
                status = "ACTIVE",
                createdAt = now,
                updatedAt = now
            )
        )

        val team = teamRepository.save(
            Team(
                organizationId = organization.id,
                key = "CORE",
                name = "Core Delivery",
                description = "Core product and engineering team",
                createdAt = now,
                updatedAt = now
            )
        )

        membershipRepository.saveAll(
            listOf(
                Membership(
                    organizationId = organization.id,
                    teamId = team.id,
                    userId = admin.id,
                    role = "OWNER",
                    title = "Engineering Manager",
                    joinedAt = now,
                    active = true
                ),
                Membership(
                    organizationId = organization.id,
                    teamId = team.id,
                    userId = analyst.id,
                    role = "MEMBER",
                    title = "Product Analyst",
                    joinedAt = now,
                    active = true
                )
            )
        )

        val workflow = workflowRepository.save(
            Workflow(
                teamId = team.id,
                name = "Default Delivery Workflow",
                appliesToType = "ALL",
                isDefault = true,
                createdAt = now
            )
        )

        team.defaultWorkflowId = workflow.id
        teamRepository.save(team)

        workflowStateRepository.saveAll(
            listOf(
                WorkflowState(workflowId = workflow.id, key = "BACKLOG", label = "Backlog", category = "BACKLOG", sortOrder = 1),
                WorkflowState(workflowId = workflow.id, key = "TODO", label = "Todo", category = "ACTIVE", sortOrder = 2),
                WorkflowState(workflowId = workflow.id, key = "IN_PROGRESS", label = "In Progress", category = "ACTIVE", sortOrder = 3),
                WorkflowState(workflowId = workflow.id, key = "IN_REVIEW", label = "In Review", category = "REVIEW", sortOrder = 4),
                WorkflowState(workflowId = workflow.id, key = "DONE", label = "Done", category = "COMPLETED", sortOrder = 5),
                WorkflowState(workflowId = workflow.id, key = "CANCELED", label = "Canceled", category = "CANCELED", sortOrder = 6)
            )
        )

        workflowTransitionRepository.saveAll(
            listOf(
                WorkflowTransition(workflowId = workflow.id, fromStateKey = "BACKLOG", toStateKey = "TODO"),
                WorkflowTransition(workflowId = workflow.id, fromStateKey = "TODO", toStateKey = "IN_PROGRESS"),
                WorkflowTransition(workflowId = workflow.id, fromStateKey = "IN_PROGRESS", toStateKey = "IN_REVIEW"),
                WorkflowTransition(workflowId = workflow.id, fromStateKey = "IN_REVIEW", toStateKey = "DONE"),
                WorkflowTransition(workflowId = workflow.id, fromStateKey = "TODO", toStateKey = "CANCELED")
            )
        )

        val project = projectRepository.save(
            Project(
                organizationId = organization.id,
                teamId = team.id,
                key = "CRUISE",
                name = "Cruise RnD Workspace",
                description = "Unified work tracking and analytics workspace",
                status = "ACTIVE",
                ownerId = admin.id,
                startDate = LocalDate.of(2026, 3, 1),
                targetDate = LocalDate.of(2026, 4, 30),
                createdAt = now,
                updatedAt = now
            )
        )

        val sprint = sprintRepository.save(
            Sprint(
                teamId = team.id,
                projectId = project.id,
                name = "Sprint 2026-03A",
                goal = "Stabilize the unified work item model",
                sequenceNumber = 1,
                status = "ACTIVE",
                startDate = LocalDate.of(2026, 3, 10),
                endDate = LocalDate.of(2026, 3, 23),
                createdAt = now,
                updatedAt = now
            )
        )

        val authEpic = epicRepository.save(
            Epic(
                organizationId = organization.id,
                teamId = team.id,
                projectId = project.id,
                identifier = "EPIC-1",
                title = "Authentication and access platform",
                description = "Unify login, session handling, and role assignments.",
                state = "IN_PROGRESS",
                priority = "HIGH",
                ownerId = admin.id,
                reporterId = analyst.id,
                startDate = LocalDate.of(2026, 3, 2),
                targetDate = LocalDate.of(2026, 3, 28),
                createdAt = now,
                updatedAt = now
            )
        )

        val workEpic = epicRepository.save(
            Epic(
                organizationId = organization.id,
                teamId = team.id,
                projectId = project.id,
                identifier = "EPIC-2",
                title = "Unified work management",
                description = "Converge legacy tracking into the new issue model.",
                state = "IN_PROGRESS",
                priority = "URGENT",
                ownerId = admin.id,
                reporterId = admin.id,
                startDate = LocalDate.of(2026, 3, 4),
                targetDate = LocalDate.of(2026, 4, 12),
                createdAt = now,
                updatedAt = now
            )
        )

        val teamMembers = teamMemberRepository.saveAll(
            listOf(
                TeamMember(name = "Alice Chen", email = "alice@cruise.local", role = "PRODUCT_MANAGER", skills = "Planning, Analytics", teamId = team.id, createdAt = now),
                TeamMember(name = "Bob Liu", email = "bob@cruise.local", role = "DEVELOPER", skills = "Kotlin, Spring", teamId = team.id, createdAt = now),
                TeamMember(name = "Cathy Wu", email = "cathy@cruise.local", role = "QA", skills = "Testing, Automation", teamId = team.id, createdAt = now),
                TeamMember(name = "David Sun", email = "david@cruise.local", role = "ARCHITECT", skills = "System design, Data modeling", teamId = team.id, createdAt = now)
            )
        )

        issueTagRepository.saveAll(
            listOf(
                IssueTag(name = "platform", color = "#2563EB", sortOrder = 1, createdAt = now),
                IssueTag(name = "auth", color = "#0F766E", sortOrder = 2, createdAt = now),
                IssueTag(name = "migration", color = "#EA580C", sortOrder = 3, createdAt = now)
            )
        )

        val featureAuth = issueRepository.save(
            Issue(
                organizationId = organization.id,
                epicId = authEpic.id,
                sprintId = sprint.id,
                identifier = "ISSUE-1001",
                type = "FEATURE",
                title = "Complete authentication flow",
                description = "Ship login, logout, token refresh, and protected route behavior.",
                state = "IN_PROGRESS",
                priority = "HIGH",
                projectId = project.id,
                teamId = team.id,
                assigneeId = teamMembers[1].id,
                reporterId = admin.id,
                estimatePoints = 8,
                progress = 60,
                plannedStartDate = LocalDate.of(2026, 3, 10),
                plannedEndDate = LocalDate.of(2026, 3, 21),
                estimatedHours = 48f,
                actualHours = 29f,
                sourceType = "NATIVE",
                createdAt = now.minusDays(6),
                updatedAt = now.minusDays(1)
            )
        )

        val featureWork = issueRepository.save(
            Issue(
                organizationId = organization.id,
                epicId = workEpic.id,
                sprintId = sprint.id,
                identifier = "ISSUE-1002",
                type = "FEATURE",
                title = "Unify work item views",
                description = "Route issue-based data into dashboard and execution pages.",
                state = "IN_PROGRESS",
                priority = "URGENT",
                projectId = project.id,
                teamId = team.id,
                assigneeId = teamMembers[3].id,
                reporterId = analyst.id,
                estimatePoints = 13,
                progress = 55,
                plannedStartDate = LocalDate.of(2026, 3, 11),
                plannedEndDate = LocalDate.of(2026, 3, 24),
                estimatedHours = 72f,
                actualHours = 36f,
                sourceType = "MIGRATED",
                createdAt = now.minusDays(5),
                updatedAt = now.minusHours(8)
            )
        )

        val taskApi = issueRepository.save(
            Issue(
                organizationId = organization.id,
                epicId = workEpic.id,
                sprintId = sprint.id,
                identifier = "ISSUE-1003",
                type = "TASK",
                title = "Expose issue relations API",
                description = "Support blocking and dependency views in the backend.",
                state = "TODO",
                priority = "MEDIUM",
                projectId = project.id,
                teamId = team.id,
                parentIssueId = featureWork.id,
                assigneeId = teamMembers[1].id,
                reporterId = admin.id,
                estimatePoints = 5,
                progress = 15,
                plannedStartDate = LocalDate.of(2026, 3, 17),
                plannedEndDate = LocalDate.of(2026, 3, 20),
                estimatedHours = 20f,
                actualHours = 3f,
                sourceType = "NATIVE",
                createdAt = now.minusDays(3),
                updatedAt = now.minusHours(12)
            )
        )

        val bugLogin = issueRepository.save(
            Issue(
                organizationId = organization.id,
                epicId = authEpic.id,
                sprintId = sprint.id,
                identifier = "ISSUE-1004",
                type = "BUG",
                title = "Fix stale token redirect loop",
                description = "Prevent login page redirects when access token expires after hydration.",
                state = "IN_REVIEW",
                priority = "HIGH",
                projectId = project.id,
                teamId = team.id,
                parentIssueId = featureAuth.id,
                assigneeId = teamMembers[2].id,
                reporterId = analyst.id,
                estimatePoints = 3,
                progress = 80,
                plannedStartDate = LocalDate.of(2026, 3, 12),
                plannedEndDate = LocalDate.of(2026, 3, 18),
                estimatedHours = 12f,
                actualHours = 9f,
                severity = "HIGH",
                sourceType = "IMPORTED",
                sourceId = 41,
                createdAt = now.minusDays(4),
                updatedAt = now.minusHours(6)
            )
        )

        val taskSeed = issueRepository.save(
            Issue(
                organizationId = organization.id,
                epicId = workEpic.id,
                sprintId = sprint.id,
                identifier = "ISSUE-1005",
                type = "TASK",
                title = "Prepare migration seed data",
                description = "Seed teams, epics, sprints, and collaboration records.",
                state = "DONE",
                priority = "LOW",
                projectId = project.id,
                teamId = team.id,
                parentIssueId = featureWork.id,
                assigneeId = teamMembers[0].id,
                reporterId = admin.id,
                estimatePoints = 2,
                progress = 100,
                plannedStartDate = LocalDate.of(2026, 3, 9),
                plannedEndDate = LocalDate.of(2026, 3, 12),
                estimatedHours = 8f,
                actualHours = 7.5f,
                sourceType = "NATIVE",
                createdAt = now.minusDays(8),
                updatedAt = now.minusDays(2)
            )
        )

        issueFeatureExtensionRepository.saveAll(
            listOf(
                IssueFeatureExtension(
                    issueId = featureAuth.id,
                    requirementOwnerId = teamMembers[0].id,
                    productOwnerId = teamMembers[0].id,
                    devOwnerId = teamMembers[1].id,
                    testOwnerId = teamMembers[2].id,
                    devParticipantsText = "Bob Liu, Cathy Wu",
                    tagsText = "auth, platform",
                    createdByText = "Cruise Admin"
                ),
                IssueFeatureExtension(
                    issueId = featureWork.id,
                    requirementOwnerId = teamMembers[3].id,
                    productOwnerId = teamMembers[0].id,
                    devOwnerId = teamMembers[3].id,
                    testOwnerId = teamMembers[2].id,
                    devParticipantsText = "David Sun, Bob Liu",
                    tagsText = "migration, platform",
                    createdByText = "Delivery Analyst"
                )
            )
        )

        issueDeliveryPlanRepository.saveAll(
            listOf(
                IssueDeliveryPlan(
                    issueId = featureAuth.id,
                    estimatedDays = 6f,
                    plannedDays = 7f,
                    actualDays = 4f,
                    gapDays = -3f,
                    gapBudget = -1200f,
                    expectedDeliveryDate = LocalDate.of(2026, 3, 21)
                ),
                IssueDeliveryPlan(
                    issueId = featureWork.id,
                    estimatedDays = 9f,
                    plannedDays = 10f,
                    actualDays = 5f,
                    gapDays = -5f,
                    gapBudget = -2800f,
                    expectedDeliveryDate = LocalDate.of(2026, 3, 24)
                )
            )
        )

        issueApplicationLinkRepository.saveAll(
            listOf(
                IssueApplicationLink(issueId = featureAuth.id, applicationCode = "AUTH-WEB"),
                IssueApplicationLink(issueId = featureAuth.id, applicationCode = "AUTH-API"),
                IssueApplicationLink(issueId = featureWork.id, applicationCode = "PM-DASHBOARD")
            )
        )

        issueVendorAssignmentRepository.saveAll(
            listOf(
                IssueVendorAssignment(issueId = featureWork.id, vendorName = "Acme Delivery", vendorStaffName = "Ethan", role = "Consultant"),
                IssueVendorAssignment(issueId = bugLogin.id, vendorName = "QA Partners", vendorStaffName = "Mia", role = "Testing Support")
            )
        )

        issueExtensionPayloadRepository.save(
            IssueExtensionPayload(
                issueId = featureWork.id,
                schemaVersion = 1,
                payloadJson = """{"legacyTracker":"legacy-workbench","importBatch":"2026-03-16","notes":"Seeded from unified model initializer"}""",
                updatedAt = now
            )
        )

        issueRelationRepository.saveAll(
            listOf(
                IssueRelation(fromIssueId = taskApi.id, toIssueId = featureWork.id, relationType = "RELATES_TO", createdAt = now),
                IssueRelation(fromIssueId = bugLogin.id, toIssueId = featureAuth.id, relationType = "CAUSED_BY", createdAt = now),
                IssueRelation(fromIssueId = taskApi.id, toIssueId = bugLogin.id, relationType = "BLOCKED_BY", createdAt = now)
            )
        )

        val doc = docRepository.save(
            Doc(
                organizationId = organization.id,
                teamId = team.id,
                projectId = project.id,
                epicId = workEpic.id,
                issueId = featureWork.id,
                title = "Unified issue model baseline",
                slug = "unified-issue-model-baseline",
                status = "PUBLISHED",
                authorId = admin.id,
                createdAt = now.minusDays(2),
                updatedAt = now.minusDays(1)
            )
        )

        val revision = docRevisionRepository.save(
            DocRevision(
                docId = doc.id,
                versionNumber = 1,
                content = "Issue is the execution source of truth. Epics and sprints provide planning context.",
                authorId = admin.id,
                createdAt = now.minusDays(2)
            )
        )
        doc.currentRevisionId = revision.id
        doc.updatedAt = now.minusDays(1)
        docRepository.save(doc)

        commentRepository.saveAll(
            listOf(
                Comment(
                    issueId = featureWork.id,
                    authorId = admin.id,
                    body = "Use Issue as the single execution object and move planning concerns into Epic and Sprint.",
                    createdAt = now.minusDays(1),
                    updatedAt = now.minusDays(1)
                ),
                Comment(
                    epicId = workEpic.id,
                    authorId = analyst.id,
                    body = "Keep legacy fields in structured extensions instead of expanding the issue table again.",
                    createdAt = now.minusHours(20),
                    updatedAt = now.minusHours(20)
                ),
                Comment(
                    docId = doc.id,
                    authorId = admin.id,
                    body = "Baseline approved for the first implementation pass.",
                    createdAt = now.minusHours(18),
                    updatedAt = now.minusHours(18)
                )
            )
        )

        val activity = activityEventRepository.save(
            ActivityEvent(
                actorId = admin.id,
                entityType = "ISSUE",
                entityId = featureWork.id,
                actionType = "UPDATED",
                summary = "Unified work item feature seeded with planning and extension data.",
                payloadJson = """{"epicId":${workEpic.id},"sprintId":${sprint.id},"state":"IN_PROGRESS"}""",
                createdAt = now.minusHours(10)
            )
        )

        notificationRepository.save(
            Notification(
                userId = admin.id,
                eventId = activity.id,
                type = "SYSTEM",
                title = "Seed data initialized",
                body = "The workspace now includes organization, planning, execution, and collaboration sample records.",
                createdAt = now.minusHours(10)
            )
        )
    }
}
