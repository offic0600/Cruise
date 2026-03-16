package com.cruise.service

import com.cruise.entity.IssueRelation
import com.cruise.repository.IssueRelationRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDateTime

data class IssueRelationDto(
    val id: Long,
    val fromIssueId: Long,
    val toIssueId: Long,
    val relationType: String,
    val createdAt: String
)

data class CreateIssueRelationRequest(
    val fromIssueId: Long,
    val toIssueId: Long,
    val relationType: String
)

data class UpdateIssueRelationRequest(
    val toIssueId: Long? = null,
    val relationType: String? = null
)

@Service
class IssueRelationService(
    private val issueRelationRepository: IssueRelationRepository,
    private val issueService: IssueService
) {
    fun findForIssue(issueId: Long): List<IssueRelationDto> {
        issueService.getIssue(issueId)
        return (issueRelationRepository.findByFromIssueId(issueId) + issueRelationRepository.findByToIssueId(issueId))
            .distinctBy { it.id }
            .sortedBy { it.id }
            .map { it.toDto() }
    }

    fun create(request: CreateIssueRelationRequest): IssueRelationDto {
        issueService.getIssue(request.fromIssueId)
        issueService.getIssue(request.toIssueId)
        if (request.fromIssueId == request.toIssueId) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Issue relation cannot point to the same issue")
        }
        return issueRelationRepository.save(
            IssueRelation(
                fromIssueId = request.fromIssueId,
                toIssueId = request.toIssueId,
                relationType = request.relationType,
                createdAt = LocalDateTime.now()
            )
        ).toDto()
    }

    fun update(issueId: Long, relationId: Long, request: UpdateIssueRelationRequest): IssueRelationDto {
        issueService.getIssue(issueId)
        val relation = getRelation(relationId)
        if (relation.fromIssueId != issueId && relation.toIssueId != issueId) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Issue relation not found")
        }
        request.toIssueId?.let(issueService::getIssue)
        return issueRelationRepository.save(
            IssueRelation(
                id = relation.id,
                fromIssueId = relation.fromIssueId,
                toIssueId = request.toIssueId ?: relation.toIssueId,
                relationType = request.relationType ?: relation.relationType,
                createdAt = relation.createdAt
            )
        ).toDto()
    }

    fun delete(issueId: Long, relationId: Long) {
        issueService.getIssue(issueId)
        val relation = getRelation(relationId)
        if (relation.fromIssueId != issueId && relation.toIssueId != issueId) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Issue relation not found")
        }
        issueRelationRepository.delete(relation)
    }

    private fun getRelation(id: Long): IssueRelation = issueRelationRepository.findById(id)
        .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Issue relation not found") }

    private fun IssueRelation.toDto(): IssueRelationDto = IssueRelationDto(
        id = id,
        fromIssueId = fromIssueId,
        toIssueId = toIssueId,
        relationType = relationType,
        createdAt = createdAt.toString()
    )
}
