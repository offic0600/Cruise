package com.cruise.service

import com.cruise.entity.Requirement
import com.cruise.repository.RequirementRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDateTime

data class CreateRequirementRequest(
    val title: String,
    val description: String?,
    val status: String = "NEW",
    val priority: String = "MEDIUM",
    val projectId: Long
)

data class UpdateRequirementRequest(
    val title: String?,
    val description: String?,
    val status: String?,
    val priority: String?
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
    val createdAt: String,
    val updatedAt: String
)

@Service
class RequirementService(
    private val requirementRepository: RequirementRepository
) {
    // Force initialization of entity fields to avoid lazy loading issues
    private fun Requirement.toDto(): RequirementDto {
        // Access all fields to ensure they are loaded
        val _id = this.id
        val _title = this.title
        val _desc = this.description
        val _status = this.status
        val _priority = this.priority
        val _projectId = this.projectId
        val _createdAt = this.createdAt.toString()
        val _updatedAt = this.updatedAt.toString()

        return RequirementDto(
            id = _id,
            title = _title,
            description = _desc,
            status = _status,
            priority = _priority,
            projectId = _projectId,
            createdAt = _createdAt,
            updatedAt = _updatedAt
        )
    }

    fun findAll(): List<RequirementDto> {
        val requirements = requirementRepository.findAll()
        // Convert to list to force fetch
        val list = requirements.toList()
        return list.map { it.toDto() }
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
            projectId = request.projectId
        )
        val saved = requirementRepository.save(requirement)
        // Force initialize
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