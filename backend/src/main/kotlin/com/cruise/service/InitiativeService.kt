package com.cruise.service

import com.cruise.entity.Initiative
import com.cruise.entity.InitiativeToProject
import com.cruise.repository.InitiativeRepository
import com.cruise.repository.InitiativeToProjectRepository
import com.cruise.repository.ProjectRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDate
import java.time.LocalDateTime

data class InitiativeDto(
    val id: Long,
    val organizationId: Long,
    val parentInitiativeId: Long?,
    val name: String,
    val description: String?,
    val slugId: String?,
    val status: String,
    val health: String?,
    val ownerId: Long?,
    val creatorId: Long?,
    val targetDate: String?,
    val startedAt: String?,
    val completedAt: String?,
    val createdAt: String,
    val updatedAt: String,
    val archivedAt: String?
)

data class InitiativeProjectDto(
    val id: Long,
    val initiativeId: Long,
    val projectId: Long,
    val sortOrder: Int,
    val createdAt: String,
    val updatedAt: String,
    val archivedAt: String?
)

data class InitiativeQuery(
    val organizationId: Long? = null,
    val parentInitiativeId: Long? = null,
    val status: String? = null,
    val q: String? = null,
    val includeArchived: Boolean = false,
    val page: Int = 0,
    val size: Int = 50
)

data class CreateInitiativeRequest(
    val organizationId: Long? = null,
    val parentInitiativeId: Long? = null,
    val name: String,
    val description: String? = null,
    val slugId: String? = null,
    val status: String? = null,
    val health: String? = null,
    val ownerId: Long? = null,
    val creatorId: Long? = null,
    val targetDate: String? = null
)

data class UpdateInitiativeRequest(
    val parentInitiativeId: Long? = null,
    val name: String? = null,
    val description: String? = null,
    val slugId: String? = null,
    val status: String? = null,
    val health: String? = null,
    val ownerId: Long? = null,
    val targetDate: String? = null,
    val archivedAt: String? = null
)

data class AttachInitiativeProjectRequest(
    val projectId: Long,
    val sortOrder: Int? = null
)

data class UpdateInitiativeProjectRequest(
    val sortOrder: Int? = null,
    val archivedAt: String? = null
)

