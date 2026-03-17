package com.cruise.service

import com.cruise.entity.Issue
import com.cruise.repository.IssueRepository
import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDate
import java.time.LocalDateTime

data class IssueDto(
    val id: Long,
    val organizationId: Long,
    val epicId: Long?,
    val sprintId: Long?,
    val identifier: String,
    val type: String,
    val title: String,
    val description: String?,
    val state: String,
    val priority: String,
    val projectId: Long,
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
    val legacyPayload: String?,
    val customFields: Map<String, Any?>,
    val customFieldDefinitions: List<CustomFieldDefinitionDto>? = null,
    val createdAt: String,
    val updatedAt: String
)

data class IssueQuery(
    val type: String? = null,
    val organizationId: Long? = null,
    val epicId: Long? = null,
    val sprintId: Long? = null,
    val projectId: Long? = null,
    val assigneeId: Long? = null,
    val parentIssueId: Long? = null,
    val state: String? = null,
    val priority: String? = null,
    val q: String? = null,
    val customFieldFilters: Map<String, Any?> = emptyMap()
)

data class CreateIssueRequest(
    val organizationId: Long? = null,
    val epicId: Long? = null,
    val sprintId: Long? = null,
    val type: String,
    val title: String,
    val description: String? = null,
    val state: String? = null,
    val priority: String? = null,
    val projectId: Long,
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
    val legacyPayload: String? = null,
    val customFields: Map<String, Any?>? = null
)

data class UpdateIssueRequest(
    val organizationId: Long? = null,
    val epicId: Long? = null,
    val sprintId: Long? = null,
    val projectId: Long? = null,
    val title: String? = null,
    val description: String? = null,
    val state: String? = null,
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
    val legacyPayload: String? = null,
    val customFields: Map<String, Any?>? = null
)

