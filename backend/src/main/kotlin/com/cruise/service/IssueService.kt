package com.cruise.service

import com.cruise.entity.Defect
import com.cruise.entity.Issue
import com.cruise.entity.LegacyIssueMapping
import com.cruise.entity.Requirement
import com.cruise.entity.Task
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.cruise.repository.DefectRepository
import com.cruise.repository.IssueRepository
import com.cruise.repository.LegacyIssueMappingRepository
import com.cruise.repository.RequirementRepository
import com.cruise.repository.TaskRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDate
import java.time.LocalDateTime

data class IssueDto(
    val id: Long,
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
    val createdAt: String,
    val updatedAt: String
)

data class IssueQuery(
    val type: String? = null,
    val projectId: Long? = null,
    val assigneeId: Long? = null,
    val parentIssueId: Long? = null,
    val state: String? = null,
    val q: String? = null
)

data class CreateIssueRequest(
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
    val legacyPayload: String? = null
)

data class UpdateIssueRequest(
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
    val legacyPayload: String? = null
)

@Service
class IssueService(
    private val issueRepository: IssueRepository,
    private val legacyIssueMappingRepository: LegacyIssueMappingRepository,
    private val requirementRepository: RequirementRepository,
    private val taskRepository: TaskRepository,
    private val defectRepository: DefectRepository
) {
    private val objectMapper = jacksonObjectMapper()

    fun findAll(query: IssueQuery = IssueQuery()): List<IssueDto> =
        issueRepository.findAll()
            .asSequence()
            .filter { query.type == null || it.type == query.type }
            .filter { query.projectId == null || it.projectId == query.projectId }
            .filter { query.assigneeId == null || it.assigneeId == query.assigneeId }
            .filter { query.parentIssueId == null || it.parentIssueId == query.parentIssueId }
            .filter { query.state == null || it.state == query.state }
            .filter {
                query.q.isNullOrBlank() || listOfNotNull(it.title, it.description)
                    .any { text -> text.contains(query.q, ignoreCase = true) }
            }
            .sortedBy { it.id }
            .map { it.toDto() }
            .toList()

    fun findById(id: Long): IssueDto = getIssue(id).toDto()

    fun getIssue(id: Long): Issue = issueRepository.findById(id)
        .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Issue not found") }

    fun create(request: CreateIssueRequest): IssueDto {
        val saved = issueRepository.save(
            Issue(
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

        if (request.sourceType != null && request.sourceId != null) {
            saveMapping(request.sourceType, request.sourceId, saved.id)
        }

        return saved.toDto()
    }

    fun update(id: Long, request: UpdateIssueRequest): IssueDto {
        val issue = getIssue(id)
        val updated = Issue(
            id = issue.id,
            identifier = issue.identifier,
            type = issue.type,
            title = request.title ?: issue.title,
            description = request.description ?: issue.description,
            state = request.state ?: issue.state,
            priority = request.priority ?: issue.priority,
            projectId = issue.projectId,
            teamId = request.teamId ?: issue.teamId,
            parentIssueId = request.parentIssueId ?: issue.parentIssueId,
            assigneeId = request.assigneeId ?: issue.assigneeId,
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
        return issueRepository.save(updated).toDto()
    }

    fun updateState(id: Long, state: String): IssueDto {
        val issue = getIssue(id)
        return issueRepository.save(
            Issue(
                id = issue.id,
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
        ).toDto()
    }

    fun delete(id: Long) {
        issueRepository.delete(getIssue(id))
    }

    fun migrateLegacyData() {
        if (issueRepository.count() > 0L) return

        val requirementIdMap = mutableMapOf<Long, Long>()
        val taskIdMap = mutableMapOf<Long, Long>()

        requirementRepository.findAll().sortedBy { it.id }.forEach { requirement ->
            val issue = issueRepository.save(
                Issue(
                    identifier = nextIdentifier(),
                    type = "FEATURE",
                    title = requirement.title,
                    description = requirement.description,
                    state = issueStateFromRequirementStatus(requirement.status),
                    priority = issuePriorityFromLegacy(requirement.priority),
                    projectId = requirement.projectId,
                    teamId = requirement.teamId,
                    assigneeId = requirement.requirementOwnerId,
                    progress = requirement.progress,
                    plannedStartDate = requirement.plannedStartDate,
                    plannedEndDate = requirement.expectedDeliveryDate,
                    sourceType = "REQUIREMENT",
                    sourceId = requirement.id,
                    legacyPayload = buildRequirementLegacyPayload(requirement),
                    createdAt = requirement.createdAt,
                    updatedAt = requirement.updatedAt
                )
            )
            requirementIdMap[requirement.id] = issue.id
            saveMapping("REQUIREMENT", requirement.id, issue.id)
        }

        taskRepository.findAll().sortedBy { it.id }.forEach { task ->
            val issue = issueRepository.save(
                Issue(
                    identifier = nextIdentifier(),
                    type = "TASK",
                    title = task.title,
                    description = task.description,
                    state = issueStateFromTaskStatus(task.status),
                    priority = "MEDIUM",
                    projectId = requirementIdMap[task.requirementId]?.let { getIssue(it).projectId } ?: 1L,
                    teamId = task.teamId,
                    parentIssueId = requirementIdMap[task.requirementId],
                    assigneeId = task.assigneeId,
                    progress = task.progress,
                    plannedStartDate = task.plannedStartDate,
                    plannedEndDate = task.plannedEndDate,
                    estimatedHours = task.estimatedHours,
                    actualHours = task.actualHours,
                    sourceType = "TASK",
                    sourceId = task.id,
                    legacyPayload = buildTaskLegacyPayload(task),
                    createdAt = task.createdAt,
                    updatedAt = task.updatedAt
                )
            )
            taskIdMap[task.id] = issue.id
            saveMapping("TASK", task.id, issue.id)
        }

        defectRepository.findAll().sortedBy { it.id }.forEach { defect ->
            val issue = issueRepository.save(
                Issue(
                    identifier = nextIdentifier(),
                    type = "BUG",
                    title = defect.title,
                    description = defect.description,
                    state = issueStateFromDefectStatus(defect.status),
                    priority = issuePriorityFromSeverity(defect.severity),
                    projectId = defect.projectId,
                    parentIssueId = defect.taskId?.let { taskIdMap[it] },
                    reporterId = defect.reporterId,
                    severity = defect.severity,
                    sourceType = "DEFECT",
                    sourceId = defect.id,
                    legacyPayload = defect.taskId?.let { """{"taskId":$it}""" },
                    createdAt = defect.createdAt,
                    updatedAt = defect.updatedAt
                )
            )
            saveMapping("DEFECT", defect.id, issue.id)
        }
    }

    fun toRequirementDto(issue: Issue): RequirementDto =
        legacyPayloadAsRequirement(issue).run {
            RequirementDto(
        id = issue.id,
        title = issue.title,
        description = issue.description,
        status = requirementStatusFromIssueState(issue.state),
        priority = legacyRequirementPriority(issue.priority),
        projectId = issue.projectId,
        teamId = issue.teamId,
        plannedStartDate = issue.plannedStartDate?.toString(),
        expectedDeliveryDate = issue.plannedEndDate?.toString(),
        requirementOwnerId = issue.assigneeId,
        productOwnerId = productOwnerId,
        devOwnerId = devOwnerId,
        devParticipants = devParticipants,
        testOwnerId = testOwnerId,
        progress = issue.progress,
        tags = tags,
        estimatedDays = estimatedDays,
        plannedDays = plannedDays,
        gapDays = gapDays,
        gapBudget = gapBudget,
        actualDays = actualDays,
        applicationCodes = applicationCodes,
        vendors = vendors,
        vendorStaff = vendorStaff,
        createdBy = createdBy,
        createdAt = issue.createdAt.toString(),
        updatedAt = issue.updatedAt.toString()
            )
        }

    fun toTask(issue: Issue): Task =
        legacyPayloadAsTask(issue).run {
            Task(
        id = issue.id,
        title = issue.title,
        description = issue.description,
        status = taskStatusFromIssueState(issue.state),
        requirementId = issue.parentIssueId ?: 0,
        assigneeId = issue.assigneeId,
        progress = issue.progress,
        teamId = issue.teamId,
        plannedStartDate = issue.plannedStartDate,
        plannedEndDate = issue.plannedEndDate,
        estimatedDays = estimatedDays,
        plannedDays = plannedDays,
        remainingDays = remainingDays,
        estimatedHours = issue.estimatedHours,
        actualHours = issue.actualHours,
        createdAt = issue.createdAt,
        updatedAt = issue.updatedAt
            )
        }

    fun toDefect(issue: Issue): Defect = Defect(
        id = issue.id,
        title = issue.title,
        description = issue.description,
        severity = issue.severity ?: "MEDIUM",
        status = defectStatusFromIssueState(issue.state),
        projectId = issue.projectId,
        taskId = issue.parentIssueId,
        reporterId = issue.reporterId,
        createdAt = issue.createdAt,
        updatedAt = issue.updatedAt
    )

    private fun saveMapping(sourceType: String, sourceId: Long, issueId: Long) {
        if (!legacyIssueMappingRepository.existsBySourceTypeAndSourceId(sourceType, sourceId)) {
            legacyIssueMappingRepository.save(LegacyIssueMapping(sourceType = sourceType, sourceId = sourceId, issueId = issueId))
        }
    }

    private fun Issue.toDto(): IssueDto = IssueDto(
        id = id,
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
        createdAt = createdAt.toString(),
        updatedAt = updatedAt.toString()
    )

    private fun parseDate(value: String?): LocalDate? = value?.let { LocalDate.parse(it) }
    private fun nextIdentifier(): String = "ISSUE-${(issueRepository.findAll().maxOfOrNull { it.id } ?: 0L) + 1}"
    private fun defaultStateForType(type: String): String = if (type == "FEATURE") "BACKLOG" else "TODO"
    private fun defaultPriorityForType(type: String): String = if (type == "BUG") "HIGH" else "MEDIUM"
    private fun normalizeSeverity(type: String, severity: String?): String? = if (type == "BUG") severity ?: "MEDIUM" else null

    private fun issueStateFromRequirementStatus(status: String): String = when (status) {
        "NEW" -> "BACKLOG"
        "IN_PROGRESS" -> "IN_PROGRESS"
        "TESTING" -> "IN_REVIEW"
        "COMPLETED", "DONE" -> "DONE"
        "CANCELLED" -> "CANCELED"
        else -> "BACKLOG"
    }

    private fun issueStateFromTaskStatus(status: String): String = when (status) {
        "PENDING" -> "TODO"
        "IN_PROGRESS" -> "IN_PROGRESS"
        "COMPLETED", "DONE" -> "DONE"
        "CANCELLED" -> "CANCELED"
        else -> "TODO"
    }

    private fun issueStateFromDefectStatus(status: String): String = when (status) {
        "OPEN", "REOPENED" -> "TODO"
        "IN_PROGRESS" -> "IN_PROGRESS"
        "RESOLVED" -> "IN_REVIEW"
        "CLOSED" -> "DONE"
        else -> "TODO"
    }

    private fun requirementStatusFromIssueState(state: String): String = when (state) {
        "BACKLOG", "TODO" -> "NEW"
        "IN_PROGRESS" -> "IN_PROGRESS"
        "IN_REVIEW" -> "TESTING"
        "DONE" -> "COMPLETED"
        "CANCELED" -> "CANCELLED"
        else -> "NEW"
    }

    private fun taskStatusFromIssueState(state: String): String = when (state) {
        "BACKLOG", "TODO" -> "PENDING"
        "IN_PROGRESS", "IN_REVIEW" -> "IN_PROGRESS"
        "DONE" -> "COMPLETED"
        "CANCELED" -> "CANCELLED"
        else -> "PENDING"
    }

    private fun defectStatusFromIssueState(state: String): String = when (state) {
        "BACKLOG", "TODO" -> "OPEN"
        "IN_PROGRESS" -> "IN_PROGRESS"
        "IN_REVIEW" -> "RESOLVED"
        "DONE", "CANCELED" -> "CLOSED"
        else -> "OPEN"
    }

    private fun issuePriorityFromLegacy(priority: String): String = if (priority == "CRITICAL") "URGENT" else priority.ifBlank { "MEDIUM" }
    private fun legacyRequirementPriority(priority: String): String = if (priority == "URGENT") "CRITICAL" else priority
    private fun issuePriorityFromSeverity(severity: String): String = when (severity) {
        "CRITICAL" -> "URGENT"
        "HIGH" -> "HIGH"
        "LOW" -> "LOW"
        else -> "MEDIUM"
    }

    private fun buildRequirementLegacyPayload(requirement: Requirement): String =
        """{"productOwnerId":${requirement.productOwnerId ?: "null"},"devOwnerId":${requirement.devOwnerId ?: "null"},"devParticipants":${jsonString(requirement.devParticipants)},"testOwnerId":${requirement.testOwnerId ?: "null"},"tags":${jsonString(requirement.tags)},"estimatedDays":${requirement.estimatedDays ?: "null"},"plannedDays":${requirement.plannedDays ?: "null"},"gapDays":${requirement.gapDays ?: "null"},"gapBudget":${requirement.gapBudget ?: "null"},"actualDays":${requirement.actualDays ?: "null"},"applicationCodes":${jsonString(requirement.applicationCodes)},"vendors":${jsonString(requirement.vendors)},"vendorStaff":${jsonString(requirement.vendorStaff)},"createdBy":${jsonString(requirement.createdBy)}}"""

    private fun buildTaskLegacyPayload(task: Task): String =
        """{"estimatedDays":${task.estimatedDays ?: "null"},"plannedDays":${task.plannedDays ?: "null"},"remainingDays":${task.remainingDays ?: "null"}}"""

    private fun jsonString(value: String?): String = value?.let { "\"${it.replace("\"", "\\\"")}\"" } ?: "null"

    private fun parseLegacyPayload(payload: String?): JsonNode? {
        if (payload.isNullOrBlank()) return null
        return runCatching { objectMapper.readTree(payload) }.getOrNull()
    }

    private fun legacyPayloadAsRequirement(issue: Issue): RequirementLegacyFields {
        val payload = parseLegacyPayload(issue.legacyPayload)
        return RequirementLegacyFields(
            productOwnerId = payload.long("productOwnerId"),
            devOwnerId = payload.long("devOwnerId"),
            devParticipants = payload.text("devParticipants"),
            testOwnerId = payload.long("testOwnerId"),
            tags = payload.text("tags"),
            estimatedDays = payload.float("estimatedDays"),
            plannedDays = payload.float("plannedDays"),
            gapDays = payload.float("gapDays"),
            gapBudget = payload.float("gapBudget"),
            actualDays = payload.float("actualDays"),
            applicationCodes = payload.text("applicationCodes"),
            vendors = payload.text("vendors"),
            vendorStaff = payload.text("vendorStaff"),
            createdBy = payload.text("createdBy")
        )
    }

    private fun legacyPayloadAsTask(issue: Issue): TaskLegacyFields {
        val payload = parseLegacyPayload(issue.legacyPayload)
        return TaskLegacyFields(
            estimatedDays = payload.float("estimatedDays"),
            plannedDays = payload.float("plannedDays"),
            remainingDays = payload.float("remainingDays")
        )
    }

    private fun JsonNode?.text(field: String): String? =
        this?.get(field)?.takeUnless { it.isNull }?.asText()

    private fun JsonNode?.long(field: String): Long? =
        this?.get(field)?.takeUnless { it.isNull }?.asLong()

    private fun JsonNode?.float(field: String): Float? =
        this?.get(field)?.takeUnless { it.isNull }?.asDouble()?.toFloat()
}

private data class RequirementLegacyFields(
    val productOwnerId: Long? = null,
    val devOwnerId: Long? = null,
    val devParticipants: String? = null,
    val testOwnerId: Long? = null,
    val tags: String? = null,
    val estimatedDays: Float? = null,
    val plannedDays: Float? = null,
    val gapDays: Float? = null,
    val gapBudget: Float? = null,
    val actualDays: Float? = null,
    val applicationCodes: String? = null,
    val vendors: String? = null,
    val vendorStaff: String? = null,
    val createdBy: String? = null
)

private data class TaskLegacyFields(
    val estimatedDays: Float? = null,
    val plannedDays: Float? = null,
    val remainingDays: Float? = null
)
