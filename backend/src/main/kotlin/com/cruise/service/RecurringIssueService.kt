package com.cruise.service

import com.cruise.entity.RecurringIssueDefinition
import com.cruise.repository.RecurringIssueDefinitionRepository
import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.http.HttpStatus
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.DayOfWeek
import java.time.LocalDateTime

data class RecurringIssueDto(
    val id: Long,
    val organizationId: Long,
    val teamId: Long?,
    val projectId: Long,
    val templateId: Long?,
    val name: String,
    val title: String?,
    val description: String?,
    val type: String,
    val state: String?,
    val priority: String?,
    val assigneeId: Long?,
    val estimatePoints: Int?,
    val cadenceType: String,
    val cadenceInterval: Int,
    val weekdays: List<String>,
    val nextRunAt: String,
    val active: Boolean,
    val customFields: Map<String, Any?>,
    val legacyPayload: String?,
    val createdAt: String,
    val updatedAt: String
)

data class SaveRecurringIssueRequest(
    val organizationId: Long? = null,
    val teamId: Long? = null,
    val projectId: Long,
    val templateId: Long? = null,
    val name: String,
    val title: String? = null,
    val description: String? = null,
    val type: String = "TASK",
    val state: String? = null,
    val priority: String? = null,
    val assigneeId: Long? = null,
    val estimatePoints: Int? = null,
    val cadenceType: String = "DAILY",
    val cadenceInterval: Int = 1,
    val weekdays: List<String>? = null,
    val nextRunAt: String,
    val active: Boolean = true,
    val customFields: Map<String, Any?>? = null,
    val legacyPayload: String? = null
)