@Service
@Transactional
open class IssueService(
    private val issueRepository: IssueRepository,
    private val issueCustomFieldService: IssueCustomFieldService,
    private val objectMapper: ObjectMapper
) {
    fun findAll(query: IssueQuery = IssueQuery()): List<IssueDto> =
        issueRepository.findAll()
            .asSequence()
            .filter { query.type == null || it.type == query.type }
            .filter { query.organizationId == null || it.organizationId == query.organizationId }
            .filter { query.epicId == null || it.epicId == query.epicId }
            .filter { query.sprintId == null || it.sprintId == query.sprintId }
            .filter { query.projectId == null || it.projectId == query.projectId }
            .filter { query.assigneeId == null || it.assigneeId == query.assigneeId }
            .filter { query.parentIssueId == null || it.parentIssueId == query.parentIssueId }
            .filter { query.state == null || it.state == query.state }
            .filter { query.priority == null || it.priority == query.priority }
            .filter {
                query.q.isNullOrBlank() || listOfNotNull(it.title, it.description)
                    .any { text -> text.contains(query.q, ignoreCase = true) }
            }
            .sortedBy { it.id }
            .toList()
            .let { issues ->
                val customValues = issueCustomFieldService.getValuesForIssues(issues)
                issues
                    .filter { issue ->
                        query.customFieldFilters.isEmpty() || issueCustomFieldService.matchesFilters(
                            customValues[issue.id].orEmpty(),
                            query.customFieldFilters
                        )
                    }
                    .map { issue -> issue.toDto(customValues[issue.id].orEmpty()) }
            }
            .toList()

    fun findById(id: Long): IssueDto {
        val issue = getIssue(id)
        return issue.toDto(
            customFields = issueCustomFieldService.getValuesForIssue(issue),
            customFieldDefinitions = issueCustomFieldService.getDefinitionsForIssue(issue)
        )
    }

    fun getIssue(id: Long): Issue = issueRepository.findById(id)
        .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Issue not found") }

    @Transactional
    fun create(request: CreateIssueRequest): IssueDto {
        validateParent(request.parentIssueId, request.projectId)
        val saved = issueRepository.save(
            Issue(
                organizationId = request.organizationId ?: 1L,
                epicId = request.epicId,
                sprintId = request.sprintId,
                identifier = nextIdentifier(),
                type = request.type,
                title = request.title,
                description = request.description,
                state = request.state ?: defaultStateForType(request.type),
                priority = request.priority ?: defaultPriorityForType(request.type),
                projectId = request.projectId,
                teamId = request.teamId,
                parentIssueId = request.parentIssueId,
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
                legacyPayload = request.legacyPayload
            )
        )
        issueCustomFieldService.replaceIssueValues(saved, request.customFields)
        return findById(saved.id)
    }

    @Transactional
    fun update(id: Long, request: UpdateIssueRequest): IssueDto {
        val issue = getIssue(id)
        val nextProjectId = request.projectId ?: issue.projectId
        validateParent(request.parentIssueId, nextProjectId)
        val updated = Issue(
            id = issue.id,
            organizationId = request.organizationId ?: issue.organizationId,
            epicId = normalizeNullableReference(request.epicId, issue.epicId),
            sprintId = normalizeNullableReference(request.sprintId, issue.sprintId),
            identifier = issue.identifier,
            type = issue.type,
            title = request.title ?: issue.title,
            description = request.description ?: issue.description,
            state = request.state ?: issue.state,
            priority = request.priority ?: issue.priority,
            projectId = nextProjectId,
            teamId = normalizeNullableReference(request.teamId, issue.teamId),
            parentIssueId = normalizeNullableReference(request.parentIssueId, issue.parentIssueId),
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
            legacyPayload = request.legacyPayload ?: issue.legacyPayload,
            createdAt = issue.createdAt,
            updatedAt = LocalDateTime.now()
        )
        val saved = issueRepository.save(updated)
        issueCustomFieldService.replaceIssueValues(saved, request.customFields ?: issueCustomFieldService.getValuesForIssue(issue))
        return findById(saved.id)
    }

    fun updateState(id: Long, state: String): IssueDto {
        val issue = getIssue(id)
        val saved = issueRepository.save(
            Issue(
                id = issue.id,
                organizationId = issue.organizationId,
                epicId = issue.epicId,
                sprintId = issue.sprintId,
                identifier = issue.identifier,
                type = issue.type,
                title = issue.title,
                description = issue.description,
                state = state,
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
                legacyPayload = issue.legacyPayload,
                createdAt = issue.createdAt,
                updatedAt = LocalDateTime.now()
            )
        )
        return saved.toDto(issueCustomFieldService.getValuesForIssue(saved))
    }

    @Transactional
    fun delete(id: Long) {
        val issue = getIssue(id)
        issueCustomFieldService.deleteIssueValues(issue.id)
        issueRepository.delete(issue)
    }

    private fun validateParent(parentIssueId: Long?, projectId: Long) {
        if (parentIssueId == null) return
        val parent = getIssue(parentIssueId)
        if (parent.projectId != projectId) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Parent issue must belong to the same project")
        }
    }

    private fun Issue.toDto(
        customFields: Map<String, Any?> = emptyMap(),
        customFieldDefinitions: List<CustomFieldDefinitionDto>? = null
    ): IssueDto = IssueDto(
        id = id,
        organizationId = organizationId,
        epicId = epicId,
        sprintId = sprintId,
        identifier = identifier,
        type = type,
        title = title,
        description = description,
        state = state,
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
        legacyPayload = legacyPayload,
        customFields = customFields,
        customFieldDefinitions = customFieldDefinitions,
        createdAt = createdAt.toString(),
        updatedAt = updatedAt.toString()
    )

    private fun parseDate(value: String?): LocalDate? = value?.let { LocalDate.parse(it) }

    private fun nextIdentifier(): String =
        "ISSUE-${(issueRepository.findAll().maxOfOrNull { it.id } ?: 0L) + 1}"

    private fun defaultStateForType(type: String): String =
        if (type == "FEATURE") "BACKLOG" else "TODO"

    private fun defaultPriorityForType(type: String): String =
        if (type == "BUG") "HIGH" else "MEDIUM"

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
}
