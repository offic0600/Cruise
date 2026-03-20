package com.cruise.service

import com.cruise.entity.Issue
import com.cruise.repository.IssueRepository
import com.cruise.repository.ProjectRepository
import com.cruise.repository.UserRepository
import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.http.HttpStatus
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDate
import java.time.LocalDateTime

data class IssueDto(
    val id: Long,
    val organizationId: Long,
    val identifier: String,
    val type: String,
    val title: String,
    val description: String?,
    val state: String,
    val stateCategory: String,
    val resolution: String?,
    val priority: String,
    val projectId: Long?,
    val teamId: Long?,
    val parentIssueId: Long?,
    val assigneeId: Long?,
    val reporterId: Long?,
    val estimatePoints: Int?,
    val progress: Int,
    val plannedStartDate: String?,
    val plannedEndDate: String?,
    val estimatedHours: Float,
    val actualHours: Float,
    val severity: String?,
    val sourceType: String,
    val sourceId: Long?,
    val labels: List<LabelDto>,
    val customFields: Map<String, Any?>,
    val customFieldDefinitions: List<CustomFieldDefinitionDto>? = null,
    val createdAt: String,
    val updatedAt: String,
    val archivedAt: String?
)

data class IssueQuery(
    val type: String? = null,
    val organizationId: Long? = null,
    val teamId: Long? = null,
    val projectId: Long? = null,
    val assigneeId: Long? = null,
    val parentIssueId: Long? = null,
    val state: String? = null,
    val priority: String? = null,
    val q: String? = null,
    val customFieldFilters: Map<String, Any?> = emptyMap(),
    val includeArchived: Boolean = false,
    val page: Int = 0,
    val size: Int = 50
)

data class CreateIssueRequest(
    val organizationId: Long? = null,
    val type: String,
    val title: String,
    val description: String? = null,
    val state: String? = null,
    val resolution: String? = null,
    val priority: String? = null,
    val projectId: Long? = null,
    val teamId: Long? = null,
    val parentIssueId: Long? = null,
    val assigneeId: Long? = null,
    val reporterId: Long? = null,
    val estimatePoints: Int? = null,
    val progress: Int? = 0,
    val plannedStartDate: String? = null,
    val plannedEndDate: String? = null,
    val estimatedHours: Float? = 0f,
    val actualHours: Float? = 0f,
    val severity: String? = null,
    val sourceType: String? = null,
    val sourceId: Long? = null,
    val labelIds: List<Long>? = null,
    val customFields: Map<String, Any?>? = null
)

data class UpdateIssueRequest(
    val organizationId: Long? = null,
    val projectId: Long? = null,
    val title: String? = null,
    val description: String? = null,
    val state: String? = null,
    val resolution: String? = null,
    val priority: String? = null,
    val teamId: Long? = null,
    val parentIssueId: Long? = null,
    val assigneeId: Long? = null,
    val reporterId: Long? = null,
    val estimatePoints: Int? = null,
    val progress: Int? = null,
    val plannedStartDate: String? = null,
    val plannedEndDate: String? = null,
    val estimatedHours: Float? = null,
    val actualHours: Float? = null,
    val severity: String? = null,
    val labelIds: List<Long>? = null,
    val customFields: Map<String, Any?>? = null
)

private data class IssueActivitySnapshot(
    val state: String,
    val assigneeId: Long?,
    val priority: String,
    val projectId: Long?
)