@Service
class RecurringIssueService(
    private val recurringIssueDefinitionRepository: RecurringIssueDefinitionRepository,
    private val issueService: IssueService,
    private val issueTemplateService: IssueTemplateService,
    private val objectMapper: ObjectMapper
) {
    fun findAll(): List<RecurringIssueDto> =
        recurringIssueDefinitionRepository.findAll().sortedBy { it.id }.map(::toDto)

    fun findById(id: Long): RecurringIssueDto = toDto(getDefinition(id))

    fun create(request: SaveRecurringIssueRequest): RecurringIssueDto =
        recurringIssueDefinitionRepository.save(toEntity(RecurringIssueDefinition(), request)).let(::toDto)

    fun update(id: Long, request: SaveRecurringIssueRequest): RecurringIssueDto =
        recurringIssueDefinitionRepository.save(toEntity(getDefinition(id), request)).let(::toDto)

    fun delete(id: Long) {
        recurringIssueDefinitionRepository.delete(getDefinition(id))
    }

    fun trigger(id: Long): IssueDto = triggerDefinition(getDefinition(id))

    @Scheduled(fixedDelay = 60000)
    fun processDueDefinitions() {
        recurringIssueDefinitionRepository.findByActiveTrueAndNextRunAtLessThanEqual(LocalDateTime.now())
            .forEach(::triggerDefinition)
    }

    private fun triggerDefinition(definition: RecurringIssueDefinition): IssueDto {
        val template = definition.templateId?.let { issueTemplateService.findById(it) }
        val issue = issueService.create(
            CreateIssueRequest(
                organizationId = definition.organizationId,
                type = template?.type ?: definition.type,
                title = template?.title ?: definition.title ?: definition.name,
                description = template?.description ?: definition.description,
                state = template?.state ?: definition.state,
                priority = template?.priority ?: definition.priority,
                projectId = template?.projectId ?: definition.projectId,
                teamId = template?.teamId ?: definition.teamId,
                assigneeId = template?.assigneeId ?: definition.assigneeId,
                estimatePoints = template?.estimatePoints ?: definition.estimatePoints,
                plannedStartDate = template?.plannedStartDate,
                plannedEndDate = template?.plannedEndDate,
                sourceType = "RECURRING",
                sourceId = definition.id,
                legacyPayload = template?.legacyPayload ?: definition.legacyPayload,
                customFields = template?.customFields ?: readMap(definition.customFieldsJson)
            )
        )
        definition.nextRunAt = advanceNextRun(definition.nextRunAt, definition.cadenceType, definition.cadenceInterval, definition.weekdaysCsv)
        definition.updatedAt = LocalDateTime.now()
        recurringIssueDefinitionRepository.save(definition)
        return issue
    }

    private fun getDefinition(id: Long): RecurringIssueDefinition = recurringIssueDefinitionRepository.findById(id)
        .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Recurring issue definition not found") }

    private fun toEntity(current: RecurringIssueDefinition, request: SaveRecurringIssueRequest): RecurringIssueDefinition =
        RecurringIssueDefinition(
            id = current.id,
            organizationId = request.organizationId ?: current.organizationId,
            teamId = normalizeNullable(request.teamId, current.teamId),
            projectId = request.projectId,
            templateId = normalizeNullable(request.templateId, current.templateId),
            name = request.name,
            title = request.title ?: current.title,
            description = request.description ?: current.description,
            type = request.type,
            state = request.state ?: current.state,
            priority = request.priority ?: current.priority,
            assigneeId = normalizeNullable(request.assigneeId, current.assigneeId),
            estimatePoints = request.estimatePoints ?: current.estimatePoints,
            cadenceType = request.cadenceType,
            cadenceInterval = request.cadenceInterval.coerceAtLeast(1),
            weekdaysCsv = request.weekdays?.joinToString(","),
            nextRunAt = LocalDateTime.parse(request.nextRunAt),
            active = request.active,
            customFieldsJson = if (request.customFields != null) objectMapper.writeValueAsString(request.customFields) else current.customFieldsJson,
            legacyPayload = request.legacyPayload ?: current.legacyPayload,
            createdAt = current.createdAt.takeIf { current.id != 0L } ?: LocalDateTime.now(),
            updatedAt = LocalDateTime.now()
        )

    private fun toDto(definition: RecurringIssueDefinition) = RecurringIssueDto(
        id = definition.id,
        organizationId = definition.organizationId,
        teamId = definition.teamId,
        projectId = definition.projectId,
        templateId = definition.templateId,
        name = definition.name,
        title = definition.title,
        description = definition.description,
        type = definition.type,
        state = definition.state,
        priority = definition.priority,
        assigneeId = definition.assigneeId,
        estimatePoints = definition.estimatePoints,
        cadenceType = definition.cadenceType,
        cadenceInterval = definition.cadenceInterval,
        weekdays = definition.weekdaysCsv?.split(",")?.filter { it.isNotBlank() } ?: emptyList(),
        nextRunAt = definition.nextRunAt.toString(),
        active = definition.active,
        customFields = readMap(definition.customFieldsJson),
        legacyPayload = definition.legacyPayload,
        createdAt = definition.createdAt.toString(),
        updatedAt = definition.updatedAt.toString()
    )

    private fun readMap(value: String?): Map<String, Any?> =
        if (value.isNullOrBlank()) emptyMap() else objectMapper.readValue(value, object : TypeReference<Map<String, Any?>>() {})

    private fun normalizeNullable(requestValue: Long?, currentValue: Long?): Long? =
        when {
            requestValue == null -> currentValue
            requestValue <= 0 -> null
            else -> requestValue
        }

    private fun advanceNextRun(current: LocalDateTime, cadenceType: String, interval: Int, weekdaysCsv: String?): LocalDateTime =
        when (cadenceType.uppercase()) {
            "WEEKLY" -> {
                val weekdays = weekdaysCsv?.split(",")
                    ?.mapNotNull { runCatching { DayOfWeek.valueOf(it.trim().uppercase()) }.getOrNull() }
                    .orEmpty()
                if (weekdays.isEmpty()) current.plusWeeks(interval.toLong()) else {
                    var next = current.plusDays(1)
                    while (next.dayOfWeek !in weekdays) {
                        next = next.plusDays(1)
                    }
                    next
                }
            }
            "MONTHLY" -> current.plusMonths(interval.toLong())
            else -> current.plusDays(interval.toLong())
        }
}
