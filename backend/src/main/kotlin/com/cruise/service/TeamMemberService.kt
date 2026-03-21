package com.cruise.service

import com.cruise.entity.TeamMember
import com.cruise.repository.MembershipRepository
import com.cruise.repository.TeamMemberRepository
import com.cruise.repository.UserRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException

data class TeamMemberListItemDto(
    val id: Long,
    val name: String,
    val email: String?,
    val role: String,
    val skills: String?,
    val teamId: Long?,
    val createdAt: String
)

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
    private val teamMemberRepository: TeamMemberRepository,
    private val membershipRepository: MembershipRepository,
    private val userRepository: UserRepository
) {
    fun findAll(organizationId: Long? = null, teamId: Long? = null): List<TeamMemberListItemDto> {
        if (organizationId == null && teamId == null) {
            return teamMemberRepository.findAll().map { member ->
                TeamMemberListItemDto(
                    id = member.id,
                    name = member.name,
                    email = member.email,
                    role = member.role,
                    skills = member.skills,
                    teamId = member.teamId,
                    createdAt = member.createdAt?.toString() ?: ""
                )
            }
        }

        val memberships = membershipRepository.findAll()
            .asSequence()
            .filter { it.active }
            .filter { organizationId == null || it.organizationId == organizationId }
            .filter { teamId == null || it.teamId == teamId }
            .sortedBy { it.id }
            .toList()

        if (memberships.isEmpty()) return emptyList()

        val usersById = userRepository.findAllById(memberships.map { it.userId }.distinct()).associateBy { it.id }

        return memberships.mapNotNull { membership ->
            val user = usersById[membership.userId] ?: return@mapNotNull null
            TeamMemberListItemDto(
                id = user.id,
                name = user.displayName?.takeIf { it.isNotBlank() } ?: user.username,
                email = user.email,
                role = membership.role,
                skills = null,
                teamId = membership.teamId,
                createdAt = membership.joinedAt.toString()
            )
        }
    }

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
