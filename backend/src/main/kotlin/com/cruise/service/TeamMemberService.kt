package com.cruise.service

import com.cruise.entity.TeamMember
import com.cruise.repository.TeamMemberRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException

data class CreateTeamMemberRequest(
    val name: String,
    val email: String?,
    val role: String = "DEVELOPER",
    val skills: String?,
    val teamId: Long?
)

data class UpdateTeamMemberRequest(
    val name: String?,
    val email: String?,
    val role: String?,
    val skills: String?,
    val teamId: Long?
)

@Service
class TeamMemberService(
    private val teamMemberRepository: TeamMemberRepository
) {
    fun findAll(): List<TeamMember> = teamMemberRepository.findAll()

    fun findById(id: Long): TeamMember = teamMemberRepository.findById(id)
        .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Team member not found") }

    fun findByTeamId(teamId: Long): List<TeamMember> =
        teamMemberRepository.findByTeamId(teamId)

    fun create(request: CreateTeamMemberRequest): TeamMember {
        val member = TeamMember(
            name = request.name,
            email = request.email,
            role = request.role,
            skills = request.skills,
            teamId = request.teamId
        )
        return teamMemberRepository.save(member)
    }

    fun update(id: Long, request: UpdateTeamMemberRequest): TeamMember {
        val member = findById(id)

        val updated = TeamMember(
            id = member.id,
            name = request.name ?: member.name,
            email = request.email ?: member.email,
            role = request.role ?: member.role,
            skills = request.skills ?: member.skills,
            teamId = request.teamId ?: member.teamId,
            createdAt = member.createdAt
        )

        return teamMemberRepository.save(updated)
    }

    fun delete(id: Long) {
        val member = findById(id)
        teamMemberRepository.delete(member)
    }
}