@Service
@Transactional
open class IssueService(
    private val issueRepository: IssueRepository,
    private val issueCustomFieldService: IssueCustomFieldService,
    private val labelService: LabelService,
    private val activityEventService: ActivityEventService,
    private val userRepository: UserRepository,
    private val projectRepository: ProjectRepository,
    private val objectMapper: ObjectMapper
) {
    fun findAll(query: IssueQuery = IssueQuery()): RestPageResponse<IssueDto> =
        issueRepository.findAll()
            .asSequence()
            .filter { query.type == null || it.type == query.type }
            .filter { query.organizationId == null || it.organizationId == query.organizationId }
            .filter { query.teamId == null || it.teamId == query.teamId }
            .filter { query.projectId == null || it.projectId == query.projectId }
            .filter { query.assigneeId == null || it.assigneeId == query.assigneeId }
            .filter { query.parentIssueId == null || it.parentIssueId == query.parentIssueId }
            .filter { query.state == null || it.state == query.state }
            .filter { query.priority == null || it.priority == query.priority }
            .filter { query.includeArchived || it.archivedAt == null }
            .filter {
                query.q.isNullOrBlank() || listOfNotNull(it.identifier, it.title, it.description)
                    .any { text -> text.contains(query.q, ignoreCase = true) }
            }
            .sortedBy { it.id }
            .toList()
            .let { issues ->
                val customValues = issueCustomFieldService.getValuesForIssues(issues)
                val labelsByIssue = labelService.getLabelsForIssues(issues.map { it.id })
                issues
                    .filter { issue ->
                        query.customFieldFilters.isEmpty() || issueCustomFieldService.matchesFilters(
                            customValues[issue.id].orEmpty(),
                            query.customFieldFilters
                        )
                    }
                    .map { issue -> issue.toDto(customValues[issue.id].orEmpty(), labels = labelsByIssue[issue.id].orEmpty()) }
            }
            .toList()
            .toRestPage(query.page, query.size)

    fun findById(id: Long): IssueDto {
        val issue = getIssue(id)
        return issue.toDto(
            customFields = issueCustomFieldService.getValuesForIssue(issue),
            labels = labelService.getLabelsForIssues(listOf(issue.id))[issue.id].orEmpty(),
            customFieldDefinitions = issueCustomFieldService.getDefinitionsForIssue(issue)
        )
    }

    fun getIssue(id: Long): Issue = issueRepository.findById(id)
        .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Issue not found") }

    @Transactional
    fun create(request: CreateIssueRequest): IssueDto {
        val normalizedParentIssueId = normalizeNullableReference(request.parentIssueId, null)
        validateParent(normalizedParentIssueId, request.projectId)
        val saved = issueRepository.save(
            Issue(
                organizationId = request.organizationId
                    ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "organizationId is required"),
                identifier = nextIdentifier(),
                type = request.type,
                title = request.title,
                description = request.description,
                state = request.state ?: defaultStateForType(request.type),
                resolution = normalizeResolution(
                    state = request.state ?: defaultStateForType(request.type),
                    resolution = request.resolution
                ),
                priority = request.priority ?: defaultPriorityForType(request.type),
                projectId = request.projectId,
                teamId = request.teamId,
                parentIssueId = normalizedParentIssueId,
                assigneeId = request.assigneeId,
                reporterId = request.reporterId,
                estimatePoints = request.estimatePoints,
                progress = request.progress ?: 0,
                plannedStartDate = parseDate(request.plannedStartDate),
                plannedEndDate = parseDate(request.plannedEndDate),
                estimatedHours = request.estimatedHours ?: 0f,
                actualHours = request.actualHours ?: 0f,
                severity = normalizeSeverity(request.type, request.severity),
                sourceType = request.sourceType ?: "NATIVE",
                sourceId = request.sourceId,
                archivedAt = null
            )
        )
        issueCustomFieldService.replaceIssueValues(saved, request.customFields)
        val actorId = request.reporterId ?: currentActorId()
        labelService.replaceIssueLabels(saved.id, saved.organizationId, saved.teamId, request.labelIds, actorId)
        recordIssueActivity(
            actorId = actorId,
            issueId = saved.id,
            actionType = "ISSUE_CREATED",
            summary = "created the issue"
        )
        return findById(saved.id)
    }

    @Transactional
    fun update(id: Long, request: UpdateIssueRequest): IssueDto {
        val issue = getIssue(id)
        val snapshot = issue.toActivitySnapshot()
        val previousLabels = labelService.getLabelsForIssues(listOf(issue.id))[issue.id].orEmpty()
        val nextProjectId = request.projectId ?: issue.projectId
        val nextParentIssueId = normalizeNullableReference(request.parentIssueId, issue.parentIssueId)
        validateParent(nextParentIssueId, nextProjectId)
        val updated = Issue(
            id = issue.id,
            organizationId = request.organizationId ?: issue.organizationId,
            identifier = issue.identifier,
            type = issue.type,
            title = request.title ?: issue.title,
            description = request.description ?: issue.description,
            state = request.state ?: issue.state,
            resolution = normalizeResolution(
                state = request.state ?: issue.state,
                resolution = request.resolution ?: issue.resolution
            ),
            priority = request.priority ?: issue.priority,
            projectId = nextProjectId,
            teamId = normalizeNullableReference(request.teamId, issue.teamId),
            parentIssueId = nextParentIssueId,
            assigneeId = normalizeNullableReference(request.assigneeId, issue.assigneeId),
            reporterId = request.reporterId ?: issue.reporterId,
            estimatePoints = request.estimatePoints ?: issue.estimatePoints,
            progress = request.progress ?: issue.progress,
            plannedStartDate = parseDate(request.plannedStartDate) ?: issue.plannedStartDate,
            plannedEndDate = parseDate(request.plannedEndDate) ?: issue.plannedEndDate,
            estimatedHours = request.estimatedHours ?: issue.estimatedHours,
            actualHours = request.actualHours ?: issue.actualHours,
            severity = normalizeSeverity(issue.type, request.severity ?: issue.severity),
            sourceType = issue.sourceType,
            sourceId = issue.sourceId,
            createdAt = issue.createdAt,
            updatedAt = LocalDateTime.now(),
            archivedAt = issue.archivedAt
        )
        val saved = issueRepository.save(updated)
        issueCustomFieldService.replaceIssueValues(saved, request.customFields ?: issueCustomFieldService.getValuesForIssue(issue))
        val actorId = request.reporterId ?: currentActorId() ?: saved.reporterId
        labelService.replaceIssueLabels(saved.id, saved.organizationId, saved.teamId, request.labelIds, actorId)
        recordUpdateEvents(
            before = snapshot,
            after = saved,
            previousLabels = previousLabels,
            nextLabels = labelService.getLabelsForIssues(listOf(saved.id))[saved.id].orEmpty(),
            actorId = actorId
        )
        return findById(saved.id)
    }

    fun updateState(id: Long, state: String, resolution: String? = null): IssueDto {
        val issue = getIssue(id)
        val previousState = issue.state
        val saved = issueRepository.save(
            Issue(
                id = issue.id,
                organizationId = issue.organizationId,
                identifier = issue.identifier,
                type = issue.type,
                title = issue.title,
                description = issue.description,
                state = state,
                resolution = normalizeResolution(state, resolution ?: issue.resolution),
                priority = issue.priority,
                projectId = issue.projectId,
                teamId = issue.teamId,
                parentIssueId = issue.parentIssueId,
                assigneeId = issue.assigneeId,
                reporterId = issue.reporterId,
                estimatePoints = issue.estimatePoints,
                progress = issue.progress,
                plannedStartDate = issue.plannedStartDate,
                plannedEndDate = issue.plannedEndDate,
                estimatedHours = issue.estimatedHours,
                actualHours = issue.actualHours,
                severity = issue.severity,
                sourceType = issue.sourceType,
                sourceId = issue.sourceId,
                createdAt = issue.createdAt,
                updatedAt = LocalDateTime.now(),
                archivedAt = issue.archivedAt
            )
        )
        if (previousState != saved.state) {
            recordIssueActivity(
                actorId = currentActorId() ?: saved.reporterId,
                issueId = saved.id,
                actionType = "ISSUE_STATE_CHANGED",
                summary = "moved from ${displayState(previousState)} to ${displayState(saved.state)}",
                payload = mapOf("from" to previousState, "to" to saved.state)
            )
        }
        return saved.toDto(
            customFields = issueCustomFieldService.getValuesForIssue(saved),
            labels = labelService.getLabelsForIssues(listOf(saved.id))[saved.id].orEmpty()
        )
    }

    @Transactional
    fun delete(id: Long) {
        val issue = getIssue(id)
        issueCustomFieldService.deleteIssueValues(issue.id)
        labelService.replaceIssueLabels(issue.id, issue.organizationId, issue.teamId, emptyList(), null)
        issueRepository.delete(issue)
    }

    private fun validateParent(parentIssueId: Long?, projectId: Long?) {
        if (parentIssueId == null) return
        val parent = getIssue(parentIssueId)
        if (parent.projectId != projectId) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Parent issue must belong to the same project")
        }
    }

    private fun Issue.toDto(
        customFields: Map<String, Any?> = emptyMap(),
        labels: List<LabelDto> = emptyList(),
        customFieldDefinitions: List<CustomFieldDefinitionDto>? = null
    ): IssueDto = IssueDto(
        id = id,
        organizationId = organizationId,
        identifier = identifier,
        type = type,
        title = title,
        description = description,
        state = state,
        stateCategory = stateCategoryFor(state),
        resolution = resolution ?: defaultResolutionForState(state),
        priority = priority,
        projectId = projectId,
        teamId = teamId,
        parentIssueId = parentIssueId,
        assigneeId = assigneeId,
        reporterId = reporterId,
        estimatePoints = estimatePoints,
        progress = progress,
        plannedStartDate = plannedStartDate?.toString(),
        plannedEndDate = plannedEndDate?.toString(),
        estimatedHours = estimatedHours,
        actualHours = actualHours,
        severity = severity,
        sourceType = sourceType,
        sourceId = sourceId,
        labels = labels,
        customFields = customFields,
        customFieldDefinitions = customFieldDefinitions,
        createdAt = createdAt.toString(),
        updatedAt = updatedAt.toString(),
        archivedAt = archivedAt?.toString()
    )

    private fun parseDate(value: String?): LocalDate? = value?.let { LocalDate.parse(it) }

    private fun nextIdentifier(): String =
        "ISSUE-${(issueRepository.findAll().maxOfOrNull { it.id } ?: 0L) + 1}"

    private fun defaultStateForType(type: String): String =
        if (type == "FEATURE") "BACKLOG" else "TODO"

    private fun defaultPriorityForType(type: String): String =
        if (type == "BUG") "HIGH" else "MEDIUM"

    private fun stateCategoryFor(state: String): String =
        when (state) {
            "BACKLOG" -> "BACKLOG"
            "TODO", "IN_PROGRESS" -> "ACTIVE"
            "IN_REVIEW" -> "REVIEW"
            "DONE" -> "COMPLETED"
            "CANCELED" -> "CANCELED"
            else -> "ACTIVE"
        }

    private fun normalizeResolution(state: String, resolution: String?): String? =
        when (state) {
            "DONE" -> "COMPLETED"
            "CANCELED" -> resolution?.takeIf { it in setOf("CANCELED", "DUPLICATE", "OBSOLETE", "WONT_DO") } ?: "CANCELED"
            else -> null
        }

    private fun defaultResolutionForState(state: String): String? =
        when (state) {
            "DONE" -> "COMPLETED"
            "CANCELED" -> "CANCELED"
            else -> null
        }

    private fun normalizeSeverity(type: String, severity: String?): String? =
        if (type == "BUG") severity ?: "MEDIUM" else null

    private fun normalizeNullableReference(requestValue: Long?, currentValue: Long?): Long? =
        when {
            requestValue == null -> currentValue
            requestValue <= 0 -> null
            else -> requestValue
        }

    fun parseCustomFieldFilters(raw: String?): Map<String, Any?> {
        if (raw.isNullOrBlank()) return emptyMap()
        return runCatching {
            objectMapper.readValue(raw, object : TypeReference<Map<String, Any?>>() {})
        }.getOrElse { emptyMap() }
    }

    private fun recordUpdateEvents(
        before: IssueActivitySnapshot,
        after: Issue,
        previousLabels: List<LabelDto>,
        nextLabels: List<LabelDto>,
        actorId: Long?
    ) {
        if (before.state != after.state) {
            recordIssueActivity(
                actorId = actorId,
                issueId = after.id,
                actionType = "ISSUE_STATE_CHANGED",
                summary = "moved from ${displayState(before.state)} to ${displayState(after.state)}",
                payload = mapOf("from" to before.state, "to" to after.state)
            )
        }
        if (before.assigneeId != after.assigneeId) {
            recordIssueActivity(
                actorId = actorId,
                issueId = after.id,
                actionType = "ISSUE_ASSIGNEE_CHANGED",
                summary = "changed assignee from ${displayAssignee(before.assigneeId)} to ${displayAssignee(after.assigneeId)}",
                payload = mapOf("from" to before.assigneeId, "to" to after.assigneeId)
            )
        }
        if (before.priority != after.priority) {
            recordIssueActivity(
                actorId = actorId,
                issueId = after.id,
                actionType = "ISSUE_PRIORITY_CHANGED",
                summary = "changed priority from ${displayPriority(before.priority)} to ${displayPriority(after.priority)}",
                payload = mapOf("from" to before.priority, "to" to after.priority)
            )
        }
        if (before.projectId != after.projectId) {
            recordIssueActivity(
                actorId = actorId,
                issueId = after.id,
                actionType = "ISSUE_PROJECT_CHANGED",
                summary = "changed project from ${displayProject(before.projectId)} to ${displayProject(after.projectId)}",
                payload = mapOf("from" to before.projectId, "to" to after.projectId)
            )
        }
        if (previousLabels.map { it.id } != nextLabels.map { it.id }) {
            recordIssueActivity(
                actorId = actorId,
                issueId = after.id,
                actionType = "ISSUE_LABELS_CHANGED",
                summary = "changed labels from ${displayLabels(previousLabels)} to ${displayLabels(nextLabels)}",
                payload = mapOf("from" to previousLabels.map { it.id }, "to" to nextLabels.map { it.id })
            )
        }
    }

    private fun recordIssueActivity(
        actorId: Long?,
        issueId: Long,
        actionType: String,
        summary: String,
        payload: Map<String, Any?>? = null
    ) {
        activityEventService.create(
            CreateActivityEventRequest(
                actorId = actorId,
                entityType = "ISSUE",
                entityId = issueId,
                actionType = actionType,
                summary = summary,
                payloadJson = payload?.let { objectMapper.writeValueAsString(it) }
            )
        )
    }

    private fun displayState(value: String): String = when (value) {
        "BACKLOG" -> "Backlog"
        "TODO" -> "Todo"
        "IN_PROGRESS" -> "In Progress"
        "IN_REVIEW" -> "In Review"
        "DONE" -> "Done"
        "CANCELED" -> "Canceled"
        else -> value.lowercase().replace('_', ' ').replaceFirstChar(Char::titlecase)
    }

    private fun displayPriority(value: String): String = when (value) {
        "LOW" -> "Low"
        "MEDIUM" -> "Medium"
        "HIGH" -> "High"
        "URGENT" -> "Urgent"
        else -> value.lowercase().replaceFirstChar(Char::titlecase)
    }

    private fun displayAssignee(userId: Long?): String =
        userId?.let {
            userRepository.findById(it).orElse(null)?.let { user ->
                user.displayName ?: user.username.ifBlank { user.email }
            }
        } ?: "Unassigned"

    private fun displayProject(projectId: Long?): String =
        projectId?.let { projectRepository.findById(it).orElse(null)?.name } ?: "No project"

    private fun displayLabels(labels: List<LabelDto>): String =
        if (labels.isEmpty()) "no labels" else labels.joinToString(", ") { it.name }

    private fun Issue.toActivitySnapshot() = IssueActivitySnapshot(
        state = state,
        assigneeId = assigneeId,
        priority = priority,
        projectId = projectId
    )

    private fun currentActorId(): Long? {
        val username = SecurityContextHolder.getContext().authentication?.name ?: return null
        return userRepository.findByUsername(username)?.id ?: userRepository.findByEmail(username)?.id
    }
}
