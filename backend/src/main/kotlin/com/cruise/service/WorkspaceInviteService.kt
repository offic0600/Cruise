package com.cruise.service

import com.cruise.config.AuthProperties
import com.cruise.entity.Membership
import com.cruise.entity.WorkspaceInvite
import com.cruise.repository.MembershipRepository
import com.cruise.repository.OrganizationRepository
import com.cruise.repository.TeamRepository
import com.cruise.repository.UserRepository
import com.cruise.repository.WorkspaceInviteRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDateTime
import java.util.UUID

data class WorkspaceInviteDto(
    val id: Long,
    val organizationId: Long,
    val teamId: Long?,
    val code: String,
    val email: String?,
    val role: String,
    val createdBy: Long,
    val createdAt: String,
    val expiresAt: String?,
    val usedAt: String?,
    val inviteUrl: String
)

data class CreateWorkspaceInviteRequest(
    val teamId: Long? = null,
    val email: String? = null,
    val role: String = "MEMBER",
    val expiresInDays: Long? = 7
)

data class JoinWorkspaceInviteRequest(
    val inviteCodeOrLink: String
)

data class JoinWorkspaceInviteResponse(
    val organization: OrganizationDto,
    val team: TeamDto,
    val membership: MembershipDto,
    val authSession: AuthSessionResponse
)

@Service
class WorkspaceInviteService(
    private val workspaceInviteRepository: WorkspaceInviteRepository,
    private val organizationRepository: OrganizationRepository,
    private val teamRepository: TeamRepository,
    private val membershipRepository: MembershipRepository,
    private val userRepository: UserRepository,
    private val identityProvisioningService: IdentityProvisioningService,
    private val authProperties: AuthProperties
) {
    @Transactional
    fun createInvite(username: String, organizationId: Long, request: CreateWorkspaceInviteRequest): WorkspaceInviteDto {
        val user = requireUser(username)
        val membership = membershipRepository.findFirstByUserIdAndOrganizationIdAndActiveTrue(user.id, organizationId)
            ?: throw ResponseStatusException(HttpStatus.FORBIDDEN, "You do not belong to this workspace")
        if (membership.role !in setOf("OWNER", "ADMIN")) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Only workspace admins can create invites")
        }

        val organization = organizationRepository.findById(organizationId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Workspace not found") }
        val team = request.teamId?.let { requestedTeamId ->
            teamRepository.findById(requestedTeamId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Team not found") }
                .also {
                    if (it.organizationId != organization.id) {
                        throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Team does not belong to this workspace")
                    }
                }
        } ?: teamRepository.findByOrganizationId(organization.id).sortedBy { it.id }.firstOrNull()

        val now = LocalDateTime.now()
        val invite = workspaceInviteRepository.save(
            WorkspaceInvite(
                organizationId = organization.id,
                teamId = team?.id,
                code = generateCode(),
                email = request.email?.trim()?.lowercase()?.ifBlank { null },
                role = request.role.ifBlank { "MEMBER" },
                createdBy = user.id,
                createdAt = now,
                expiresAt = request.expiresInDays?.takeIf { it > 0 }?.let { now.plusDays(it) }
            )
        )

        return invite.toDto()
    }

    @Transactional
    fun joinInvite(username: String, request: JoinWorkspaceInviteRequest): JoinWorkspaceInviteResponse {
        val user = requireUser(username)
        val code = extractCode(request.inviteCodeOrLink)
        if (code.isBlank()) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Invite code is required")
        }

        val invite = workspaceInviteRepository.findByCode(code)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Invite not found")
        if (invite.usedAt != null) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "Invite has already been used")
        }
        if (invite.expiresAt != null && invite.expiresAt!!.isBefore(LocalDateTime.now())) {
            throw ResponseStatusException(HttpStatus.GONE, "Invite has expired")
        }
        if (!invite.email.isNullOrBlank() && !invite.email.equals(user.email, ignoreCase = true)) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Invite is restricted to a different email address")
        }

        val organization = organizationRepository.findById(invite.organizationId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Workspace not found") }
        val existingMembership = membershipRepository.findFirstByUserIdAndOrganizationIdAndActiveTrue(user.id, organization.id)
        if (existingMembership != null) {
            val existingTeam = teamRepository.findById(existingMembership.teamId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Team not found") }
            val authSession = identityProvisioningService.issueSession(user, organizationIdOverride = organization.id)
            return JoinWorkspaceInviteResponse(
                organization = organization.toDto(),
                team = existingTeam.toDto(),
                membership = existingMembership.toDto(),
                authSession = authSession
            )
        }

        val team = invite.teamId?.let { teamId ->
            teamRepository.findById(teamId).orElse(null)
        } ?: teamRepository.findByOrganizationId(organization.id).sortedBy { it.id }.firstOrNull()
        ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Workspace has no available team to join")

        val membership = membershipRepository.save(
            Membership(
                organizationId = organization.id,
                teamId = team.id,
                userId = user.id,
                role = invite.role.ifBlank { "MEMBER" },
                joinedAt = LocalDateTime.now(),
                active = true
            )
        )

        invite.usedAt = LocalDateTime.now()
        workspaceInviteRepository.save(invite)

        return JoinWorkspaceInviteResponse(
            organization = organization.toDto(),
            team = team.toDto(),
            membership = membership.toDto(),
            authSession = identityProvisioningService.issueSession(user, organizationIdOverride = organization.id)
        )
    }

    private fun requireUser(username: String) =
        userRepository.findByUsername(username)
            ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found")

    private fun extractCode(value: String): String {
        val trimmed = value.trim()
        if (trimmed.isBlank()) return ""
        val marker = "invite="
        if (trimmed.contains(marker, ignoreCase = true)) {
            return trimmed.substringAfter(marker).substringBefore('&').trim()
        }
        return trimmed.substringAfterLast('/').trim().ifBlank { trimmed }
    }

    private fun generateCode(): String {
        var code: String
        do {
            code = "ws_${UUID.randomUUID().toString().replace("-", "").take(16)}"
        } while (workspaceInviteRepository.existsByCode(code))
        return code
    }

    private fun WorkspaceInvite.toDto(): WorkspaceInviteDto = WorkspaceInviteDto(
        id = id,
        organizationId = organizationId,
        teamId = teamId,
        code = code,
        email = email,
        role = role,
        createdBy = createdBy,
        createdAt = createdAt.toString(),
        expiresAt = expiresAt?.toString(),
        usedAt = usedAt?.toString(),
        inviteUrl = "${authProperties.frontendBaseUrl.trimEnd('/')}/create-workspace?invite=$code"
    )

    private fun com.cruise.entity.Organization.toDto(): OrganizationDto = OrganizationDto(
        id = id,
        name = name,
        slug = slug,
        region = region,
        status = status,
        createdAt = createdAt.toString(),
        updatedAt = updatedAt.toString()
    )

    private fun com.cruise.entity.Team.toDto(): TeamDto = TeamDto(
        id = id,
        organizationId = organizationId,
        key = key,
        name = name,
        description = description,
        defaultWorkflowId = defaultWorkflowId,
        createdAt = createdAt.toString(),
        updatedAt = updatedAt.toString()
    )

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
