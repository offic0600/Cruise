package com.cruise.service

import com.cruise.entity.Project
import com.cruise.repository.ProjectRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDate
import java.time.LocalDateTime

data class ProjectDto(
    val id: Long,
    val organizationId: Long,
    val teamId: Long?,
    val key: String?,
    val name: String,
    val description: String?,
    val status: String,
    val ownerId: Long?,
    val startDate: String?,
    val targetDate: String?,
    val createdAt: String,
    val updatedAt: String,
    val archivedAt: String?
)

data class ProjectQuery(
    val organizationId: Long? = null,
    val teamId: Long? = null,
    val status: String? = null,
    val q: String? = null,
    val includeArchived: Boolean = false,
    val page: Int = 0,
    val size: Int = 50
)

data class CreateProjectRequest(
    val organizationId: Long? = null,
    val teamId: Long? = null,
    val key: String? = null,
    val name: String,
    val description: String? = null,
    val status: String? = null,
    val ownerId: Long? = null,
    val startDate: String? = null,
    val targetDate: String? = null
)

data class UpdateProjectRequest(
    val teamId: Long? = null,
    val key: String? = null,
    val name: String? = null,
    val description: String? = null,
    val status: String? = null,
    val ownerId: Long? = null,
    val startDate: String? = null,
    val targetDate: String? = null
)

@Service
class ProjectService(
    private val projectRepository: ProjectRepository
) {
    fun findAll(query: ProjectQuery = ProjectQuery()): RestPageResponse<ProjectDto> =
        findAllMatching(query).toRestPage(query.page, query.size)

    fun findAllMatching(query: ProjectQuery = ProjectQuery()): List<ProjectDto> =
        projectRepository.findAll()
            .asSequence()
            .filter { query.organizationId == null || it.organizationId == query.organizationId }
            .filter { query.teamId == null || it.teamId == query.teamId }
            .filter { query.status == null || it.status == query.status }
            .filter { query.includeArchived || it.archivedAt == null }
            .filter {
                query.q.isNullOrBlank() || listOfNotNull(it.name, it.description, it.key)
                    .any { text -> text.contains(query.q, ignoreCase = true) }
            }
            .sortedBy { it.id }
            .map { it.toDto() }
            .toList()

    fun findById(id: Long): ProjectDto = getProject(id).toDto()

    fun create(request: CreateProjectRequest): ProjectDto =
        projectRepository.save(
            Project(
                organizationId = request.organizationId ?: 1L,
                teamId = request.teamId,
                key = request.key,
                name = request.name,
                description = request.description,
                status = request.status ?: "ACTIVE",
                ownerId = request.ownerId,
                startDate = parseDate(request.startDate),
                targetDate = parseDate(request.targetDate),
                archivedAt = null
            )
        ).toDto()

    fun update(id: Long, request: UpdateProjectRequest): ProjectDto {
        val project = getProject(id)
        return projectRepository.save(
            Project(
                id = project.id,
                organizationId = project.organizationId,
                teamId = request.teamId ?: project.teamId,
                key = request.key ?: project.key,
                name = request.name ?: project.name,
                description = request.description ?: project.description,
                status = request.status ?: project.status,
                ownerId = request.ownerId ?: project.ownerId,
                startDate = parseDate(request.startDate) ?: project.startDate,
                targetDate = parseDate(request.targetDate) ?: project.targetDate,
                createdAt = project.createdAt,
                updatedAt = LocalDateTime.now(),
                archivedAt = project.archivedAt
            )
        ).toDto()
    }

    fun delete(id: Long) {
        projectRepository.delete(getProject(id))
    }

    private fun getProject(id: Long): Project = projectRepository.findById(id)
        .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found") }

    private fun Project.toDto(): ProjectDto = ProjectDto(
        id = id,
        organizationId = organizationId,
        teamId = teamId,
        key = key,
        name = name,
        description = description,
        status = status,
        ownerId = ownerId,
        startDate = startDate?.toString(),
        targetDate = targetDate?.toString(),
        createdAt = createdAt.toString(),
        updatedAt = updatedAt.toString(),
        archivedAt = archivedAt?.toString()
    )

    private fun parseDate(value: String?): LocalDate? = value?.let(LocalDate::parse)
}
