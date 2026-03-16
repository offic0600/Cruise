package com.cruise.service

import com.cruise.entity.Sprint
import com.cruise.repository.SprintRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDate
import java.time.LocalDateTime

data class SprintDto(
    val id: Long,
    val teamId: Long,
    val projectId: Long?,
    val name: String,
    val goal: String?,
    val sequenceNumber: Int,
    val status: String,
    val startDate: String,
    val endDate: String,
    val createdAt: String,
    val updatedAt: String
)

data class SprintQuery(
    val teamId: Long? = null,
    val projectId: Long? = null,
    val status: String? = null,
    val q: String? = null
)

data class CreateSprintRequest(
    val teamId: Long,
    val projectId: Long? = null,
    val name: String,
    val goal: String? = null,
    val sequenceNumber: Int? = null,
    val status: String? = null,
    val startDate: String,
    val endDate: String
)

data class UpdateSprintRequest(
    val projectId: Long? = null,
    val name: String? = null,
    val goal: String? = null,
    val sequenceNumber: Int? = null,
    val status: String? = null,
    val startDate: String? = null,
    val endDate: String? = null
)

@Service
class SprintService(
    private val sprintRepository: SprintRepository
) {
    fun findAll(query: SprintQuery = SprintQuery()): List<SprintDto> =
        sprintRepository.findAll()
            .asSequence()
            .filter { query.teamId == null || it.teamId == query.teamId }
            .filter { query.projectId == null || it.projectId == query.projectId }
            .filter { query.status == null || it.status == query.status }
            .filter {
                query.q.isNullOrBlank() || listOfNotNull(it.name, it.goal)
                    .any { text -> text.contains(query.q, ignoreCase = true) }
            }
            .sortedBy { it.id }
            .map { it.toDto() }
            .toList()

    fun findById(id: Long): SprintDto = getSprint(id).toDto()

    fun create(request: CreateSprintRequest): SprintDto =
        sprintRepository.save(
            Sprint(
                teamId = request.teamId,
                projectId = request.projectId,
                name = request.name,
                goal = request.goal,
                sequenceNumber = request.sequenceNumber ?: nextSequence(request.teamId),
                status = request.status ?: "PLANNED",
                startDate = LocalDate.parse(request.startDate),
                endDate = LocalDate.parse(request.endDate)
            )
        ).toDto()

    fun update(id: Long, request: UpdateSprintRequest): SprintDto {
        val sprint = getSprint(id)
        return sprintRepository.save(
            Sprint(
                id = sprint.id,
                teamId = sprint.teamId,
                projectId = request.projectId ?: sprint.projectId,
                name = request.name ?: sprint.name,
                goal = request.goal ?: sprint.goal,
                sequenceNumber = request.sequenceNumber ?: sprint.sequenceNumber,
                status = request.status ?: sprint.status,
                startDate = request.startDate?.let(LocalDate::parse) ?: sprint.startDate,
                endDate = request.endDate?.let(LocalDate::parse) ?: sprint.endDate,
                createdAt = sprint.createdAt,
                updatedAt = LocalDateTime.now()
            )
        ).toDto()
    }

    fun delete(id: Long) {
        sprintRepository.delete(getSprint(id))
    }

    private fun getSprint(id: Long): Sprint = sprintRepository.findById(id)
        .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Sprint not found") }

    private fun Sprint.toDto(): SprintDto = SprintDto(
        id = id,
        teamId = teamId,
        projectId = projectId,
        name = name,
        goal = goal,
        sequenceNumber = sequenceNumber,
        status = status,
        startDate = startDate.toString(),
        endDate = endDate.toString(),
        createdAt = createdAt.toString(),
        updatedAt = updatedAt.toString()
    )

    private fun nextSequence(teamId: Long): Int =
        (sprintRepository.findByTeamId(teamId).maxOfOrNull { it.sequenceNumber } ?: 0) + 1
}
