package com.cruise.service

import com.cruise.entity.Membership
import com.cruise.repository.MembershipRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException

data class MembershipDto(
    val id: Long,
    val organizationId: Long,
    val teamId: Long,
    val userId: Long,
    val role: String,
    val title: String?,
    val joinedAt: String,
    val active: Boolean
)

data class MembershipQuery(
    val organizationId: Long? = null,
    val teamId: Long? = null,
    val userId: Long? = null,
    val active: Boolean? = null
)

data class CreateMembershipRequest(
    val organizationId: Long? = null,
    val teamId: Long,
    val userId: Long,
    val role: String? = null,
    val title: String? = null,
    val active: Boolean? = null
)

data class UpdateMembershipRequest(
    val role: String? = null,
    val title: String? = null,
    val active: Boolean? = null
)

@Service
class MembershipService(
    private val membershipRepository: MembershipRepository
) {
    fun findAll(query: MembershipQuery = MembershipQuery()): List<MembershipDto> =
        membershipRepository.findAll()
            .asSequence()
            .filter { query.organizationId == null || it.organizationId == query.organizationId }
            .filter { query.teamId == null || it.teamId == query.teamId }
            .filter { query.userId == null || it.userId == query.userId }
            .filter { query.active == null || it.active == query.active }
            .sortedBy { it.id }
            .map { it.toDto() }
            .toList()

    fun findById(id: Long): MembershipDto = getMembership(id).toDto()

    fun create(request: CreateMembershipRequest): MembershipDto =
        membershipRepository.save(
            Membership(
                organizationId = request.organizationId ?: 1L,
                teamId = request.teamId,
                userId = request.userId,
                role = request.role ?: "MEMBER",
                title = request.title,
                active = request.active ?: true
            )
        ).toDto()

    fun update(id: Long, request: UpdateMembershipRequest): MembershipDto {
        val membership = getMembership(id)
        return membershipRepository.save(
            Membership(
                id = membership.id,
                organizationId = membership.organizationId,
                teamId = membership.teamId,
                userId = membership.userId,
                role = request.role ?: membership.role,
                title = request.title ?: membership.title,
                joinedAt = membership.joinedAt,
                active = request.active ?: membership.active
            )
        ).toDto()
    }

    fun delete(id: Long) {
        membershipRepository.delete(getMembership(id))
    }

    private fun getMembership(id: Long): Membership = membershipRepository.findById(id)
        .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Membership not found") }

    private fun Membership.toDto(): MembershipDto = MembershipDto(
        id = id,
        organizationId = organizationId,
        teamId = teamId,
        userId = userId,
        role = role,
        title = title,
        joinedAt = joinedAt.toString(),
        active = active
    )
}
