package com.cruise.service

import com.cruise.entity.ProjectUpdate
import com.cruise.repository.ProjectUpdateRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDateTime

data class ProjectUpdateDto(
    val id: Long,
    val projectId: Long,
    val title: String,
    val body: String?,
    val health: String?,
    val userId: Long?,
    val createdAt: String,
    val updatedAt: String,
    val archivedAt: String?
)

data class CreateProjectUpdateRequest(
    val title: String,
    val body: String? = null,
    val health: String? = null,
    val userId: Long? = null
)

data class UpdateProjectUpdateRequest(
    val title: String? = null,
    val body: String? = null,
    val health: String? = null,
    val userId: Long? = null,
    val archivedAt: String? = null
)

@Service
class ProjectUpdateService(
    private val projectUpdateRepository: ProjectUpdateRepository,
    private val notificationService: NotificationService
) {
    fun findByProject(projectId: Long, includeArchived: Boolean = false): List<ProjectUpdateDto> =
        projectUpdateRepository.findAll()
            .asSequence()
            .filter { it.projectId == projectId }
            .filter { includeArchived || it.archivedAt == null }
            .sortedByDescending { it.createdAt }
            .map { it.toDto() }
            .toList()

    fun findById(projectId: Long, id: Long): ProjectUpdateDto = getUpdate(projectId, id).toDto()

    fun create(projectId: Long, request: CreateProjectUpdateRequest): ProjectUpdateDto =
        projectUpdateRepository.save(
            ProjectUpdate(
                projectId = projectId,
                title = request.title,
                body = request.body,
                health = request.health,
                userId = request.userId
            )
        ).toDto().also { createdUpdate ->
            notificationService.notifyProjectUpdated(projectId, createdUpdate.id, createdUpdate.title, createdUpdate.userId)
        }

    fun update(projectId: Long, id: Long, request: UpdateProjectUpdateRequest): ProjectUpdateDto {
        val update = getUpdate(projectId, id)
        return projectUpdateRepository.save(
            ProjectUpdate(
                id = update.id,
                projectId = update.projectId,
                title = request.title ?: update.title,
                body = request.body ?: update.body,
                health = request.health ?: update.health,
                userId = request.userId ?: update.userId,
                createdAt = update.createdAt,
                updatedAt = LocalDateTime.now(),
                archivedAt = parseDateTime(request.archivedAt) ?: update.archivedAt
            )
        ).toDto()
    }

    fun delete(projectId: Long, id: Long) {
        projectUpdateRepository.delete(getUpdate(projectId, id))
    }

    private fun getUpdate(projectId: Long, id: Long): ProjectUpdate =
        projectUpdateRepository.findById(id)
            .filter { it.projectId == projectId }
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Project update not found") }

    private fun ProjectUpdate.toDto(): ProjectUpdateDto = ProjectUpdateDto(
        id = id,
        projectId = projectId,
        title = title,
        body = body,
        health = health,
        userId = userId,
        createdAt = createdAt.toString(),
        updatedAt = updatedAt.toString(),
        archivedAt = archivedAt?.toString()
    )

    private fun parseDateTime(value: String?): LocalDateTime? =
        value?.takeIf(String::isNotBlank)?.let(LocalDateTime::parse)
}
