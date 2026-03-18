package com.cruise.config

import com.cruise.entity.ActivityEvent
import com.cruise.entity.Comment
import com.cruise.entity.CustomFieldDefinition
import com.cruise.entity.CustomFieldOption
import com.cruise.entity.CustomFieldValue
import com.cruise.entity.Doc
import com.cruise.entity.DocRevision
import com.cruise.entity.ImportFieldMappingTemplate
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
import com.cruise.entity.Team
import com.cruise.entity.TeamMember
import com.cruise.entity.User
import com.cruise.entity.View
import com.cruise.entity.Workflow
import com.cruise.entity.WorkflowState
import com.cruise.entity.WorkflowTransition
import com.cruise.repository.ActivityEventRepository
import com.cruise.repository.CommentRepository
import com.cruise.repository.CustomFieldDefinitionRepository
import com.cruise.repository.CustomFieldOptionRepository
import com.cruise.repository.CustomFieldValueRepository
import com.cruise.repository.DocRepository
import com.cruise.repository.DocRevisionRepository
import com.cruise.repository.ImportFieldMappingTemplateRepository
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
import com.cruise.repository.TeamMemberRepository
import com.cruise.repository.TeamRepository
import com.cruise.repository.UserRepository
import com.cruise.repository.ViewRepository
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
        userRepository: UserRepository,
        teamMemberRepository: TeamMemberRepository,
        viewRepository: ViewRepository,
        customFieldDefinitionRepository: CustomFieldDefinitionRepository,
        customFieldOptionRepository: CustomFieldOptionRepository,
        customFieldValueRepository: CustomFieldValueRepository,
        importFieldMappingTemplateRepository: ImportFieldMappingTemplateRepository,
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
        if (issueRepository.count() > 0) return@CommandLineRunner

        val now = LocalDateTime.now()
        val organization = organizationRepository.save(
            Organization(name = "Cruise", slug = "cruise", status = "ACTIVE", createdAt = now)
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
                Membership(organizationId = organization.id, teamId = team.id, userId = admin.id, role = "OWNER", title = "Engineering Manager", joinedAt = now, active = true),
                Membership(organizationId = organization.id, teamId = team.id, userId = analyst.id, role = "MEMBER", title = "Product Analyst", joinedAt = now, active = true)
            )
        )

        val workflow = workflowRepository.save(
            Workflow(teamId = team.id, name = "Default Delivery Workflow", appliesToType = "ALL", isDefault = true, createdAt = now)
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
                description = "Unified work tracking workspace",
                status = "ACTIVE",
                ownerId = admin.id,
                startDate = LocalDate.of(2026, 3, 1),
                targetDate = LocalDate.of(2026, 4, 30),
                createdAt = now,
                updatedAt = now
            )
        )

        viewRepository.saveAll(
            listOf(
                createSystemView(now, organization.id, team.id, null, "My issues", "Issues assigned to or reported by the current user.", """{"scope":"me"}"""),
                createSystemView(now, organization.id, team.id, null, "Current cycle", "Issues in the current execution window.", """{"stateCategory":["ACTIVE","REVIEW"],"dateField":"plannedEndDate"}"""),
                createSystemView(now, organization.id, team.id, null, "Backlog", "Issues waiting to be planned.", """{"stateCategory":["BACKLOG"]}"""),
                createSystemView(now, organization.id, team.id, null, "High priority", "Items that need urgent attention.", """{"priority":["HIGH","URGENT"]}"""),
                createSystemView(now, organization.id, team.id, null, "Needs review", "Items currently waiting for review.", """{"state":["IN_REVIEW"]}"""),
                createSystemView(now, organization.id, team.id, project.id, "Authentication track", "Authentication and access work.", """{"projectId":${project.id},"customFields":{"track":"auth"}}"""),
                createSystemView(now, organization.id, team.id, project.id, "Work management", "Work management simplification stream.", """{"projectId":${project.id},"customFields":{"track":"work-management"}}""")
            )
        )

        val members = teamMemberRepository.saveAll(
            listOf(
                TeamMember(name = "Alice Chen", email = "alice@cruise.local", role = "PRODUCT_MANAGER", skills = "Planning, Analytics", teamId = team.id, createdAt = now),
                TeamMember(name = "Bob Liu", email = "bob@cruise.local", role = "DEVELOPER", skills = "Kotlin, Spring", teamId = team.id, createdAt = now),
                TeamMember(name = "Cathy Wu", email = "cathy@cruise.local", role = "QA", skills = "Testing, Automation", teamId = team.id, createdAt = now),
                TeamMember(name = "David Sun", email = "david@cruise.local", role = "ARCHITECT", skills = "System design, Data modeling", teamId = team.id, createdAt = now)
            )
        )

        seedTagsAndFields(now, organization.id, team.id, project.id, customFieldDefinitionRepository, customFieldOptionRepository, issueTagRepository)

        val issues = seedIssues(now, organization.id, project.id, team.id, admin.id, analyst.id, members, issueRepository)
        seedIssueExtensions(now, issues, issueFeatureExtensionRepository, issueDeliveryPlanRepository, issueApplicationLinkRepository, issueVendorAssignmentRepository, issueExtensionPayloadRepository)
        seedCustomFieldValues(now, issues, customFieldDefinitionRepository, customFieldValueRepository)
        seedImports(now, organization.id, importFieldMappingTemplateRepository)
        seedRelations(now, issues, issueRelationRepository)
        seedDocsAndComments(now, organization.id, team.id, project.id, admin.id, analyst.id, issues, docRepository, docRevisionRepository, commentRepository)
        seedActivity(now, admin.id, issues["featureWork"]!!.id, activityEventRepository, notificationRepository)
    }

    private fun createSystemView(
        now: LocalDateTime,
        organizationId: Long,
        teamId: Long,
        projectId: Long?,
        name: String,
        description: String,
        filterJson: String
    ) = View(
        organizationId = organizationId,
        teamId = teamId,
        projectId = projectId,
        name = name,
        description = description,
        filterJson = filterJson,
        groupBy = "state",
        sortJson = """{"field":"updatedAt","direction":"desc"}""",
        visibility = if (projectId == null) "WORKSPACE" else "PROJECT",
        isSystem = true,
        createdAt = now,
        updatedAt = now
    )

    private fun seedTagsAndFields(
        now: LocalDateTime,
        organizationId: Long,
        teamId: Long,
        projectId: Long,
        definitionRepository: CustomFieldDefinitionRepository,
        optionRepository: CustomFieldOptionRepository,
        tagRepository: IssueTagRepository
    ) {
        tagRepository.saveAll(
            listOf(
                IssueTag(name = "Bug", color = "#EF4444", sortOrder = 1, createdAt = now),
                IssueTag(name = "Feature", color = "#A855F7", sortOrder = 2, createdAt = now),
                IssueTag(name = "Improvement", color = "#3B82F6", sortOrder = 3, createdAt = now)
            )
        )

        val fields = listOf(
            CustomFieldDefinition(organizationId = organizationId, entityType = "ISSUE", scopeType = "GLOBAL", key = "ai_delivery_type", name = "AI Delivery Type", description = "How AI contributes to the delivery of this work item.", dataType = "SINGLE_SELECT", isFilterable = true, showOnCreate = true, showOnDetail = true, showOnList = true, sortOrder = 1, configJson = """{"placeholder":"Select delivery type"}""", createdAt = now, updatedAt = now),
            CustomFieldDefinition(organizationId = organizationId, entityType = "ISSUE", scopeType = "PROJECT", scopeId = projectId, key = "delivery_mode", name = "Delivery Mode", description = "The execution mode for this work item.", dataType = "SINGLE_SELECT", isFilterable = true, showOnCreate = true, showOnDetail = true, showOnList = true, sortOrder = 2, configJson = """{"placeholder":"Select delivery mode"}""", createdAt = now, updatedAt = now),
            CustomFieldDefinition(organizationId = organizationId, entityType = "ISSUE", scopeType = "GLOBAL", key = "risk_summary", name = "Risk Summary", description = "Key delivery risk for this work item.", dataType = "TEXTAREA", isFilterable = true, showOnCreate = true, showOnDetail = true, showOnList = false, sortOrder = 3, configJson = """{"placeholder":"Capture the main risk"}""", createdAt = now, updatedAt = now),
            CustomFieldDefinition(organizationId = organizationId, entityType = "ISSUE", scopeType = "TEAM", scopeId = teamId, key = "rollout_ready", name = "Rollout Ready", description = "Whether the item is ready for rollout communication.", dataType = "BOOLEAN", isFilterable = true, showOnCreate = true, showOnDetail = true, showOnList = false, sortOrder = 4, createdAt = now, updatedAt = now),
            CustomFieldDefinition(organizationId = organizationId, entityType = "ISSUE", scopeType = "PROJECT", scopeId = projectId, key = "track", name = "Track", description = "Optional thematic grouping used instead of legacy epics.", dataType = "SINGLE_SELECT", isFilterable = true, showOnCreate = true, showOnDetail = true, showOnList = true, sortOrder = 5, configJson = """{"placeholder":"Select track"}""", createdAt = now, updatedAt = now)
        ).associateBy { it.key }

        definitionRepository.saveAll(fields.values)

        optionRepository.saveAll(
            listOf(
                CustomFieldOption(fieldDefinitionId = fields.getValue("ai_delivery_type").id, value = "COPILOT", label = "Copilot", color = "#2563EB", sortOrder = 0),
                CustomFieldOption(fieldDefinitionId = fields.getValue("ai_delivery_type").id, value = "AUTOMATION", label = "Automation", color = "#0891B2", sortOrder = 1),
                CustomFieldOption(fieldDefinitionId = fields.getValue("ai_delivery_type").id, value = "MANUAL", label = "Manual", color = "#475569", sortOrder = 2),
                CustomFieldOption(fieldDefinitionId = fields.getValue("delivery_mode").id, value = "SELF_DELIVERY", label = "Self Delivery", color = "#10B981", sortOrder = 0),
                CustomFieldOption(fieldDefinitionId = fields.getValue("delivery_mode").id, value = "CO_DELIVERY", label = "Co-delivery", color = "#8B5CF6", sortOrder = 1),
                CustomFieldOption(fieldDefinitionId = fields.getValue("delivery_mode").id, value = "OUTSOURCED", label = "Outsourced", color = "#F97316", sortOrder = 2),
                CustomFieldOption(fieldDefinitionId = fields.getValue("track").id, value = "auth", label = "Authentication", color = "#2563EB", sortOrder = 0),
                CustomFieldOption(fieldDefinitionId = fields.getValue("track").id, value = "work-management", label = "Work management", color = "#7C3AED", sortOrder = 1)
            )
        )
    }

    private fun seedIssues(
        now: LocalDateTime,
        organizationId: Long,
        projectId: Long,
        teamId: Long,
        adminId: Long,
        analystId: Long,
        members: List<TeamMember>,
        issueRepository: IssueRepository
    ): Map<String, Issue> {
        val featureAuth = issueRepository.save(
            Issue(organizationId = organizationId, identifier = "ISSUE-1001", type = "FEATURE", title = "Complete authentication flow", description = "Ship login, logout, token refresh, and protected route behavior.", state = "IN_PROGRESS", priority = "HIGH", projectId = projectId, teamId = teamId, assigneeId = members[1].id, reporterId = adminId, estimatePoints = 8, progress = 60, plannedStartDate = LocalDate.of(2026, 3, 10), plannedEndDate = LocalDate.of(2026, 3, 21), estimatedHours = 48f, actualHours = 29f, sourceType = "NATIVE", createdAt = now.minusDays(6), updatedAt = now.minusDays(1))
        )
        val featureWork = issueRepository.save(
            Issue(organizationId = organizationId, identifier = "ISSUE-1002", type = "FEATURE", title = "Unify work item views", description = "Route issue-based data into dashboard and execution pages.", state = "IN_PROGRESS", priority = "URGENT", projectId = projectId, teamId = teamId, assigneeId = members[3].id, reporterId = analystId, estimatePoints = 13, progress = 55, plannedStartDate = LocalDate.of(2026, 3, 11), plannedEndDate = LocalDate.of(2026, 3, 24), estimatedHours = 72f, actualHours = 36f, sourceType = "MIGRATED", createdAt = now.minusDays(5), updatedAt = now.minusHours(8))
        )
        val taskApi = issueRepository.save(
            Issue(organizationId = organizationId, identifier = "ISSUE-1003", type = "TASK", title = "Expose issue relations API", description = "Support blocking and dependency views in the backend.", state = "TODO", priority = "MEDIUM", projectId = projectId, teamId = teamId, parentIssueId = featureWork.id, assigneeId = members[1].id, reporterId = adminId, estimatePoints = 5, progress = 15, plannedStartDate = LocalDate.of(2026, 3, 17), plannedEndDate = LocalDate.of(2026, 3, 20), estimatedHours = 20f, actualHours = 3f, sourceType = "NATIVE", createdAt = now.minusDays(3), updatedAt = now.minusHours(12))
        )
        val bugLogin = issueRepository.save(
            Issue(organizationId = organizationId, identifier = "ISSUE-1004", type = "BUG", title = "Fix stale token redirect loop", description = "Prevent login page redirects when access token expires after hydration.", state = "IN_REVIEW", priority = "HIGH", projectId = projectId, teamId = teamId, parentIssueId = featureAuth.id, assigneeId = members[2].id, reporterId = analystId, estimatePoints = 3, progress = 80, plannedStartDate = LocalDate.of(2026, 3, 12), plannedEndDate = LocalDate.of(2026, 3, 18), estimatedHours = 12f, actualHours = 9f, severity = "HIGH", sourceType = "IMPORTED", sourceId = 41, createdAt = now.minusDays(4), updatedAt = now.minusHours(6))
        )
        val taskSeed = issueRepository.save(
            Issue(organizationId = organizationId, identifier = "ISSUE-1005", type = "TASK", title = "Prepare migration seed data", description = "Seed teams, views, and collaboration records.", state = "DONE", priority = "LOW", resolution = "COMPLETED", projectId = projectId, teamId = teamId, parentIssueId = featureWork.id, assigneeId = members[0].id, reporterId = adminId, estimatePoints = 2, progress = 100, plannedStartDate = LocalDate.of(2026, 3, 9), plannedEndDate = LocalDate.of(2026, 3, 12), estimatedHours = 8f, actualHours = 7.5f, sourceType = "NATIVE", createdAt = now.minusDays(8), updatedAt = now.minusDays(2))
        )
        return mapOf("featureAuth" to featureAuth, "featureWork" to featureWork, "taskApi" to taskApi, "bugLogin" to bugLogin, "taskSeed" to taskSeed)
    }

    private fun seedIssueExtensions(
        now: LocalDateTime,
        issues: Map<String, Issue>,
        featureRepository: IssueFeatureExtensionRepository,
        planRepository: IssueDeliveryPlanRepository,
        appRepository: IssueApplicationLinkRepository,
        vendorRepository: IssueVendorAssignmentRepository,
        payloadRepository: IssueExtensionPayloadRepository
    ) {
        val featureAuth = issues.getValue("featureAuth")
        val featureWork = issues.getValue("featureWork")
        val bugLogin = issues.getValue("bugLogin")
        featureRepository.saveAll(
            listOf(
                IssueFeatureExtension(issueId = featureAuth.id, devParticipantsText = "Bob Liu, Cathy Wu", tagsText = "auth, platform", createdByText = "Cruise Admin"),
                IssueFeatureExtension(issueId = featureWork.id, devParticipantsText = "David Sun, Bob Liu", tagsText = "migration, platform", createdByText = "Delivery Analyst")
            )
        )
        planRepository.saveAll(
            listOf(
                IssueDeliveryPlan(issueId = featureAuth.id, estimatedDays = 6f, plannedDays = 7f, actualDays = 4f, gapDays = -3f, gapBudget = -1200f, expectedDeliveryDate = LocalDate.of(2026, 3, 21)),
                IssueDeliveryPlan(issueId = featureWork.id, estimatedDays = 9f, plannedDays = 10f, actualDays = 5f, gapDays = -5f, gapBudget = -2800f, expectedDeliveryDate = LocalDate.of(2026, 3, 24))
            )
        )
        appRepository.saveAll(
            listOf(
                IssueApplicationLink(issueId = featureAuth.id, applicationCode = "AUTH-WEB"),
                IssueApplicationLink(issueId = featureAuth.id, applicationCode = "AUTH-API"),
                IssueApplicationLink(issueId = featureWork.id, applicationCode = "PM-DASHBOARD")
            )
        )
        vendorRepository.saveAll(
            listOf(
                IssueVendorAssignment(issueId = featureWork.id, vendorName = "Acme Delivery", vendorStaffName = "Ethan", role = "Consultant"),
                IssueVendorAssignment(issueId = bugLogin.id, vendorName = "QA Partners", vendorStaffName = "Mia", role = "Testing Support")
            )
        )
        payloadRepository.save(
            IssueExtensionPayload(issueId = featureWork.id, schemaVersion = 1, payloadJson = """{"legacyTracker":"legacy-workbench","importBatch":"2026-03-16","notes":"Seeded from simplified workspace initializer"}""", updatedAt = now)
        )
    }

    private fun seedCustomFieldValues(
        now: LocalDateTime,
        issues: Map<String, Issue>,
        definitionRepository: CustomFieldDefinitionRepository,
        valueRepository: CustomFieldValueRepository
    ) {
        val defs = definitionRepository.findAll().associateBy { it.key }
        valueRepository.saveAll(
            listOf(
                CustomFieldValue(fieldDefinitionId = defs.getValue("ai_delivery_type").id, entityType = "ISSUE", entityId = issues.getValue("featureAuth").id, valueText = "COPILOT", createdAt = now.minusDays(5), updatedAt = now.minusDays(1)),
                CustomFieldValue(fieldDefinitionId = defs.getValue("ai_delivery_type").id, entityType = "ISSUE", entityId = issues.getValue("featureWork").id, valueText = "AUTOMATION", createdAt = now.minusDays(5), updatedAt = now.minusHours(8)),
                CustomFieldValue(fieldDefinitionId = defs.getValue("delivery_mode").id, entityType = "ISSUE", entityId = issues.getValue("featureWork").id, valueText = "CO_DELIVERY", createdAt = now.minusDays(5), updatedAt = now.minusHours(8)),
                CustomFieldValue(fieldDefinitionId = defs.getValue("risk_summary").id, entityType = "ISSUE", entityId = issues.getValue("bugLogin").id, valueText = "Token refresh behavior still breaks after hydration when the tab wakes from sleep.", createdAt = now.minusDays(3), updatedAt = now.minusHours(6)),
                CustomFieldValue(fieldDefinitionId = defs.getValue("rollout_ready").id, entityType = "ISSUE", entityId = issues.getValue("taskSeed").id, valueBoolean = true, createdAt = now.minusDays(3), updatedAt = now.minusDays(2)),
                CustomFieldValue(fieldDefinitionId = defs.getValue("track").id, entityType = "ISSUE", entityId = issues.getValue("featureAuth").id, valueText = "auth", createdAt = now.minusDays(5), updatedAt = now.minusDays(1)),
                CustomFieldValue(fieldDefinitionId = defs.getValue("track").id, entityType = "ISSUE", entityId = issues.getValue("featureWork").id, valueText = "work-management", createdAt = now.minusDays(5), updatedAt = now.minusHours(8))
            )
        )
    }

    private fun seedImports(
        now: LocalDateTime,
        organizationId: Long,
        repository: ImportFieldMappingTemplateRepository
    ) {
        repository.save(
            ImportFieldMappingTemplate(
                organizationId = organizationId,
                entityType = "ISSUE",
                name = "Default Excel issue import",
                sourceType = "EXCEL",
                mappingJson = """{
                  "需求描述":{"target":"title"},
                  "任务描述":{"target":"description"},
                  "状态":{"target":"state"},
                  "开发负责人":{"target":"assigneeId"},
                  "所属团队":{"target":"teamId"},
                  "计划开始时间":{"target":"plannedStartDate"},
                  "计划完成时间":{"target":"plannedEndDate"},
                  "开发进度":{"target":"progress"},
                  "需求所属AI交付类型":{"target":"customField","key":"ai_delivery_type"},
                  "需求所属交付模式":{"target":"customField","key":"delivery_mode"},
                  "风险":{"target":"customField","key":"risk_summary"},
                  "专题范围":{"target":"customField","key":"track"}
                }""".trimIndent(),
                isDefault = true,
                createdAt = now
            )
        )
    }

    private fun seedRelations(
        now: LocalDateTime,
        issues: Map<String, Issue>,
        repository: IssueRelationRepository
    ) {
        repository.saveAll(
            listOf(
                IssueRelation(fromIssueId = issues.getValue("taskApi").id, toIssueId = issues.getValue("featureWork").id, relationType = "RELATES_TO", createdAt = now),
                IssueRelation(fromIssueId = issues.getValue("bugLogin").id, toIssueId = issues.getValue("featureAuth").id, relationType = "CAUSED_BY", createdAt = now),
                IssueRelation(fromIssueId = issues.getValue("taskApi").id, toIssueId = issues.getValue("bugLogin").id, relationType = "BLOCKED_BY", createdAt = now)
            )
        )
    }

    private fun seedDocsAndComments(
        now: LocalDateTime,
        organizationId: Long,
        teamId: Long,
        projectId: Long,
        adminId: Long,
        analystId: Long,
        issues: Map<String, Issue>,
        docRepository: DocRepository,
        revisionRepository: DocRevisionRepository,
        commentRepository: CommentRepository
    ) {
        val doc = docRepository.save(
            Doc(
                organizationId = organizationId,
                teamId = teamId,
                projectId = projectId,
                issueId = issues.getValue("featureWork").id,
                title = "Unified issue model baseline",
                slug = "unified-issue-model-baseline",
                status = "PUBLISHED",
                authorId = adminId,
                createdAt = now.minusDays(2),
                updatedAt = now.minusDays(1)
            )
        )
        val revision = revisionRepository.save(
            DocRevision(
                docId = doc.id,
                versionNumber = 1,
                content = "Issue is the execution source of truth. Projects and views provide planning context.",
                authorId = adminId,
                createdAt = now.minusDays(2)
            )
        )
        doc.currentRevisionId = revision.id
        doc.updatedAt = now.minusDays(1)
        docRepository.save(doc)

        commentRepository.saveAll(
            listOf(
                Comment(issueId = issues.getValue("featureWork").id, authorId = adminId, body = "Use Issue as the single execution object and move planning concerns into projects, views, and parent issues.", createdAt = now.minusDays(1), updatedAt = now.minusDays(1)),
                Comment(docId = doc.id, authorId = analystId, body = "The baseline now describes projects and views instead of legacy planning containers.", createdAt = now.minusHours(20), updatedAt = now.minusHours(20))
            )
        )
    }

    private fun seedActivity(
        now: LocalDateTime,
        adminId: Long,
        issueId: Long,
        activityRepository: ActivityEventRepository,
        notificationRepository: NotificationRepository
    ) {
        val activity = activityRepository.save(
            ActivityEvent(
                actorId = adminId,
                entityType = "ISSUE",
                entityId = issueId,
                actionType = "UPDATED",
                summary = "Unified work item feature seeded with view-oriented planning metadata.",
                payloadJson = """{"track":"work-management","state":"IN_PROGRESS"}""",
                createdAt = now.minusHours(10)
            )
        )
        notificationRepository.save(
            Notification(
                userId = adminId,
                eventId = activity.id,
                type = "SYSTEM",
                title = "Seed data initialized",
                body = "The workspace now includes organization, views, execution, and collaboration sample records.",
                createdAt = now.minusHours(10)
            )
        )
    }
}
