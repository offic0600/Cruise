package com.cruise.service

import com.cruise.entity.IssueLabel
import com.cruise.entity.LabelDefinition
import com.cruise.repository.IssueLabelRepository
import com.cruise.repository.LabelDefinitionRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDateTime

data class LabelDto(
    val id: Long,
    val organizationId: Long,
    val scopeType: String,
    val scopeId: Long?,
    val name: String,
    val color: String,
    val description: String?,
    val sortOrder: Int,
    val archived: Boolean,
    val createdBy: Long?,
    val createdAt: String,
    val updatedAt: String
)

data class LabelCatalogDto(
    val teamLabels: List<LabelDto>,
    val workspaceLabels: List<LabelDto>
)

data class CreateLabelRequest(
    val organizationId: Long? = null,
    val scopeType: String,
    val scopeId: Long? = null,
    val name: String,
    val color: String = "#3B82F6",
    val description: String? = null,
    val sortOrder: Int? = null,
    val createdBy: Long? = null
)

data class UpdateLabelRequest(
    val name: String? = null,
    val color: String? = null,
    val description: String? = null,
    val sortOrder: Int? = null,
    val archived: Boolean? = null
)

@Service
@Transactional
class LabelService(
    private val labelDefinitionRepository: LabelDefinitionRepository,
    private val issueLabelRepository: IssueLabelRepository
) {
    fun findCatalog(organizationId: Long?, teamId: Long?, query: String? = null): LabelCatalogDto {
        val all = labelDefinitionRepository.findByArchivedFalseOrderBySortOrderAscIdAsc()
            .asSequence()
            .filter { organizationId == null || it.organizationId == organizationId }
            .filter {
                if (it.scopeType == "WORKSPACE") true else teamId == null || it.scopeId == teamId
            }
            .filter {
                query.isNullOrBlank() || it.name.contains(query, ignoreCase = true) || (it.description?.contains(query, ignoreCase = true) == true)
            }
            .map(::toDto)
            .toList()

        return LabelCatalogDto(
            teamLabels = all.filter { it.scopeType == "TEAM" },
            workspaceLabels = all.filter { it.scopeType == "WORKSPACE" }
        )
    }

    fun findById(id: Long): LabelDto = toDto(getLabel(id))

    fun create(request: CreateLabelRequest): LabelDto {
        val scopeType = normalizeScopeType(request.scopeType)
        if (scopeType == "TEAM" && request.scopeId == null) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Team label requires scopeId")
        }
        val organizationId = request.organizationId ?: 1L
        val normalizedName = normalizeName(request.name)
        if (normalizedName.isBlank()) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Label name is required")
        }

        labelDefinitionRepository.findByOrganizationIdAndScopeTypeAndScopeIdAndNameNormalizedAndArchivedFalse(
            organizationId,
            scopeType,
            if (scopeType == "TEAM") request.scopeId else null,
            normalizedName
        )?.let {
            throw ResponseStatusException(HttpStatus.CONFLICT, "Label already exists in this scope")
        }

        val currentMaxSort = labelDefinitionRepository.findByArchivedFalseOrderBySortOrderAscIdAsc()
            .asSequence()
            .filter { it.organizationId == organizationId }
            .filter { it.scopeType == scopeType }
            .filter { if (scopeType == "TEAM") it.scopeId == request.scopeId else true }
            .maxOfOrNull { it.sortOrder } ?: 0

        return toDto(
            labelDefinitionRepository.save(
                LabelDefinition(
                    organizationId = organizationId,
                    scopeType = scopeType,
                    scopeId = if (scopeType == "TEAM") request.scopeId else null,
                    name = request.name.trim(),
                    nameNormalized = normalizedName,
                    color = normalizeColor(request.color),
                    description = request.description?.trim()?.takeIf { it.isNotBlank() },
                    sortOrder = request.sortOrder ?: currentMaxSort + 1,
                    createdBy = request.createdBy,
                    createdAt = LocalDateTime.now(),
                    updatedAt = LocalDateTime.now()
                )
            )
        )
    }

    fun update(id: Long, request: UpdateLabelRequest): LabelDto {
        val current = getLabel(id)
        val nextName = request.name?.trim()?.takeIf { it.isNotBlank() } ?: current.name
        val nextNormalizedName = normalizeName(nextName)

        labelDefinitionRepository.findByOrganizationIdAndScopeTypeAndScopeIdAndNameNormalizedAndArchivedFalse(
            current.organizationId,
            current.scopeType,
            current.scopeId,
            nextNormalizedName
        )?.takeIf { it.id != current.id }?.let {
            throw ResponseStatusException(HttpStatus.CONFLICT, "Label already exists in this scope")
        }

        return toDto(
            labelDefinitionRepository.save(
                LabelDefinition(
                    id = current.id,
                    organizationId = current.organizationId,
                    scopeType = current.scopeType,
                    scopeId = current.scopeId,
                    name = nextName,
                    nameNormalized = nextNormalizedName,
                    color = request.color?.let(::normalizeColor) ?: current.color,
                    description = request.description?.trim()?.takeIf { it.isNotBlank() } ?: current.description,
                    sortOrder = request.sortOrder ?: current.sortOrder,
                    archived = request.archived ?: current.archived,
                    createdBy = current.createdBy,
                    createdAt = current.createdAt,
                    updatedAt = LocalDateTime.now()
                )
            )
        )
    }

    fun delete(id: Long) {
        val current = getLabel(id)
        labelDefinitionRepository.delete(current)
    }

    fun getLabelsForIssues(issueIds: Collection<Long>): Map<Long, List<LabelDto>> {
        if (issueIds.isEmpty()) return emptyMap()
        val assignments = issueLabelRepository.findByIssueIdIn(issueIds)
        if (assignments.isEmpty()) return issueIds.associateWith { emptyList() }
        val labels = labelDefinitionRepository.findByIdIn(assignments.map { it.labelId }.distinct())
            .associateBy { it.id }
        return assignments.groupBy { it.issueId }
            .mapValues { (_, items) ->
                items.mapNotNull { labels[it.labelId] }.sortedWith(compareBy<LabelDefinition> { it.sortOrder }.thenBy { it.id }).map(::toDto)
            }
    }

    fun getLabelIdsForIssue(issueId: Long): List<Long> = issueLabelRepository.findByIssueId(issueId).map { it.labelId }

    fun replaceIssueLabels(issueId: Long, organizationId: Long, issueTeamId: Long?, labelIds: List<Long>?, appliedBy: Long? = null) {
        if (labelIds == null) return
        val distinctIds = labelIds.distinct()
        val labels = labelDefinitionRepository.findByIdIn(distinctIds)
        if (labels.size != distinctIds.size) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Some labels do not exist")
        }
        labels.forEach { validateIssueLabelScope(it, organizationId, issueTeamId) }

        issueLabelRepository.deleteByIssueId(issueId)
        if (labels.isEmpty()) return

        issueLabelRepository.saveAll(
            labels.map {
                IssueLabel(
                    issueId = issueId,
                    labelId = it.id,
                    appliedBy = appliedBy,
                    appliedAt = LocalDateTime.now()
                )
            }
        )
    }

    fun readLabelIdsJson(value: String?): List<Long> =
        value?.takeIf { it.isNotBlank() }
            ?.removePrefix("[")
            ?.removeSuffix("]")
            ?.split(',')
            ?.mapNotNull { it.trim().takeIf(String::isNotBlank)?.toLongOrNull() }
            ?: emptyList()

    fun writeLabelIdsJson(ids: List<Long>?): String = (ids ?: emptyList()).distinct().joinToString(prefix = "[", postfix = "]")

    private fun validateIssueLabelScope(label: LabelDefinition, organizationId: Long, issueTeamId: Long?) {
        if (label.organizationId != organizationId) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Label organization mismatch")
        }
        if (label.archived) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Archived labels cannot be assigned")
        }
        if (label.scopeType == "TEAM" && label.scopeId != issueTeamId) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Team label does not belong to issue team")
        }
    }

    private fun getLabel(id: Long): LabelDefinition = labelDefinitionRepository.findById(id)
        .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Label not found") }

    private fun normalizeScopeType(value: String): String = when (value.trim().uppercase()) {
        "WORKSPACE" -> "WORKSPACE"
        "TEAM" -> "TEAM"
        else -> throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported label scope")
    }

    private fun normalizeName(value: String): String = value.trim().lowercase()

    private fun normalizeColor(value: String): String =
        value.trim().takeIf { it.matches(Regex("#[0-9A-Fa-f]{6}")) } ?: "#3B82F6"

    private fun toDto(label: LabelDefinition) = LabelDto(
        id = label.id,
        organizationId = label.organizationId,
        scopeType = label.scopeType,
        scopeId = label.scopeId,
        name = label.name,
        color = label.color,
        description = label.description,
        sortOrder = label.sortOrder,
        archived = label.archived,
        createdBy = label.createdBy,
        createdAt = label.createdAt.toString(),
        updatedAt = label.updatedAt.toString()
    )
}