@Service
class InitiativeService(
    private val initiativeRepository: InitiativeRepository,
    private val initiativeToProjectRepository: InitiativeToProjectRepository,
    private val projectRepository: ProjectRepository
) {
    fun findAll(query: InitiativeQuery = InitiativeQuery()): RestPageResponse<InitiativeDto> =
        initiativeRepository.findAll()
            .asSequence()
            .filter { query.organizationId == null || it.organizationId == query.organizationId }
            .filter { query.parentInitiativeId == null || it.parentInitiativeId == query.parentInitiativeId }
            .filter { query.status == null || it.status == query.status }
            .filter { query.includeArchived || it.archivedAt == null }
            .filter {
                query.q.isNullOrBlank() || listOfNotNull(it.name, it.description, it.slugId)
                    .any { value -> value.contains(query.q, ignoreCase = true) }
            }
            .sortedBy { it.id }
            .map { it.toDto() }
            .toList()
            .toRestPage(query.page, query.size)

    fun findById(id: Long): InitiativeDto = getInitiative(id).toDto()

    fun create(request: CreateInitiativeRequest): InitiativeDto =
        initiativeRepository.save(
            Initiative(
                organizationId = request.organizationId ?: 1L,
                parentInitiativeId = request.parentInitiativeId,
                name = request.name,
                description = request.description,
                slugId = request.slugId,
                status = request.status ?: "planned",
                health = request.health,
                ownerId = request.ownerId,
                creatorId = request.creatorId,
                targetDate = parseDate(request.targetDate)
            )
        ).toDto()

    fun update(id: Long, request: UpdateInitiativeRequest): InitiativeDto {
        val current = getInitiative(id)
        val nextStatus = request.status ?: current.status
        return initiativeRepository.save(
            Initiative(
                id = current.id,
                organizationId = current.organizationId,
                parentInitiativeId = request.parentInitiativeId ?: current.parentInitiativeId,
                name = request.name ?: current.name,
                description = request.description ?: current.description,
                slugId = request.slugId ?: current.slugId,
                status = nextStatus,
                health = request.health ?: current.health,
                ownerId = request.ownerId ?: current.ownerId,
                creatorId = current.creatorId,
                targetDate = parseDate(request.targetDate) ?: current.targetDate,
                startedAt = if (nextStatus == "active") current.startedAt ?: LocalDateTime.now() else current.startedAt,
                completedAt = if (nextStatus == "completed") LocalDateTime.now() else current.completedAt,
                createdAt = current.createdAt,
                updatedAt = LocalDateTime.now(),
                archivedAt = parseDateTime(request.archivedAt) ?: current.archivedAt
            )
        ).toDto()
    }

    fun delete(id: Long) {
        initiativeRepository.delete(getInitiative(id))
    }

    fun findProjects(initiativeId: Long, includeArchived: Boolean = false): List<InitiativeProjectDto> {
        getInitiative(initiativeId)
        return initiativeToProjectRepository.findAll()
            .asSequence()
            .filter { it.initiativeId == initiativeId }
            .filter { includeArchived || it.archivedAt == null }
            .sortedWith(compareBy<InitiativeToProject> { it.sortOrder }.thenBy { it.id })
            .map { it.toDto() }
            .toList()
    }

    fun attachProject(initiativeId: Long, request: AttachInitiativeProjectRequest): InitiativeProjectDto {
        getInitiative(initiativeId)
        projectRepository.findById(request.projectId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found") }
        return initiativeToProjectRepository.save(
            InitiativeToProject(
                initiativeId = initiativeId,
                projectId = request.projectId,
                sortOrder = request.sortOrder ?: 0
            )
        ).toDto()
    }

    fun updateProject(initiativeId: Long, relationId: Long, request: UpdateInitiativeProjectRequest): InitiativeProjectDto {
        val relation = getInitiativeProject(initiativeId, relationId)
        return initiativeToProjectRepository.save(
            InitiativeToProject(
                id = relation.id,
                initiativeId = relation.initiativeId,
                projectId = relation.projectId,
                sortOrder = request.sortOrder ?: relation.sortOrder,
                createdAt = relation.createdAt,
                updatedAt = LocalDateTime.now(),
                archivedAt = parseDateTime(request.archivedAt) ?: relation.archivedAt
            )
        ).toDto()
    }

    fun detachProject(initiativeId: Long, relationId: Long) {
        initiativeToProjectRepository.delete(getInitiativeProject(initiativeId, relationId))
    }

    private fun getInitiative(id: Long): Initiative = initiativeRepository.findById(id)
        .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Initiative not found") }

    private fun getInitiativeProject(initiativeId: Long, relationId: Long): InitiativeToProject =
        initiativeToProjectRepository.findById(relationId)
            .filter { it.initiativeId == initiativeId }
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Initiative project relation not found") }

    private fun Initiative.toDto() = InitiativeDto(
        id = id,
        organizationId = organizationId,
        parentInitiativeId = parentInitiativeId,
        name = name,
        description = description,
        slugId = slugId,
        status = status,
        health = health,
        ownerId = ownerId,
        creatorId = creatorId,
        targetDate = targetDate?.toString(),
        startedAt = startedAt?.toString(),
        completedAt = completedAt?.toString(),
        createdAt = createdAt.toString(),
        updatedAt = updatedAt.toString(),
        archivedAt = archivedAt?.toString()
    )

    private fun InitiativeToProject.toDto() = InitiativeProjectDto(
        id = id,
        initiativeId = initiativeId,
        projectId = projectId,
        sortOrder = sortOrder,
        createdAt = createdAt.toString(),
        updatedAt = updatedAt.toString(),
        archivedAt = archivedAt?.toString()
    )

    private fun parseDate(value: String?): LocalDate? = value?.let(LocalDate::parse)
    private fun parseDateTime(value: String?): LocalDateTime? = value?.let(LocalDateTime::parse)
}
