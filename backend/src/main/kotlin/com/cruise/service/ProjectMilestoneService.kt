package com.cruise.service

import com.cruise.entity.ProjectMilestone
import com.cruise.repository.ProjectMilestoneRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDate
import java.time.LocalDateTime

data class ProjectMilestoneDto(
    val id: Long,
    val projectId: Long,
    val name: String,
    val description: String?,
    val targetDate: String?,
    val status: String,
    val sortOrder: Int,
    val createdAt: String,
    val updatedAt: String,
    val archivedAt: String?
)

data class CreateProjectMilestoneRequest(
    val name: String,
    val description: String? = null,
    val targetDate: String? = null,
    val status: String? = null,
    val sortOrder: Int? = null
)

data class UpdateProjectMilestoneRequest(
    val name: String? = null,
    val description: String? = null,
    val targetDate: String? = null,
    val status: String? = null,
    val sortOrder: Int? = null,
    val archivedAt: String? = null
)

@Service
class ProjectMilestoneService(
    private val projectMilestoneRepository: ProjectMilestoneRepository
) {
    fun findByProject(projectId: Long, includeArchived: Boolean = false): List<ProjectMilestoneDto> =
        projectMilestoneRepository.findAll()
            .asSequence()
            .filter { it.projectId == projectId }
            .filter { includeArchived || it.archivedAt == null }
            .sortedWith(compareBy<ProjectMilestone> { it.sortOrder }.thenBy { it.id })
            .map { it.toDto() }
            .toList()

    fun findById(projectId: Long, id: Long): ProjectMilestoneDto = getMilestone(projectId, id).toDto()

    fun create(projectId: Long, request: CreateProjectMilestoneRequest): ProjectMilestoneDto =
        projectMilestoneRepository.save(
            ProjectMilestone(
                projectId = projectId,
                name = request.name,
                description = request.description,
                targetDate = parseDate(request.targetDate),
                status = request.status ?: "planned",
                sortOrder = request.sortOrder ?: 0
            )
        ).toDto()

    fun update(projectId: Long, id: Long, request: UpdateProjectMilestoneRequest): ProjectMilestoneDto {
        val milestone = getMilestone(projectId, id)
        return projectMilestoneRepository.save(
            ProjectMilestone(
                id = milestone.id,
                projectId = milestone.projectId,
                name = request.name ?: milestone.name,
                description = request.description ?: milestone.description,
                targetDate = parseDate(request.targetDate) ?: milestone.targetDate,
                status = request.status ?: milestone.status,
                sortOrder = request.sortOrder ?: milestone.sortOrder,
                createdAt = milestone.createdAt,
                updatedAt = LocalDateTime.now(),
                archivedAt = parseDateTime(request.archivedAt) ?: milestone.archivedAt
            )
        ).toDto()
    }

    fun delete(projectId: Long, id: Long) {
        projectMilestoneRepository.delete(getMilestone(projectId, id))
    }

    private fun getMilestone(projectId: Long, id: Long): ProjectMilestone =
        projectMilestoneRepository.findById(id)
            .filter { it.projectId == projectId }
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Project milestone not found") }

    private fun ProjectMilestone.toDto(): ProjectMilestoneDto = ProjectMilestoneDto(
        id = id,
        projectId = projectId,
        name = name,
        description = description,
        targetDate = targetDate?.toString(),
        status = status,
        sortOrder = sortOrder,
        createdAt = createdAt.toString(),
        updatedAt = updatedAt.toString(),
        archivedAt = archivedAt?.toString()
    )

    private fun parseDate(value: String?): LocalDate? = value?.takeIf(String::isNotBlank)?.let(LocalDate::parse)

    private fun parseDateTime(value: String?): LocalDateTime? =
        value?.takeIf(String::isNotBlank)?.let(LocalDateTime::parse)
}
