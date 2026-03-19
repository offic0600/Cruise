package com.cruise.service

import com.cruise.entity.*
import com.cruise.repository.*
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDate
import java.time.LocalDateTime

data class CycleDto(val id: Long, val organizationId: Long, val teamId: Long, val name: String, val description: String?, val number: Int, val startsAt: String?, val endsAt: String?, val completedAt: String?, val createdAt: String, val updatedAt: String, val archivedAt: String?)
data class ProjectStatusDto(val id: Long, val organizationId: Long, val name: String, val color: String?, val type: String, val sortOrder: Int, val createdAt: String, val updatedAt: String, val archivedAt: String?)
data class InitiativeRelationDto(val id: Long, val initiativeId: Long, val relatedInitiativeId: Long, val sortOrder: Int, val createdAt: String, val updatedAt: String, val archivedAt: String?)
data class CustomerStatusDto(val id: Long, val organizationId: Long, val name: String, val color: String?, val sortOrder: Int, val createdAt: String, val updatedAt: String, val archivedAt: String?)
data class CustomerTierDto(val id: Long, val organizationId: Long, val name: String, val color: String?, val sortOrder: Int, val createdAt: String, val updatedAt: String, val archivedAt: String?)
data class ExternalEntityInfoDto(val id: Long, val service: String, val entityType: String, val entityId: Long, val externalId: String, val externalUrl: String?, val metadataJson: String?, val createdAt: String, val updatedAt: String)
data class ExternalUserDto(val id: Long, val service: String, val externalId: String, val name: String?, val avatarUrl: String?, val createdAt: String, val updatedAt: String)
data class EntityExternalLinkDto(val id: Long, val entityType: String, val entityId: Long, val title: String, val url: String, val createdAt: String, val updatedAt: String)
data class AgentActivityDto(val id: Long, val agentSessionId: Long, val type: String, val content: String?, val issueId: Long?, val commentId: Long?, val createdAt: String)
data class ReactionDto(val id: Long, val userId: Long, val issueId: Long?, val commentId: Long?, val projectUpdateId: Long?, val initiativeUpdateId: Long?, val emoji: String, val createdAt: String)

data class CreateCycleRequest(val organizationId: Long, val teamId: Long, val name: String, val description: String? = null, val number: Int? = null, val startsAt: String? = null, val endsAt: String? = null, val completedAt: String? = null)
data class UpdateCycleRequest(val organizationId: Long? = null, val teamId: Long? = null, val name: String? = null, val description: String? = null, val number: Int? = null, val startsAt: String? = null, val endsAt: String? = null, val completedAt: String? = null, val archivedAt: String? = null)
data class CreateProjectStatusRequest(val organizationId: Long, val name: String, val color: String? = null, val type: String? = null, val sortOrder: Int? = null)
data class UpdateProjectStatusRequest(val organizationId: Long? = null, val name: String? = null, val color: String? = null, val type: String? = null, val sortOrder: Int? = null, val archivedAt: String? = null)
data class CreateInitiativeRelationRequest(val relatedInitiativeId: Long, val sortOrder: Int? = null)
data class UpdateInitiativeRelationRequest(val relatedInitiativeId: Long? = null, val sortOrder: Int? = null, val archivedAt: String? = null)
data class CreateCustomerStatusRequest(val organizationId: Long, val name: String, val color: String? = null, val sortOrder: Int? = null)
data class UpdateCustomerStatusRequest(val organizationId: Long? = null, val name: String? = null, val color: String? = null, val sortOrder: Int? = null, val archivedAt: String? = null)
data class CreateCustomerTierRequest(val organizationId: Long, val name: String, val color: String? = null, val sortOrder: Int? = null)
data class UpdateCustomerTierRequest(val organizationId: Long? = null, val name: String? = null, val color: String? = null, val sortOrder: Int? = null, val archivedAt: String? = null)
data class CreateExternalEntityInfoRequest(val service: String, val entityType: String, val entityId: Long, val externalId: String, val externalUrl: String? = null, val metadataJson: String? = null)
data class UpdateExternalEntityInfoRequest(val service: String? = null, val entityType: String? = null, val entityId: Long? = null, val externalId: String? = null, val externalUrl: String? = null, val metadataJson: String? = null)
data class CreateExternalUserRequest(val service: String, val externalId: String, val name: String? = null, val avatarUrl: String? = null)
data class UpdateExternalUserRequest(val service: String? = null, val externalId: String? = null, val name: String? = null, val avatarUrl: String? = null)
data class CreateEntityExternalLinkRequest(val entityType: String, val entityId: Long, val title: String, val url: String)
data class UpdateEntityExternalLinkRequest(val entityType: String? = null, val entityId: Long? = null, val title: String? = null, val url: String? = null)
data class CreateAgentActivityRequest(val agentSessionId: Long, val type: String? = null, val content: String? = null, val issueId: Long? = null, val commentId: Long? = null)
data class UpdateAgentActivityRequest(val agentSessionId: Long? = null, val type: String? = null, val content: String? = null, val issueId: Long? = null, val commentId: Long? = null)
data class CreateReactionRequest(val userId: Long, val issueId: Long? = null, val commentId: Long? = null, val projectUpdateId: Long? = null, val initiativeUpdateId: Long? = null, val emoji: String)

