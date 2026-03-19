package com.cruise.service

import org.springframework.stereotype.Service

data class CreateIssueTagRequest(
    val organizationId: Long? = null,
    val teamId: Long? = null,
    val scopeType: String? = null,
    val name: String,
    val color: String = "#3B82F6",
    val sortOrder: Int = 0
)

data class UpdateIssueTagRequest(
    val name: String?,
    val color: String?,
    val sortOrder: Int?,
    val archived: Boolean? = null
)

@Service
class IssueTagService(
    private val labelService: LabelService
) {
    fun findAll(organizationId: Long?, teamId: Long?): List<LabelDto> {
        val catalog = labelService.findCatalog(organizationId, teamId)
        return catalog.teamLabels + catalog.workspaceLabels
    }

    fun findById(id: Long): LabelDto = labelService.findById(id)

    fun create(request: CreateIssueTagRequest): LabelDto = labelService.create(
        CreateLabelRequest(
            organizationId = request.organizationId,
            scopeType = request.scopeType ?: if (request.teamId != null) "TEAM" else "WORKSPACE",
            scopeId = request.teamId,
            name = request.name,
            color = request.color,
            sortOrder = request.sortOrder
        )
    )

    fun update(id: Long, request: UpdateIssueTagRequest): LabelDto = labelService.update(
        id,
        UpdateLabelRequest(
            name = request.name,
            color = request.color,
            sortOrder = request.sortOrder,
            archived = request.archived
        )
    )

    fun delete(id: Long) {
        labelService.delete(id)
    }
}
