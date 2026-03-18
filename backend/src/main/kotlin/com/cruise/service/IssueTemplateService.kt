package com.cruise.service

import com.cruise.entity.IssueTemplate
import com.cruise.repository.IssueTemplateRepository
import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDate
import java.time.LocalDateTime

data class IssueTemplateDto(
    val id: Long,
    val organizationId: Long,
    val teamId: Long?,
    val projectId: Long?,
    val name: String,
    val title: String?,
    val description: String?,
    val type: String,
    val state: String?,
    val priority: String?,
    val assigneeId: Long?,
    val estimatePoints: Int?,
    val plannedStartDate: String?,
    val plannedEndDate: String?,
    val legacyPayload: String?,
    val customFields: Map<String, Any?>,
    val subIssues: List<String>,
    val createdAt: String,
    val updatedAt: String
)

data class IssueTemplateQuery(
    val organizationId: Long? = null,
    val teamId: Long? = null,
    val q: String? = null
)

data class CreateIssueTemplateRequest(
    val organizationId: Long? = null,
    val teamId: Long? = null,
    val projectId: Long? = null,
    val name: String,
    val title: String? = null,
    val description: String? = null,
    val type: String = "TASK",
    val state: String? = null,
    val priority: String? = null,
    val assigneeId: Long? = null,
    val estimatePoints: Int? = null,
    val plannedStartDate: String? = null,
    val plannedEndDate: String? = null,
    val legacyPayload: String? = null,
    val customFields: Map<String, Any?>? = null,
    val subIssues: List<String>? = null
)

data class UpdateIssueTemplateRequest(
    val teamId: Long? = null,
    val projectId: Long? = null,
    val name: String? = null,
    val title: String? = null,
    val description: String? = null,
    val type: String? = null,
    val state: String? = null,
    val priority: String? = null,
    val assigneeId: Long? = null,
    val estimatePoints: Int? = null,
    val plannedStartDate: String? = null,
    val plannedEndDate: String? = null,
    val legacyPayload: String? = null,
    val customFields: Map<String, Any?>? = null,
    val subIssues: List<String>? = null
)

@Service
class IssueTemplateService(
    private val issueTemplateRepository: IssueTemplateRepository,
    private val objectMapper: ObjectMapper
) {
    fun findAll(query: IssueTemplateQuery = IssueTemplateQuery()): List<IssueTemplateDto> =
        issueTemplateRepository.findAll()
            .asSequence()
            .filter { query.organizationId == null || it.organizationId == query.organizationId }
            .filter { query.teamId == null || it.teamId == query.teamId }
            .filter {
                query.q.isNullOrBlank() || listOfNotNull(it.name, it.title, it.description)
                    .any { text -> text.contains(query.q, ignoreCase = true) }
            }
            .sortedBy { it.id }
            .map(::toDto)
            .toList()

    fun findById(id: Long): IssueTemplateDto = toDto(getTemplate(id))

    fun create(request: CreateIssueTemplateRequest): IssueTemplateDto =
        issueTemplateRepository.save(
            IssueTemplate(
                organizationId = request.organizationId ?: 1L,
                teamId = request.teamId,
                projectId = request.projectId,
                name = request.name,
                title = request.title,
                description = request.description,
                type = request.type,
                state = request.state,
                priority = request.priority,
                assigneeId = request.assigneeId,
                estimatePoints = request.estimatePoints,
                plannedStartDate = parseDate(request.plannedStartDate),
                plannedEndDate = parseDate(request.plannedEndDate),
                legacyPayload = request.legacyPayload,
                customFieldsJson = writeJson(request.customFields ?: emptyMap<String, Any?>()),
                subIssuesJson = writeJson(request.subIssues ?: emptyList<String>())
            )
        ).let(::toDto)

    fun update(id: Long, request: UpdateIssueTemplateRequest): IssueTemplateDto {
        val template = getTemplate(id)
        return issueTemplateRepository.save(
            IssueTemplate(
                id = template.id,
                organizationId = template.organizationId,
                teamId = normalizeNullable(request.teamId, template.teamId),
                projectId = normalizeNullable(request.projectId, template.projectId),
                name = request.name ?: template.name,
                title = request.title ?: template.title,
                description = request.description ?: template.description,
                type = request.type ?: template.type,
                state = request.state ?: template.state,
                priority = request.priority ?: template.priority,
                assigneeId = normalizeNullable(request.assigneeId, template.assigneeId),
                estimatePoints = request.estimatePoints ?: template.estimatePoints,
                plannedStartDate = parseDate(request.plannedStartDate) ?: template.plannedStartDate,
                plannedEndDate = parseDate(request.plannedEndDate) ?: template.plannedEndDate,
                legacyPayload = request.legacyPayload ?: template.legacyPayload,
                customFieldsJson = if (request.customFields != null) writeJson(request.customFields) else template.customFieldsJson,
                subIssuesJson = if (request.subIssues != null) writeJson(request.subIssues) else template.subIssuesJson,
                createdAt = template.createdAt,
                updatedAt = LocalDateTime.now()
            )
        ).let(::toDto)
    }

    fun delete(id: Long) {
        issueTemplateRepository.delete(getTemplate(id))
    }

    fun getTemplate(id: Long): IssueTemplate = issueTemplateRepository.findById(id)
        .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Issue template not found") }

    private fun toDto(template: IssueTemplate) = IssueTemplateDto(
        id = template.id,
        organizationId = template.organizationId,
        teamId = template.teamId,
        projectId = template.projectId,
        name = template.name,
        title = template.title,
        description = template.description,
        type = template.type,
        state = template.state,
        priority = template.priority,
        assigneeId = template.assigneeId,
        estimatePoints = template.estimatePoints,
        plannedStartDate = template.plannedStartDate?.toString(),
        plannedEndDate = template.plannedEndDate?.toString(),
        legacyPayload = template.legacyPayload,
        customFields = readMap(template.customFieldsJson),
        subIssues = readList(template.subIssuesJson),
        createdAt = template.createdAt.toString(),
        updatedAt = template.updatedAt.toString()
    )

    private fun parseDate(value: String?): LocalDate? = value?.takeIf { it.isNotBlank() }?.let(LocalDate::parse)
    private fun writeJson(value: Any): String = objectMapper.writeValueAsString(value)
    private fun readMap(value: String?): Map<String, Any?> =
        if (value.isNullOrBlank()) emptyMap() else objectMapper.readValue(value, object : TypeReference<Map<String, Any?>>() {})
    private fun readList(value: String?): List<String> =
        if (value.isNullOrBlank()) emptyList() else objectMapper.readValue(value, object : TypeReference<List<String>>() {})

    private fun normalizeNullable(requestValue: Long?, currentValue: Long?): Long? =
        when {
            requestValue == null -> currentValue
            requestValue <= 0 -> null
            else -> requestValue
        }
}
