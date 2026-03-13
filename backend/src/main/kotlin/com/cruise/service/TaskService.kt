package com.cruise.service

import com.cruise.entity.Task
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException

data class CreateTaskRequest(
    val title: String,
    val description: String? = null,
    val status: String = "PENDING",
    val requirementId: Long,
    val assigneeId: Long? = null,
    val progress: Int? = 0,
    val teamId: Long? = null,
    val plannedStartDate: String? = null,
    val plannedEndDate: String? = null,
    val estimatedDays: Float? = null,
    val plannedDays: Float? = null,
    val remainingDays: Float? = null,
    val estimatedHours: Float = 0f
)

data class UpdateTaskRequest(
    val title: String? = null,
    val description: String? = null,
    val status: String? = null,
    val assigneeId: Long? = null,
    val progress: Int? = null,
    val teamId: Long? = null,
    val plannedStartDate: String? = null,
    val plannedEndDate: String? = null,
    val estimatedDays: Float? = null,
    val plannedDays: Float? = null,
    val remainingDays: Float? = null,
    val estimatedHours: Float? = null
)

data class LogHoursRequest(
    val hours: Float
)

@Service
class TaskService(
    private val issueService: IssueService
) {
    private val objectMapper = jacksonObjectMapper()

    fun findAll(): List<Task> =
        issueService.findAll(IssueQuery(type = "TASK")).map { issueService.toTask(issueService.getIssue(it.id)) }

    fun findById(id: Long): Task {
        val issue = issueService.getIssue(id)
        if (issue.type != "TASK") {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found")
        }
        return issueService.toTask(issue)
    }

    fun findByRequirementId(requirementId: Long): List<Task> =
        issueService.findAll(IssueQuery(type = "TASK", parentIssueId = requirementId))
            .map { issueService.toTask(issueService.getIssue(it.id)) }

    fun findByAssigneeId(assigneeId: Long): List<Task> =
        issueService.findAll(IssueQuery(type = "TASK", assigneeId = assigneeId))
            .map { issueService.toTask(issueService.getIssue(it.id)) }

    fun create(request: CreateTaskRequest): Task {
        val parentIssue = issueService.getIssue(request.requirementId)
        val issue = issueService.create(
            CreateIssueRequest(
                type = "TASK",
                title = request.title,
                description = request.description,
                state = mapTaskStatus(request.status),
                projectId = parentIssue.projectId,
                teamId = request.teamId,
                parentIssueId = request.requirementId,
                assigneeId = request.assigneeId,
                progress = request.progress,
                plannedStartDate = request.plannedStartDate,
                plannedEndDate = request.plannedEndDate,
                estimatedHours = request.estimatedHours,
                legacyPayload = buildTaskLegacyPayload(null, request)
            )
        )
        return issueService.toTask(issueService.getIssue(issue.id))
    }

    fun update(id: Long, request: UpdateTaskRequest): Task {
        val issue = issueService.getIssue(id)
        if (issue.type != "TASK") {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found")
        }

        issueService.update(
            id,
            UpdateIssueRequest(
                title = request.title,
                description = request.description,
                state = request.status?.let { mapTaskStatus(it) },
                assigneeId = request.assigneeId,
                progress = request.progress,
                teamId = request.teamId,
                plannedStartDate = request.plannedStartDate,
                plannedEndDate = request.plannedEndDate,
                estimatedHours = request.estimatedHours,
                legacyPayload = buildTaskLegacyPayload(issue.legacyPayload, request)
            )
        )
        return issueService.toTask(issueService.getIssue(id))
    }

    fun logHours(id: Long, request: LogHoursRequest): Task {
        val issue = issueService.getIssue(id)
        if (issue.type != "TASK") {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found")
        }
        issueService.update(id, UpdateIssueRequest(actualHours = issue.actualHours + request.hours))
        return issueService.toTask(issueService.getIssue(id))
    }

    fun delete(id: Long) {
        val issue = issueService.getIssue(id)
        if (issue.type != "TASK") {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found")
        }
        issueService.delete(id)
    }

    private fun mapTaskStatus(status: String): String = when (status) {
        "PENDING" -> "TODO"
        "IN_PROGRESS" -> "IN_PROGRESS"
        "COMPLETED" -> "DONE"
        "CANCELLED" -> "CANCELED"
        else -> "TODO"
    }

    private fun buildTaskLegacyPayload(existingPayload: String?, request: CreateTaskRequest): String =
        writeLegacyPayload(
            parseLegacyPayload(existingPayload).apply {
                this["estimatedDays"] = request.estimatedDays
                this["plannedDays"] = request.plannedDays
                this["remainingDays"] = request.remainingDays
            }
        )

    private fun buildTaskLegacyPayload(existingPayload: String?, request: UpdateTaskRequest): String? {
        val payload = parseLegacyPayload(existingPayload)
        if (request.estimatedDays == null && request.plannedDays == null && request.remainingDays == null) {
            return if (payload.isEmpty()) null else writeLegacyPayload(payload)
        }

        request.estimatedDays?.let { payload["estimatedDays"] = it }
        request.plannedDays?.let { payload["plannedDays"] = it }
        request.remainingDays?.let { payload["remainingDays"] = it }
        return writeLegacyPayload(payload)
    }

    private fun parseLegacyPayload(payload: String?): MutableMap<String, Any?> =
        if (payload.isNullOrBlank()) mutableMapOf()
        else runCatching { objectMapper.readValue(payload, MutableMap::class.java) as MutableMap<String, Any?> }
            .getOrElse { mutableMapOf() }

    private fun writeLegacyPayload(payload: Map<String, Any?>): String =
        objectMapper.writeValueAsString(payload)
}
