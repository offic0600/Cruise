package com.cruise.service

import com.cruise.entity.IssueDraft
import com.cruise.repository.IssueDraftRepository
import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDate
import java.time.LocalDateTime

data class IssueDraftDto(
    val id: Long,
    val organizationId: Long,
    val teamId: Long?,
    val projectId: Long?,
    val templateId: Long?,
    val title: String?,
    val description: String?,
    val type: String,
    val state: String?,
    val priority: String?,
    val assigneeId: Long?,
    val parentIssueId: Long?,
    val estimatePoints: Int?,
    val plannedStartDate: String?,
    val plannedEndDate: String?,
    val labelIds: List<Long>,
    val status: String,
    val customFields: Map<String, Any?>,
    val attachmentsPending: List<Map<String, Any?>>,
    val createdAt: String,
    val updatedAt: String
)

data class IssueDraftQuery(
    val organizationId: Long? = null,
    val teamId: Long? = null,
    val status: String? = null
)

data class SaveIssueDraftRequest(
    val organizationId: Long? = null,
    val teamId: Long? = null,
    val projectId: Long? = null,
    val templateId: Long? = null,
    val title: String? = null,
    val description: String? = null,
    val type: String = "TASK",
    val state: String? = null,
    val priority: String? = null,
    val assigneeId: Long? = null,
    val parentIssueId: Long? = null,
    val estimatePoints: Int? = null,
    val plannedStartDate: String? = null,
    val plannedEndDate: String? = null,
    val labelIds: List<Long>? = null,
    val status: String = "SAVED_DRAFT",
    val customFields: Map<String, Any?>? = null,
    val attachmentsPending: List<Map<String, Any?>>? = null
)

@Service
class IssueDraftService(
    private val issueDraftRepository: IssueDraftRepository,
    private val labelService: LabelService,
    private val objectMapper: ObjectMapper
) {
    fun findAll(query: IssueDraftQuery = IssueDraftQuery()): List<IssueDraftDto> =
        issueDraftRepository.findAll()
            .asSequence()
            .filter { query.organizationId == null || it.organizationId == query.organizationId }
            .filter { query.teamId == null || it.teamId == query.teamId }
            .filter { query.status == null || it.status == query.status }
            .sortedByDescending { it.updatedAt }
            .map(::toDto)
            .toList()

    fun findById(id: Long): IssueDraftDto = toDto(getDraft(id))

    fun create(request: SaveIssueDraftRequest): IssueDraftDto =
        issueDraftRepository.save(toEntity(IssueDraft(), request)).let(::toDto)

    fun update(id: Long, request: SaveIssueDraftRequest): IssueDraftDto =
        issueDraftRepository.save(toEntity(getDraft(id), request)).let(::toDto)

    fun delete(id: Long) {
        issueDraftRepository.delete(getDraft(id))
    }

    private fun getDraft(id: Long): IssueDraft = issueDraftRepository.findById(id)
        .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Issue draft not found") }

    private fun toEntity(current: IssueDraft, request: SaveIssueDraftRequest): IssueDraft =
        IssueDraft(
            id = current.id,
            organizationId = request.organizationId ?: current.organizationId,
            teamId = normalizeNullable(request.teamId, current.teamId),
            projectId = normalizeNullable(request.projectId, current.projectId),
            templateId = normalizeNullable(request.templateId, current.templateId),
            title = request.title ?: current.title,
            description = request.description ?: current.description,
            type = request.type,
            state = request.state ?: current.state,
            priority = request.priority ?: current.priority,
            assigneeId = normalizeNullable(request.assigneeId, current.assigneeId),
            parentIssueId = normalizeNullable(request.parentIssueId, current.parentIssueId),
            estimatePoints = request.estimatePoints ?: current.estimatePoints,
            plannedStartDate = parseDate(request.plannedStartDate) ?: current.plannedStartDate,
            plannedEndDate = parseDate(request.plannedEndDate) ?: current.plannedEndDate,
            labelIdsJson = if (request.labelIds != null) labelService.writeLabelIdsJson(request.labelIds) else current.labelIdsJson,
            status = request.status,
            customFieldsJson = if (request.customFields != null) writeJson(request.customFields) else current.customFieldsJson,
            attachmentsPendingJson = if (request.attachmentsPending != null) writeJson(request.attachmentsPending) else current.attachmentsPendingJson,
            createdAt = current.createdAt.takeIf { current.id != 0L } ?: LocalDateTime.now(),
            updatedAt = LocalDateTime.now()
        )

    private fun toDto(draft: IssueDraft) = IssueDraftDto(
        id = draft.id,
        organizationId = draft.organizationId,
        teamId = draft.teamId,
        projectId = draft.projectId,
        templateId = draft.templateId,
        title = draft.title,
        description = draft.description,
        type = draft.type,
        state = draft.state,
        priority = draft.priority,
        assigneeId = draft.assigneeId,
        parentIssueId = draft.parentIssueId,
        estimatePoints = draft.estimatePoints,
        plannedStartDate = draft.plannedStartDate?.toString(),
        plannedEndDate = draft.plannedEndDate?.toString(),
        labelIds = labelService.readLabelIdsJson(draft.labelIdsJson),
        status = draft.status,
        customFields = readMap(draft.customFieldsJson),
        attachmentsPending = readAttachmentList(draft.attachmentsPendingJson),
        createdAt = draft.createdAt.toString(),
        updatedAt = draft.updatedAt.toString()
    )

    private fun parseDate(value: String?): LocalDate? = value?.takeIf { it.isNotBlank() }?.let(LocalDate::parse)
    private fun writeJson(value: Any): String = objectMapper.writeValueAsString(value)
    private fun readMap(value: String?): Map<String, Any?> =
        if (value.isNullOrBlank()) emptyMap() else objectMapper.readValue(value, object : TypeReference<Map<String, Any?>>() {})

    private fun readAttachmentList(value: String?): List<Map<String, Any?>> =
        if (value.isNullOrBlank()) emptyList() else objectMapper.readValue(value, object : TypeReference<List<Map<String, Any?>>>() {})

    private fun normalizeNullable(requestValue: Long?, currentValue: Long?): Long? =
        when {
            requestValue == null -> currentValue
            requestValue <= 0 -> null
            else -> requestValue
        }
}
