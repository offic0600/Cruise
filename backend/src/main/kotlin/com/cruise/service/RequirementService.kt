package com.cruise.service

import com.cruise.entity.Requirement
import com.cruise.repository.RequirementRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDate
import java.time.LocalDateTime

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

// DTO for API response
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
    private val requirementRepository: RequirementRepository
) {
    private fun parseDate(dateStr: String?): LocalDate? {
        return dateStr?.let { LocalDate.parse(it) }
    }

    private fun Requirement.toDto(): RequirementDto {
        // Access all fields to ensure they are loaded
        val _id = this.id
        val _title = this.title
        val _desc = this.description
        val _status = this.status
        val _priority = this.priority
        val _projectId = this.projectId
        val _teamId = this.teamId
        val _plannedStartDate = this.plannedStartDate?.toString()
        val _expectedDeliveryDate = this.expectedDeliveryDate?.toString()
        val _requirementOwnerId = this.requirementOwnerId
        val _productOwnerId = this.productOwnerId
        val _devOwnerId = this.devOwnerId
        val _devParticipants = this.devParticipants
        val _testOwnerId = this.testOwnerId
        val _progress = this.progress
        val _tags = this.tags
        val _estimatedDays = this.estimatedDays
        val _plannedDays = this.plannedDays
        val _gapDays = this.gapDays
        val _gapBudget = this.gapBudget
        val _actualDays = this.actualDays
        val _applicationCodes = this.applicationCodes
        val _vendors = this.vendors
        val _vendorStaff = this.vendorStaff
        val _createdBy = this.createdBy
        val _createdAt = this.createdAt.toString()
        val _updatedAt = this.updatedAt.toString()

        return RequirementDto(
            id = _id,
            title = _title,
            description = _desc,
            status = _status,
            priority = _priority,
            projectId = _projectId,
            teamId = _teamId,
            plannedStartDate = _plannedStartDate,
            expectedDeliveryDate = _expectedDeliveryDate,
            requirementOwnerId = _requirementOwnerId,
            productOwnerId = _productOwnerId,
            devOwnerId = _devOwnerId,
            devParticipants = _devParticipants,
            testOwnerId = _testOwnerId,
            progress = _progress,
            tags = _tags,
            estimatedDays = _estimatedDays,
            plannedDays = _plannedDays,
            gapDays = _gapDays,
            gapBudget = _gapBudget,
            actualDays = _actualDays,
            applicationCodes = _applicationCodes,
            vendors = _vendors,
            vendorStaff = _vendorStaff,
            createdBy = _createdBy,
            createdAt = _createdAt,
            updatedAt = _updatedAt
        )
    }

    fun findAll(): List<RequirementDto> {
        val requirements = requirementRepository.findAll()
        return requirements.toList().map { it.toDto() }
    }

    fun findById(id: Long): RequirementDto {
        val requirement = requirementRepository.findById(id)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Requirement not found") }
        return requirement.toDto()
    }

    fun findByProjectId(projectId: Long): List<RequirementDto> {
        val requirements = requirementRepository.findByProjectId(projectId)
        return requirements.toList().map { it.toDto() }
    }

    fun create(request: CreateRequirementRequest): RequirementDto {
        val requirement = Requirement(
            title = request.title,
            description = request.description,
            status = request.status,
            priority = request.priority,
            projectId = request.projectId,
            teamId = request.teamId,
            plannedStartDate = parseDate(request.plannedStartDate),
            expectedDeliveryDate = parseDate(request.expectedDeliveryDate),
            requirementOwnerId = request.requirementOwnerId,
            productOwnerId = request.productOwnerId,
            devOwnerId = request.devOwnerId,
            devParticipants = request.devParticipants,
            testOwnerId = request.testOwnerId,
            progress = request.progress ?: 0,
            tags = request.tags,
            estimatedDays = request.estimatedDays,
            plannedDays = request.plannedDays,
            gapDays = request.gapDays,
            gapBudget = request.gapBudget,
            actualDays = request.actualDays,
            applicationCodes = request.applicationCodes,
            vendors = request.vendors,
            vendorStaff = request.vendorStaff,
            createdBy = request.createdBy
        )
        val saved = requirementRepository.save(requirement)
        saved.id
        return saved.toDto()
    }

    fun update(id: Long, request: UpdateRequirementRequest): RequirementDto {
        val requirement = requirementRepository.findById(id)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Requirement not found") }

        val updated = Requirement(
            id = requirement.id,
            title = request.title ?: requirement.title,
            description = request.description ?: requirement.description,
            status = request.status ?: requirement.status,
            priority = request.priority ?: requirement.priority,
            projectId = requirement.projectId,
            teamId = request.teamId ?: requirement.teamId,
            plannedStartDate = parseDate(request.plannedStartDate) ?: requirement.plannedStartDate,
            expectedDeliveryDate = parseDate(request.expectedDeliveryDate) ?: requirement.expectedDeliveryDate,
            requirementOwnerId = request.requirementOwnerId ?: requirement.requirementOwnerId,
            productOwnerId = request.productOwnerId ?: requirement.productOwnerId,
            devOwnerId = request.devOwnerId ?: requirement.devOwnerId,
            devParticipants = request.devParticipants ?: requirement.devParticipants,
            testOwnerId = request.testOwnerId ?: requirement.testOwnerId,
            progress = request.progress ?: requirement.progress,
            tags = request.tags ?: requirement.tags,
            estimatedDays = request.estimatedDays ?: requirement.estimatedDays,
            plannedDays = request.plannedDays ?: requirement.plannedDays,
            gapDays = request.gapDays ?: requirement.gapDays,
            gapBudget = request.gapBudget ?: requirement.gapBudget,
            actualDays = request.actualDays ?: requirement.actualDays,
            applicationCodes = request.applicationCodes ?: requirement.applicationCodes,
            vendors = request.vendors ?: requirement.vendors,
            vendorStaff = request.vendorStaff ?: requirement.vendorStaff,
            createdBy = requirement.createdBy,
            createdAt = requirement.createdAt,
            updatedAt = LocalDateTime.now()
        )

        return requirementRepository.save(updated).toDto()
    }

    fun updateStatus(id: Long, request: StatusTransitionRequest): RequirementDto {
        val requirement = requirementRepository.findById(id)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Requirement not found") }

        val updated = Requirement(
            id = requirement.id,
            title = requirement.title,
            description = requirement.description,
            status = request.status,
            priority = requirement.priority,
            projectId = requirement.projectId,
            teamId = requirement.teamId,
            plannedStartDate = requirement.plannedStartDate,
            expectedDeliveryDate = requirement.expectedDeliveryDate,
            requirementOwnerId = requirement.requirementOwnerId,
            productOwnerId = requirement.productOwnerId,
            devOwnerId = requirement.devOwnerId,
            devParticipants = requirement.devParticipants,
            testOwnerId = requirement.testOwnerId,
            progress = requirement.progress,
            tags = requirement.tags,
            estimatedDays = requirement.estimatedDays,
            plannedDays = requirement.plannedDays,
            gapDays = requirement.gapDays,
            gapBudget = requirement.gapBudget,
            actualDays = requirement.actualDays,
            applicationCodes = requirement.applicationCodes,
            vendors = requirement.vendors,
            vendorStaff = requirement.vendorStaff,
            createdBy = requirement.createdBy,
            createdAt = requirement.createdAt,
            updatedAt = LocalDateTime.now()
        )

        return requirementRepository.save(updated).toDto()
    }

    fun delete(id: Long) {
        val requirement = requirementRepository.findById(id)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Requirement not found") }
        requirementRepository.delete(requirement)
    }
}
