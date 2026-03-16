package com.cruise.service

import com.cruise.entity.Team
import com.cruise.repository.TeamRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDateTime

data class TeamDto(
    val id: Long,
    val organizationId: Long,
    val key: String,
    val name: String,
    val description: String?,
    val defaultWorkflowId: Long?,
    val createdAt: String,
    val updatedAt: String
)

data class TeamQuery(
    val organizationId: Long? = null,
    val q: String? = null
)

data class CreateTeamRequest(
    val organizationId: Long? = null,
    val key: String,
    val name: String,
    val description: String? = null,
    val defaultWorkflowId: Long? = null
)

data class UpdateTeamRequest(
    val name: String? = null,
    val description: String? = null,
    val defaultWorkflowId: Long? = null
)

@Service
class TeamService(
    private val teamRepository: TeamRepository
) {
    fun findAll(query: TeamQuery = TeamQuery()): List<TeamDto> =
        teamRepository.findAll()
            .asSequence()
            .filter { query.organizationId == null || it.organizationId == query.organizationId }
            .filter {
                query.q.isNullOrBlank() || listOfNotNull(it.name, it.description, it.key)
                    .any { text -> text.contains(query.q, ignoreCase = true) }
            }
            .sortedBy { it.id }
            .map { it.toDto() }
            .toList()

    fun findById(id: Long): TeamDto = getTeam(id).toDto()

    fun create(request: CreateTeamRequest): TeamDto =
        teamRepository.save(
            Team(
                organizationId = request.organizationId ?: 1L,
                key = request.key,
                name = request.name,
                description = request.description,
                defaultWorkflowId = request.defaultWorkflowId
            )
        ).toDto()

    fun update(id: Long, request: UpdateTeamRequest): TeamDto {
        val team = getTeam(id)
        return teamRepository.save(
            Team(
                id = team.id,
                organizationId = team.organizationId,
                key = team.key,
                name = request.name ?: team.name,
                description = request.description ?: team.description,
                defaultWorkflowId = request.defaultWorkflowId ?: team.defaultWorkflowId,
                createdAt = team.createdAt,
                updatedAt = LocalDateTime.now()
            )
        ).toDto()
    }

    fun delete(id: Long) {
        teamRepository.delete(getTeam(id))
    }

    fun requireTeam(id: Long): Team = getTeam(id)

    private fun getTeam(id: Long): Team = teamRepository.findById(id)
        .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Team not found") }

    private fun Team.toDto(): TeamDto = TeamDto(
        id = id,
        organizationId = organizationId,
        key = key,
        name = name,
        description = description,
        defaultWorkflowId = defaultWorkflowId,
        createdAt = createdAt.toString(),
        updatedAt = updatedAt.toString()
    )
}