@Service
class ResourceCatalogService(
    private val cycleRepository: CycleRepository,
    private val projectStatusRepository: ProjectStatusRepository,
    private val initiativeRelationRepository: InitiativeRelationRepository,
    private val customerStatusRepository: CustomerStatusRepository,
    private val customerTierRepository: CustomerTierRepository,
    private val externalEntityInfoRepository: ExternalEntityInfoRepository,
    private val externalUserRepository: ExternalUserRepository,
    private val entityExternalLinkRepository: EntityExternalLinkRepository,
    private val agentActivityRepository: AgentActivityRepository,
    private val reactionRepository: ReactionRepository
) {
    fun listCycles(organizationId: Long?, teamId: Long?, includeArchived: Boolean) = cycleRepository.findAll().asSequence().filter { organizationId == null || it.organizationId == organizationId }.filter { teamId == null || it.teamId == teamId }.filter { includeArchived || it.archivedAt == null }.sortedWith(compareBy<Cycle> { it.teamId }.thenBy { it.number }.thenBy { it.id }).map { it.toDto() }.toList()
    fun createCycle(request: CreateCycleRequest) = cycleRepository.save(Cycle(organizationId = request.organizationId, teamId = request.teamId, name = request.name, description = request.description, number = request.number ?: 1, startsAt = parseDate(request.startsAt), endsAt = parseDate(request.endsAt), completedAt = parseDateTime(request.completedAt))).toDto()
    fun updateCycle(id: Long, request: UpdateCycleRequest): CycleDto { val current = cycleRepository.findById(id).orElseThrow { notFound("Cycle") }; return cycleRepository.save(Cycle(id = current.id, organizationId = request.organizationId ?: current.organizationId, teamId = request.teamId ?: current.teamId, name = request.name ?: current.name, description = request.description ?: current.description, number = request.number ?: current.number, startsAt = parseDate(request.startsAt) ?: current.startsAt, endsAt = parseDate(request.endsAt) ?: current.endsAt, completedAt = parseDateTime(request.completedAt) ?: current.completedAt, createdAt = current.createdAt, updatedAt = LocalDateTime.now(), archivedAt = parseDateTime(request.archivedAt) ?: current.archivedAt)).toDto() }
    fun deleteCycle(id: Long) { cycleRepository.delete(cycleRepository.findById(id).orElseThrow { notFound("Cycle") }) }

    fun listProjectStatuses(organizationId: Long?, includeArchived: Boolean) = projectStatusRepository.findAll().asSequence().filter { organizationId == null || it.organizationId == organizationId }.filter { includeArchived || it.archivedAt == null }.sortedWith(compareBy<ProjectStatus> { it.sortOrder }.thenBy { it.id }).map { it.toDto() }.toList()
    fun createProjectStatus(request: CreateProjectStatusRequest) = projectStatusRepository.save(ProjectStatus(organizationId = request.organizationId, name = request.name, color = request.color, type = request.type ?: "active", sortOrder = request.sortOrder ?: 0)).toDto()
    fun updateProjectStatus(id: Long, request: UpdateProjectStatusRequest): ProjectStatusDto { val current = projectStatusRepository.findById(id).orElseThrow { notFound("Project status") }; return projectStatusRepository.save(ProjectStatus(id = current.id, organizationId = request.organizationId ?: current.organizationId, name = request.name ?: current.name, color = request.color ?: current.color, type = request.type ?: current.type, sortOrder = request.sortOrder ?: current.sortOrder, createdAt = current.createdAt, updatedAt = LocalDateTime.now(), archivedAt = parseDateTime(request.archivedAt) ?: current.archivedAt)).toDto() }
    fun deleteProjectStatus(id: Long) { projectStatusRepository.delete(projectStatusRepository.findById(id).orElseThrow { notFound("Project status") }) }

    fun listInitiativeRelations(initiativeId: Long, includeArchived: Boolean) = initiativeRelationRepository.findAll().asSequence().filter { it.initiativeId == initiativeId }.filter { includeArchived || it.archivedAt == null }.sortedWith(compareBy<InitiativeRelation> { it.sortOrder }.thenBy { it.id }).map { it.toDto() }.toList()
    fun createInitiativeRelation(initiativeId: Long, request: CreateInitiativeRelationRequest) = initiativeRelationRepository.save(InitiativeRelation(initiativeId = initiativeId, relatedInitiativeId = request.relatedInitiativeId, sortOrder = request.sortOrder ?: 0)).toDto()
    fun updateInitiativeRelation(initiativeId: Long, id: Long, request: UpdateInitiativeRelationRequest): InitiativeRelationDto { val current = initiativeRelationRepository.findById(id).filter { it.initiativeId == initiativeId }.orElseThrow { notFound("Initiative relation") }; return initiativeRelationRepository.save(InitiativeRelation(id = current.id, initiativeId = current.initiativeId, relatedInitiativeId = request.relatedInitiativeId ?: current.relatedInitiativeId, sortOrder = request.sortOrder ?: current.sortOrder, createdAt = current.createdAt, updatedAt = LocalDateTime.now(), archivedAt = parseDateTime(request.archivedAt) ?: current.archivedAt)).toDto() }
    fun deleteInitiativeRelation(initiativeId: Long, id: Long) { initiativeRelationRepository.delete(initiativeRelationRepository.findById(id).filter { it.initiativeId == initiativeId }.orElseThrow { notFound("Initiative relation") }) }

    fun listCustomerStatuses(organizationId: Long?, includeArchived: Boolean) = customerStatusRepository.findAll().asSequence().filter { organizationId == null || it.organizationId == organizationId }.filter { includeArchived || it.archivedAt == null }.sortedWith(compareBy<CustomerStatus> { it.sortOrder }.thenBy { it.id }).map { it.toDto() }.toList()
    fun createCustomerStatus(request: CreateCustomerStatusRequest) = customerStatusRepository.save(CustomerStatus(organizationId = request.organizationId, name = request.name, color = request.color, sortOrder = request.sortOrder ?: 0)).toDto()
    fun updateCustomerStatus(id: Long, request: UpdateCustomerStatusRequest): CustomerStatusDto { val current = customerStatusRepository.findById(id).orElseThrow { notFound("Customer status") }; return customerStatusRepository.save(CustomerStatus(id = current.id, organizationId = request.organizationId ?: current.organizationId, name = request.name ?: current.name, color = request.color ?: current.color, sortOrder = request.sortOrder ?: current.sortOrder, createdAt = current.createdAt, updatedAt = LocalDateTime.now(), archivedAt = parseDateTime(request.archivedAt) ?: current.archivedAt)).toDto() }
    fun deleteCustomerStatus(id: Long) { customerStatusRepository.delete(customerStatusRepository.findById(id).orElseThrow { notFound("Customer status") }) }

    fun listCustomerTiers(organizationId: Long?, includeArchived: Boolean) = customerTierRepository.findAll().asSequence().filter { organizationId == null || it.organizationId == organizationId }.filter { includeArchived || it.archivedAt == null }.sortedWith(compareBy<CustomerTier> { it.sortOrder }.thenBy { it.id }).map { it.toDto() }.toList()
    fun createCustomerTier(request: CreateCustomerTierRequest) = customerTierRepository.save(CustomerTier(organizationId = request.organizationId, name = request.name, color = request.color, sortOrder = request.sortOrder ?: 0)).toDto()
    fun updateCustomerTier(id: Long, request: UpdateCustomerTierRequest): CustomerTierDto { val current = customerTierRepository.findById(id).orElseThrow { notFound("Customer tier") }; return customerTierRepository.save(CustomerTier(id = current.id, organizationId = request.organizationId ?: current.organizationId, name = request.name ?: current.name, color = request.color ?: current.color, sortOrder = request.sortOrder ?: current.sortOrder, createdAt = current.createdAt, updatedAt = LocalDateTime.now(), archivedAt = parseDateTime(request.archivedAt) ?: current.archivedAt)).toDto() }
    fun deleteCustomerTier(id: Long) { customerTierRepository.delete(customerTierRepository.findById(id).orElseThrow { notFound("Customer tier") }) }

    fun listExternalEntityInfo(service: String?, entityType: String?, entityId: Long?) = externalEntityInfoRepository.findAll().asSequence().filter { service == null || it.service == service }.filter { entityType == null || it.entityType == entityType }.filter { entityId == null || it.entityId == entityId }.sortedByDescending { it.id }.map { it.toDto() }.toList()
    fun createExternalEntityInfo(request: CreateExternalEntityInfoRequest) = externalEntityInfoRepository.save(ExternalEntityInfo(service = request.service, entityType = request.entityType, entityId = request.entityId, externalId = request.externalId, externalUrl = request.externalUrl, metadataJson = request.metadataJson)).toDto()
    fun updateExternalEntityInfo(id: Long, request: UpdateExternalEntityInfoRequest): ExternalEntityInfoDto { val current = externalEntityInfoRepository.findById(id).orElseThrow { notFound("External entity info") }; return externalEntityInfoRepository.save(ExternalEntityInfo(id = current.id, service = request.service ?: current.service, entityType = request.entityType ?: current.entityType, entityId = request.entityId ?: current.entityId, externalId = request.externalId ?: current.externalId, externalUrl = request.externalUrl ?: current.externalUrl, metadataJson = request.metadataJson ?: current.metadataJson, createdAt = current.createdAt, updatedAt = LocalDateTime.now())).toDto() }
    fun deleteExternalEntityInfo(id: Long) { externalEntityInfoRepository.delete(externalEntityInfoRepository.findById(id).orElseThrow { notFound("External entity info") }) }

    fun listExternalUsers(service: String?) = externalUserRepository.findAll().asSequence().filter { service == null || it.service == service }.sortedByDescending { it.id }.map { it.toDto() }.toList()
    fun createExternalUser(request: CreateExternalUserRequest) = externalUserRepository.save(ExternalUser(service = request.service, externalId = request.externalId, name = request.name, avatarUrl = request.avatarUrl)).toDto()
    fun updateExternalUser(id: Long, request: UpdateExternalUserRequest): ExternalUserDto { val current = externalUserRepository.findById(id).orElseThrow { notFound("External user") }; return externalUserRepository.save(ExternalUser(id = current.id, service = request.service ?: current.service, externalId = request.externalId ?: current.externalId, name = request.name ?: current.name, avatarUrl = request.avatarUrl ?: current.avatarUrl, createdAt = current.createdAt, updatedAt = LocalDateTime.now())).toDto() }
    fun deleteExternalUser(id: Long) { externalUserRepository.delete(externalUserRepository.findById(id).orElseThrow { notFound("External user") }) }

    fun listEntityExternalLinks(entityType: String?, entityId: Long?) = entityExternalLinkRepository.findAll().asSequence().filter { entityType == null || it.entityType == entityType }.filter { entityId == null || it.entityId == entityId }.sortedByDescending { it.id }.map { it.toDto() }.toList()
    fun createEntityExternalLink(request: CreateEntityExternalLinkRequest) = entityExternalLinkRepository.save(EntityExternalLink(entityType = request.entityType, entityId = request.entityId, title = request.title, url = request.url)).toDto()
    fun updateEntityExternalLink(id: Long, request: UpdateEntityExternalLinkRequest): EntityExternalLinkDto { val current = entityExternalLinkRepository.findById(id).orElseThrow { notFound("Entity external link") }; return entityExternalLinkRepository.save(EntityExternalLink(id = current.id, entityType = request.entityType ?: current.entityType, entityId = request.entityId ?: current.entityId, title = request.title ?: current.title, url = request.url ?: current.url, createdAt = current.createdAt, updatedAt = LocalDateTime.now())).toDto() }
    fun deleteEntityExternalLink(id: Long) { entityExternalLinkRepository.delete(entityExternalLinkRepository.findById(id).orElseThrow { notFound("Entity external link") }) }

    fun listAgentActivities(agentSessionId: Long?) = agentActivityRepository.findAll().asSequence().filter { agentSessionId == null || it.agentSessionId == agentSessionId }.sortedByDescending { it.id }.map { it.toDto() }.toList()
    fun createAgentActivity(request: CreateAgentActivityRequest) = agentActivityRepository.save(AgentActivity(agentSessionId = request.agentSessionId, type = request.type ?: "message", content = request.content, issueId = request.issueId, commentId = request.commentId)).toDto()
    fun updateAgentActivity(id: Long, request: UpdateAgentActivityRequest): AgentActivityDto { val current = agentActivityRepository.findById(id).orElseThrow { notFound("Agent activity") }; return agentActivityRepository.save(AgentActivity(id = current.id, agentSessionId = request.agentSessionId ?: current.agentSessionId, type = request.type ?: current.type, content = request.content ?: current.content, issueId = request.issueId ?: current.issueId, commentId = request.commentId ?: current.commentId, createdAt = current.createdAt)).toDto() }
    fun deleteAgentActivity(id: Long) { agentActivityRepository.delete(agentActivityRepository.findById(id).orElseThrow { notFound("Agent activity") }) }

    fun listReactions(issueId: Long?, commentId: Long?, projectUpdateId: Long?, initiativeUpdateId: Long?) = reactionRepository.findAll().asSequence().filter { issueId == null || it.issueId == issueId }.filter { commentId == null || it.commentId == commentId }.filter { projectUpdateId == null || it.projectUpdateId == projectUpdateId }.filter { initiativeUpdateId == null || it.initiativeUpdateId == initiativeUpdateId }.sortedByDescending { it.id }.map { it.toDto() }.toList()
    fun createReaction(request: CreateReactionRequest) = reactionRepository.save(Reaction(userId = request.userId, issueId = request.issueId, commentId = request.commentId, projectUpdateId = request.projectUpdateId, initiativeUpdateId = request.initiativeUpdateId, emoji = request.emoji)).toDto()
    fun deleteReaction(id: Long) { reactionRepository.delete(reactionRepository.findById(id).orElseThrow { notFound("Reaction") }) }

    private fun Cycle.toDto() = CycleDto(id, organizationId, teamId, name, description, number, startsAt?.toString(), endsAt?.toString(), completedAt?.toString(), createdAt.toString(), updatedAt.toString(), archivedAt?.toString())
    private fun ProjectStatus.toDto() = ProjectStatusDto(id, organizationId, name, color, type, sortOrder, createdAt.toString(), updatedAt.toString(), archivedAt?.toString())
    private fun InitiativeRelation.toDto() = InitiativeRelationDto(id, initiativeId, relatedInitiativeId, sortOrder, createdAt.toString(), updatedAt.toString(), archivedAt?.toString())
    private fun CustomerStatus.toDto() = CustomerStatusDto(id, organizationId, name, color, sortOrder, createdAt.toString(), updatedAt.toString(), archivedAt?.toString())
    private fun CustomerTier.toDto() = CustomerTierDto(id, organizationId, name, color, sortOrder, createdAt.toString(), updatedAt.toString(), archivedAt?.toString())
    private fun ExternalEntityInfo.toDto() = ExternalEntityInfoDto(id, service, entityType, entityId, externalId, externalUrl, metadataJson, createdAt.toString(), updatedAt.toString())
    private fun ExternalUser.toDto() = ExternalUserDto(id, service, externalId, name, avatarUrl, createdAt.toString(), updatedAt.toString())
    private fun EntityExternalLink.toDto() = EntityExternalLinkDto(id, entityType, entityId, title, url, createdAt.toString(), updatedAt.toString())
    private fun AgentActivity.toDto() = AgentActivityDto(id, agentSessionId, type, content, issueId, commentId, createdAt.toString())
    private fun Reaction.toDto() = ReactionDto(id, userId, issueId, commentId, projectUpdateId, initiativeUpdateId, emoji, createdAt.toString())

    private fun parseDate(value: String?) = value?.takeIf(String::isNotBlank)?.let(LocalDate::parse)
    private fun parseDateTime(value: String?) = value?.takeIf(String::isNotBlank)?.let(LocalDateTime::parse)
    private fun notFound(name: String) = ResponseStatusException(HttpStatus.NOT_FOUND, "$name not found")
}
