package com.cruise.service

import com.cruise.entity.Epic
import com.cruise.repository.EpicRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDate
import java.time.LocalDateTime

data class EpicDto(
    val id: Long,
    val organizationId: Long,
    val teamId: Long,
    val projectId: Long?,
    val identifier: String,
    val title: String,
    val description: String?,
    val state: String,
    val priority: String,
    val ownerId: Long?,
    val reporterId: Long?,
    val startDate: String?,
    val targetDate: String?,
    val createdAt: String,
    val updatedAt: String
)

data class EpicQuery(
    val organizationId: Long? = null,
    val teamId: Long? = null,
    val projectId: Long? = null,
    val state: String? = null,
    val q: String? = null
)

data class CreateEpicRequest(
    val organizationId: Long? = null,
    val teamId: Long,
    val projectId: Long? = null,
    val title: String,
    val description: String? = null,
    val state: String? = null,
    val priority: String? = null,
    val ownerId: Long? = null,
    val reporterId: Long? = null,
    val startDate: String? = null,
    val targetDate: String? = null
)

data class UpdateEpicRequest(
    val projectId: Long? = null,
    val title: String? = null,
    val description: String? = null,
    val state: String? = null,
    val priority: String? = null,
    val ownerId: Long? = null,
    val reporterId: Long? = null,
    val startDate: String? = null,
    val targetDate: String? = null
)

@Service
class EpicService(
    private val epicRepository: EpicRepository
) {
    fun findAll(query: EpicQuery = EpicQuery()): List<EpicDto> =
        epicRepository.findAll()
            .asSequence()
            .filter { query.organizationId == null || it.organizationId == query.organizationId }
            .filter { query.teamId == null || it.teamId == query.teamId }
            .filter { query.projectId == null || it.projectId == query.projectId }
            .filter { query.state == null || it.state == query.state }
            .filter {
                query.q.isNullOrBlank() || listOfNotNull(it.title, it.description)
                    .any { text -> text.contains(query.q, ignoreCase = true) }
            }
            .sortedBy { it.id }
            .map { it.toDto() }
            .toList()

    fun findById(id: Long): EpicDto = getEpic(id).toDto()

    fun create(request: CreateEpicRequest): EpicDto =
        epicRepository.save(
            Epic(
                organizationId = request.organizationId ?: 1L,
                teamId = request.teamId,
                projectId = request.projectId,
                identifier = nextIdentifier(),
                title = request.title,
                description = request.description,
                state = request.state ?: "BACKLOG",
                priority = request.priority ?: "MEDIUM",
                ownerId = request.ownerId,
                reporterId = request.reporterId,
                startDate = parseDate(request.startDate),
                targetDate = parseDate(request.targetDate)
            )
        ).toDto()

    fun update(id: Long, request: UpdateEpicRequest): EpicDto {
        val epic = getEpic(id)
        return epicRepository.save(
            Epic(
                id = epic.id,
                organizationId = epic.organizationId,
                teamId = epic.teamId,
                projectId = request.projectId ?: epic.projectId,
                identifier = epic.identifier,
                title = request.title ?: epic.title,
                description = request.description ?: epic.description,
                state = request.state ?: epic.state,
                priority = request.priority ?: epic.priority,
                ownerId = request.ownerId ?: epic.ownerId,
                reporterId = request.reporterId ?: epic.reporterId,
                startDate = parseDate(request.startDate) ?: epic.startDate,
                targetDate = parseDate(request.targetDate) ?: epic.targetDate,
                createdAt = epic.createdAt,
                updatedAt = LocalDateTime.now()
            )
        ).toDto()
    }

    fun delete(id: Long) {
        epicRepository.delete(getEpic(id))
    }

    private fun getEpic(id: Long): Epic = epicRepository.findById(id)
        .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Epic not found") }

    private fun Epic.toDto(): EpicDto = EpicDto(
        id = id,
        organizationId = organizationId,
        teamId = teamId,
        projectId = projectId,
        identifier = identifier,
        title = title,
        description = description,
        state = state,
        priority = priority,
        ownerId = ownerId,
        reporterId = reporterId,
        startDate = startDate?.toString(),
        targetDate = targetDate?.toString(),
        createdAt = createdAt.toString(),
        updatedAt = updatedAt.toString()
    )

    private fun parseDate(value: String?): LocalDate? = value?.let(LocalDate::parse)

    private fun nextIdentifier(): String =
        "EPIC-${(epicRepository.findAll().maxOfOrNull { it.id } ?: 0L) + 1}"
}
