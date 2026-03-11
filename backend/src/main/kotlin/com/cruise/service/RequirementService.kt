package com.cruise.service

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException

data class CreateRequirementRequest(
    val title: String,
    val description: String? = null,
    val status: String = "NEW",
    val priority: String = "MEDIUM",
    val projectId: Long,
    val teamId: Long? = null,
    val plannedStartDate: String? = null,
    val expectedDeliveryDate: String? = null,
    val requirementOwnerId: Long? = null,
    val productOwnerId: Long? = null,
    val devOwnerId: Long? = null,
    val devParticipants: String? = null,
    val testOwnerId: Long? = null,
    val progress: Int? = 0,
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

data class UpdateRequirementRequest(
    val title: String? = null,
    val description: String? = null,
    val status: String? = null,
    val priority: String? = null,
    val teamId: Long? = null,
    val plannedStartDate: String? = null,
    val expectedDeliveryDate: String? = null,
    val requirementOwnerId: Long? = null,
    val productOwnerId: Long? = null,
    val devOwnerId: Long? = null,
    val devParticipants: String? = null,
    val testOwnerId: Long? = null,
    val progress: Int? = null,
    val tags: String? = null,
    val estimatedDays: Float? = null,
    val plannedDays: Float? = null,
    val gapDays: Float? = null,
    val gapBudget: Float? = null,
    val actualDays: Float? = null,
    val applicationCodes: String? = null,
    val vendors: String? = null,
    val vendorStaff: String? = null
)

data class StatusTransitionRequest(
    val status: String
)

data class RequirementDto(
    val id: Long,
    val title: String,
    val description: String?,
    val status: String,
    val priority: String,
    val projectId: Long,
    val teamId: Long?,
    val plannedStartDate: String?,
    val expectedDeliveryDate: String?,
    val requirementOwnerId: Long?,
    val productOwnerId: Long?,
    val devOwnerId: Long?,
    val devParticipants: String?,
    val testOwnerId: Long?,
    val progress: Int,
    val tags: String?,
    val estimatedDays: Float?,
    val plannedDays: Float?,
    val gapDays: Float?,
    val gapBudget: Float?,
    val actualDays: Float?,
    val applicationCodes: String?,
    val vendors: String?,
    val vendorStaff: String?,
    val createdBy: String?,
    val createdAt: String,
    val updatedAt: String
)

@Service
class RequirementService(
    private val issueService: IssueService
) {
    private val objectMapper = jacksonObjectMapper()

    fun findAll(): List<RequirementDto> =
        issueService.findAll(IssueQuery(type = "FEATURE")).map { issueService.toRequirementDto(issueService.getIssue(it.id)) }

    fun findById(id: Long): RequirementDto {
        val issue = issueService.getIssue(id)
        if (issue.type != "FEATURE") {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Requirement not found")
        }
        return issueService.toRequirementDto(issue)
    }

    fun findByProjectId(projectId: Long): List<RequirementDto> =
        issueService.findAll(IssueQuery(type = "FEATURE", projectId = projectId))
            .map { issueService.toRequirementDto(issueService.getIssue(it.id)) }

    fun create(request: CreateRequirementRequest): RequirementDto {
        val issue = issueService.create(
            CreateIssueRequest(
                type = "FEATURE",
                title = request.title,
                description = request.description,
                state = mapRequirementStatus(request.status),
                priority = if (request.priority == "CRITICAL") "URGENT" else request.priority,
                projectId = request.projectId,
                teamId = request.teamId,
                assigneeId = request.requirementOwnerId,
                progress = request.progress,
                plannedStartDate = request.plannedStartDate,
                plannedEndDate = request.expectedDeliveryDate,
                legacyPayload = buildRequirementLegacyPayload(null, request)
            )
        )
        return issueService.toRequirementDto(issueService.getIssue(issue.id))
    }

    fun update(id: Long, request: UpdateRequirementRequest): RequirementDto {
        val issue = issueService.getIssue(id)
        if (issue.type != "FEATURE") {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Requirement not found")
        }

        issueService.update(
            id,
            UpdateIssueRequest(
                title = request.title,
                description = request.description,
                state = request.status?.let { mapRequirementStatus(it) },
                priority = request.priority?.let { if (it == "CRITICAL") "URGENT" else it },
                teamId = request.teamId,
                assigneeId = request.requirementOwnerId,
                progress = request.progress,
                plannedStartDate = request.plannedStartDate,
                plannedEndDate = request.expectedDeliveryDate,
                legacyPayload = buildRequirementLegacyPayload(issue.legacyPayload, request)
            )
        )
        return issueService.toRequirementDto(issueService.getIssue(id))
    }

    fun updateStatus(id: Long, request: StatusTransitionRequest): RequirementDto {
        val issue = issueService.getIssue(id)
        if (issue.type != "FEATURE") {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Requirement not found")
        }
        issueService.updateState(id, mapRequirementStatus(request.status))
        return issueService.toRequirementDto(issueService.getIssue(id))
    }

    fun delete(id: Long) {
        val issue = issueService.getIssue(id)
        if (issue.type != "FEATURE") {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Requirement not found")
        }
        issueService.delete(id)
    }

    private fun mapRequirementStatus(status: String): String = when (status) {
        "NEW" -> "BACKLOG"
        "IN_PROGRESS" -> "IN_PROGRESS"
        "TESTING" -> "IN_REVIEW"
        "COMPLETED" -> "DONE"
        "CANCELLED" -> "CANCELED"
        else -> "BACKLOG"
    }

    private fun buildRequirementLegacyPayload(existingPayload: String?, request: CreateRequirementRequest): String =
        writeLegacyPayload(
            parseLegacyPayload(existingPayload).apply {
                this["productOwnerId"] = request.productOwnerId
                this["devOwnerId"] = request.devOwnerId
                this["devParticipants"] = request.devParticipants
                this["testOwnerId"] = request.testOwnerId
                this["tags"] = request.tags
                this["estimatedDays"] = request.estimatedDays
                this["plannedDays"] = request.plannedDays
                this["gapDays"] = request.gapDays
                this["gapBudget"] = request.gapBudget
                this["actualDays"] = request.actualDays
                this["applicationCodes"] = request.applicationCodes
                this["vendors"] = request.vendors
                this["vendorStaff"] = request.vendorStaff
                this["createdBy"] = request.createdBy
            }
        )

    private fun buildRequirementLegacyPayload(existingPayload: String?, request: UpdateRequirementRequest): String? {
        val payload = parseLegacyPayload(existingPayload)
        if (
            request.productOwnerId == null &&
            request.devOwnerId == null &&
            request.devParticipants == null &&
            request.testOwnerId == null &&
            request.tags == null &&
            request.estimatedDays == null &&
            request.plannedDays == null &&
            request.gapDays == null &&
            request.gapBudget == null &&
            request.actualDays == null &&
            request.applicationCodes == null &&
            request.vendors == null &&
            request.vendorStaff == null
        ) {
            return if (payload.isEmpty()) null else writeLegacyPayload(payload)
        }

        request.productOwnerId?.let { payload["productOwnerId"] = it }
        request.devOwnerId?.let { payload["devOwnerId"] = it }
        request.devParticipants?.let { payload["devParticipants"] = it }
        request.testOwnerId?.let { payload["testOwnerId"] = it }
        request.tags?.let { payload["tags"] = it }
        request.estimatedDays?.let { payload["estimatedDays"] = it }
        request.plannedDays?.let { payload["plannedDays"] = it }
        request.gapDays?.let { payload["gapDays"] = it }
        request.gapBudget?.let { payload["gapBudget"] = it }
        request.actualDays?.let { payload["actualDays"] = it }
        request.applicationCodes?.let { payload["applicationCodes"] = it }
        request.vendors?.let { payload["vendors"] = it }
        request.vendorStaff?.let { payload["vendorStaff"] = it }
        return writeLegacyPayload(payload)
    }

    private fun parseLegacyPayload(payload: String?): MutableMap<String, Any?> =
        if (payload.isNullOrBlank()) mutableMapOf()
        else runCatching { objectMapper.readValue(payload, MutableMap::class.java) as MutableMap<String, Any?> }
            .getOrElse { mutableMapOf() }

    private fun writeLegacyPayload(payload: Map<String, Any?>): String =
        objectMapper.writeValueAsString(payload)
}
