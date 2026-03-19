package com.cruise.service

import com.cruise.entity.Roadmap
import com.cruise.entity.RoadmapToProject
import com.cruise.repository.ProjectRepository
import com.cruise.repository.RoadmapRepository
import com.cruise.repository.RoadmapToProjectRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDateTime

data class RoadmapDto(
    val id: Long,
    val organizationId: Long,
    val name: String,
    val description: String?,
    val color: String?,
    val slugId: String?,
    val sortOrder: Int,
    val ownerId: Long?,
    val creatorId: Long?,
    val createdAt: String,
    val updatedAt: String,
    val archivedAt: String?
)

data class RoadmapProjectDto(
    val id: Long,
    val roadmapId: Long,
    val projectId: Long,
    val sortOrder: Int,
    val createdAt: String,
    val updatedAt: String,
    val archivedAt: String?
)

data class RoadmapQuery(
    val organizationId: Long? = null,
    val q: String? = null,
    val includeArchived: Boolean = false,
    val page: Int = 0,
    val size: Int = 50
)

data class CreateRoadmapRequest(
    val organizationId: Long? = null,
    val name: String,
    val description: String? = null,
    val color: String? = null,
    val slugId: String? = null,
    val sortOrder: Int? = null,
    val ownerId: Long? = null,
    val creatorId: Long? = null
)

data class UpdateRoadmapRequest(
    val name: String? = null,
    val description: String? = null,
    val color: String? = null,
    val slugId: String? = null,
    val sortOrder: Int? = null,
    val ownerId: Long? = null,
    val creatorId: Long? = null,
    val archivedAt: String? = null
)

data class AttachRoadmapProjectRequest(
    val projectId: Long,
    val sortOrder: Int? = null
)

data class UpdateRoadmapProjectRequest(
    val sortOrder: Int? = null,
    val archivedAt: String? = null
)

@Service
class RoadmapService(
    private val roadmapRepository: RoadmapRepository,
    private val roadmapToProjectRepository: RoadmapToProjectRepository,
    private val projectRepository: ProjectRepository
) {
    fun findAll(query: RoadmapQuery = RoadmapQuery()): RestPageResponse<RoadmapDto> =
        roadmapRepository.findAll()
            .asSequence()
            .filter { query.organizationId == null || it.organizationId == query.organizationId }
            .filter { query.includeArchived || it.archivedAt == null }
            .filter {
                query.q.isNullOrBlank() || listOfNotNull(it.name, it.description, it.slugId)
                    .any { text -> text.contains(query.q, ignoreCase = true) }
            }
            .sortedWith(compareBy<Roadmap> { it.sortOrder }.thenBy { it.id })
            .map { it.toDto() }
            .toList()
            .toRestPage(query.page, query.size)

    fun findById(id: Long): RoadmapDto = getRoadmap(id).toDto()

    fun create(request: CreateRoadmapRequest): RoadmapDto =
        roadmapRepository.save(
            Roadmap(
                organizationId = request.organizationId ?: 1L,
                name = request.name,
                description = request.description,
                color = request.color,
                slugId = request.slugId,
                sortOrder = request.sortOrder ?: 0,
                ownerId = request.ownerId,
                creatorId = request.creatorId
            )
        ).toDto()

    fun update(id: Long, request: UpdateRoadmapRequest): RoadmapDto {
        val roadmap = getRoadmap(id)
        return roadmapRepository.save(
            Roadmap(
                id = roadmap.id,
                organizationId = roadmap.organizationId,
                name = request.name ?: roadmap.name,
                description = request.description ?: roadmap.description,
                color = request.color ?: roadmap.color,
                slugId = request.slugId ?: roadmap.slugId,
                sortOrder = request.sortOrder ?: roadmap.sortOrder,
                ownerId = request.ownerId ?: roadmap.ownerId,
                creatorId = request.creatorId ?: roadmap.creatorId,
                createdAt = roadmap.createdAt,
                updatedAt = LocalDateTime.now(),
                archivedAt = parseDateTime(request.archivedAt) ?: roadmap.archivedAt
            )
        ).toDto()
    }

    fun delete(id: Long) {
        roadmapRepository.delete(getRoadmap(id))
    }

    fun findProjects(roadmapId: Long, includeArchived: Boolean = false): List<RoadmapProjectDto> {
        getRoadmap(roadmapId)
        return roadmapToProjectRepository.findAll()
            .asSequence()
            .filter { it.roadmapId == roadmapId }
            .filter { includeArchived || it.archivedAt == null }
            .sortedWith(compareBy<RoadmapToProject> { it.sortOrder }.thenBy { it.id })
            .map { it.toDto() }
            .toList()
    }

    fun attachProject(roadmapId: Long, request: AttachRoadmapProjectRequest): RoadmapProjectDto {
        getRoadmap(roadmapId)
        projectRepository.findById(request.projectId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found") }
        return roadmapToProjectRepository.save(
            RoadmapToProject(
                roadmapId = roadmapId,
                projectId = request.projectId,
                sortOrder = request.sortOrder ?: 0
            )
        ).toDto()
    }

    fun updateProject(roadmapId: Long, relationId: Long, request: UpdateRoadmapProjectRequest): RoadmapProjectDto {
        val relation = getRoadmapProject(roadmapId, relationId)
        return roadmapToProjectRepository.save(
            RoadmapToProject(
                id = relation.id,
                roadmapId = relation.roadmapId,
                projectId = relation.projectId,
                sortOrder = request.sortOrder ?: relation.sortOrder,
                createdAt = relation.createdAt,
                updatedAt = LocalDateTime.now(),
                archivedAt = parseDateTime(request.archivedAt) ?: relation.archivedAt
            )
        ).toDto()
    }

    fun detachProject(roadmapId: Long, relationId: Long) {
        roadmapToProjectRepository.delete(getRoadmapProject(roadmapId, relationId))
    }

    private fun getRoadmap(id: Long): Roadmap = roadmapRepository.findById(id)
        .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Roadmap not found") }

    private fun getRoadmapProject(roadmapId: Long, relationId: Long): RoadmapToProject =
        roadmapToProjectRepository.findById(relationId)
            .filter { it.roadmapId == roadmapId }
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Roadmap project relation not found") }

    private fun Roadmap.toDto(): RoadmapDto = RoadmapDto(
        id = id,
        organizationId = organizationId,
        name = name,
        description = description,
        color = color,
        slugId = slugId,
        sortOrder = sortOrder,
        ownerId = ownerId,
        creatorId = creatorId,
        createdAt = createdAt.toString(),
        updatedAt = updatedAt.toString(),
        archivedAt = archivedAt?.toString()
    )

    private fun RoadmapToProject.toDto(): RoadmapProjectDto = RoadmapProjectDto(
        id = id,
        roadmapId = roadmapId,
        projectId = projectId,
        sortOrder = sortOrder,
        createdAt = createdAt.toString(),
        updatedAt = updatedAt.toString(),
        archivedAt = archivedAt?.toString()
    )

    private fun parseDateTime(value: String?): LocalDateTime? =
        value?.takeIf(String::isNotBlank)?.let(LocalDateTime::parse)
}
