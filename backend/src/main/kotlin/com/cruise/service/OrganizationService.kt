package com.cruise.service

import com.cruise.entity.Membership
import com.cruise.entity.Organization
import com.cruise.entity.Team
import com.cruise.entity.User
import com.cruise.entity.Workflow
import com.cruise.entity.WorkflowState
import com.cruise.entity.WorkflowTransition
import com.cruise.repository.MembershipRepository
import com.cruise.repository.OrganizationRepository
import com.cruise.repository.TeamRepository
import com.cruise.repository.UserRepository
import com.cruise.repository.WorkflowRepository
import com.cruise.repository.WorkflowStateRepository
import com.cruise.repository.WorkflowTransitionRepository
import com.cruise.security.CustomUserDetailsService
import com.cruise.security.JwtTokenProvider
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDateTime

data class OrganizationDto(
    val id: Long,
    val name: String,
    val slug: String,
    val region: String,
    val status: String,
    val createdAt: String,
    val updatedAt: String
)

data class SlugAvailabilityDto(
    val slug: String,
    val available: Boolean
)

data class CreateOrganizationRequest(
    val name: String,
    val slug: String,
    val region: String = "Asia Pacific",
    val initialTeamName: String? = null
)

data class CreateOrganizationResponse(
    val organization: OrganizationDto,
    val initialTeam: TeamDto,
    val membership: MembershipDto,
    val authSession: AuthSessionResponse
)

@Service
class OrganizationService(
    private val organizationRepository: OrganizationRepository,
    private val membershipRepository: MembershipRepository,
    private val teamRepository: TeamRepository,
    private val workflowRepository: WorkflowRepository,
    private val workflowStateRepository: WorkflowStateRepository,
    private val workflowTransitionRepository: WorkflowTransitionRepository,
    private val userRepository: UserRepository,
    private val customUserDetailsService: CustomUserDetailsService,
    private val jwtTokenProvider: JwtTokenProvider
) {
    fun findVisibleOrganizations(username: String): List<OrganizationDto> {
        val user = requireUser(username)
        val organizationIds = membershipRepository.findByUserIdAndActiveTrue(user.id)
            .map { it.organizationId }
            .distinct()

        if (organizationIds.isEmpty()) return emptyList()

        return organizationRepository.findAllById(organizationIds)
            .sortedBy { it.id }
            .map { it.toDto() }
    }

    fun checkSlugAvailability(slug: String): SlugAvailabilityDto {
        val normalized = normalizeSlug(slug)
        return SlugAvailabilityDto(
            slug = normalized,
            available = normalized.isNotBlank() && !organizationRepository.existsBySlug(normalized)
        )
    }

    @Transactional
    fun create(username: String, request: CreateOrganizationRequest): CreateOrganizationResponse {
        val user = requireUser(username)
        val name = request.name.trim()
        if (name.isBlank()) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Workspace name is required")
        }

        val slug = normalizeSlug(request.slug)
        if (slug.isBlank()) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Workspace URL is required")
        }
        if (organizationRepository.existsBySlug(slug)) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "Workspace URL is already taken")
        }

        val now = LocalDateTime.now()
        val organization = organizationRepository.save(
            Organization(
                name = name,
                slug = slug,
                region = request.region.ifBlank { "Asia Pacific" },
                status = "ACTIVE",
                createdAt = now,
                updatedAt = now
            )
        )

        val initialTeamName = request.initialTeamName?.trim().takeUnless { it.isNullOrBlank() } ?: name
        val team = teamRepository.save(
            Team(
                organizationId = organization.id,
                key = generateUniqueTeamKey(organization.slug),
                name = initialTeamName,
                createdAt = now,
                updatedAt = now
            )
        )

        val workflow = workflowRepository.save(
            Workflow(
                teamId = team.id,
                name = "Default workflow",
                appliesToType = "ALL",
                isDefault = true,
                createdAt = now
            )
        )
        val states = listOf(
            WorkflowState(workflowId = workflow.id, key = "backlog", label = "Backlog", category = "BACKLOG", sortOrder = 0),
            WorkflowState(workflowId = workflow.id, key = "todo", label = "Todo", category = "ACTIVE", sortOrder = 1),
            WorkflowState(workflowId = workflow.id, key = "in_progress", label = "In Progress", category = "ACTIVE", sortOrder = 2),
            WorkflowState(workflowId = workflow.id, key = "done", label = "Done", category = "COMPLETED", sortOrder = 3)
        )
        workflowStateRepository.saveAll(states)
        workflowTransitionRepository.saveAll(
            listOf(
                WorkflowTransition(workflowId = workflow.id, fromStateKey = "backlog", toStateKey = "todo"),
                WorkflowTransition(workflowId = workflow.id, fromStateKey = "todo", toStateKey = "in_progress"),
                WorkflowTransition(workflowId = workflow.id, fromStateKey = "in_progress", toStateKey = "done")
            )
        )

        team.defaultWorkflowId = workflow.id
        val updatedTeam = teamRepository.save(team)

        val membership = membershipRepository.save(
            Membership(
                organizationId = organization.id,
                teamId = updatedTeam.id,
                userId = user.id,
                role = "OWNER",
                joinedAt = now,
                active = true
            )
        )

        val userDetails = customUserDetailsService.loadUserByUsername(user.username)
        val token = jwtTokenProvider.generateToken(userDetails, user.id, organization.id, user.role)

        return CreateOrganizationResponse(
            organization = organization.toDto(),
            initialTeam = updatedTeam.toDto(),
            membership = membership.toDto(),
            authSession = AuthSessionResponse(
                token = token,
                userId = user.id,
                username = user.username,
                email = user.email,
                role = user.role,
                organizationId = organization.id
            )
        )
    }

    private fun requireUser(username: String): User =
        userRepository.findByUsername(username)
            ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found")

    private fun normalizeSlug(value: String): String =
        value.trim()
            .lowercase()
            .replace(Regex("[^a-z0-9-]+"), "-")
            .replace(Regex("-{2,}"), "-")
            .trim('-')

    private fun generateUniqueTeamKey(seed: String): String {
        val base = seed.uppercase().replace(Regex("[^A-Z0-9]"), "").take(6).ifBlank { "TEAM" }
        var candidate = base
        var counter = 1
        while (teamRepository.findAll().any { it.key == candidate }) {
            val suffix = counter.toString()
            candidate = (base.take((6 - suffix.length).coerceAtLeast(1)) + suffix).take(6)
            counter += 1
        }
        return candidate
    }

    private fun Organization.toDto(): OrganizationDto = OrganizationDto(
        id = id,
        name = name,
        slug = slug,
        region = region,
        status = status,
        createdAt = createdAt.toString(),
        updatedAt = updatedAt.toString()
    )

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
