package com.cruise.service

import com.cruise.entity.View
import com.cruise.repository.ViewRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDateTime

data class ViewDto(
    val id: Long,
    val organizationId: Long,
    val teamId: Long?,
    val projectId: Long?,
    val name: String,
    val description: String?,
    val filterJson: String?,
    val groupBy: String?,
    val sortJson: String?,
    val visibility: String,
    val isSystem: Boolean,
    val createdAt: String,
    val updatedAt: String
)

data class ViewQuery(
    val organizationId: Long? = null,
    val teamId: Long? = null,
    val projectId: Long? = null,
    val visibility: String? = null,
    val q: String? = null
)

data class CreateViewRequest(
    val organizationId: Long,
    val teamId: Long? = null,
    val projectId: Long? = null,
    val name: String,
    val description: String? = null,
    val filterJson: String? = null,
    val groupBy: String? = null,
    val sortJson: String? = null,
    val visibility: String? = null,
    val isSystem: Boolean? = null
)

data class UpdateViewRequest(
    val teamId: Long? = null,
    val projectId: Long? = null,
    val name: String? = null,
    val description: String? = null,
    val filterJson: String? = null,
    val groupBy: String? = null,
    val sortJson: String? = null,
    val visibility: String? = null
)

@Service
@Transactional
class ViewService(
    private val viewRepository: ViewRepository
) {
    fun findAll(query: ViewQuery = ViewQuery()): List<ViewDto> =
        viewRepository.findAll()
            .asSequence()
            .filter { query.organizationId == null || it.organizationId == query.organizationId }
            .filter { query.teamId == null || it.teamId == query.teamId }
            .filter { query.projectId == null || it.projectId == query.projectId }
            .filter { query.visibility == null || it.visibility == query.visibility }
            .filter {
                query.q.isNullOrBlank() || listOfNotNull(it.name, it.description)
                    .any { text -> text.contains(query.q, ignoreCase = true) }
            }
            .sortedBy { it.name.lowercase() }
            .map { it.toDto() }
            .toList()

    fun findById(id: Long): ViewDto = getView(id).toDto()

    fun create(request: CreateViewRequest): ViewDto =
        viewRepository.save(
            View(
                organizationId = request.organizationId,
                teamId = request.teamId,
                projectId = request.projectId,
                name = request.name,
                description = request.description,
                filterJson = request.filterJson,
                groupBy = request.groupBy,
                sortJson = request.sortJson,
                visibility = request.visibility ?: "WORKSPACE",
                isSystem = request.isSystem ?: false
            )
        ).toDto()

    fun update(id: Long, request: UpdateViewRequest): ViewDto {
        val view = getView(id)
        return viewRepository.save(
            View(
                id = view.id,
                organizationId = view.organizationId,
                teamId = request.teamId ?: view.teamId,
                projectId = request.projectId ?: view.projectId,
                name = request.name ?: view.name,
                description = request.description ?: view.description,
                filterJson = request.filterJson ?: view.filterJson,
                groupBy = request.groupBy ?: view.groupBy,
                sortJson = request.sortJson ?: view.sortJson,
                visibility = request.visibility ?: view.visibility,
                isSystem = view.isSystem,
                createdAt = view.createdAt,
                updatedAt = LocalDateTime.now()
            )
        ).toDto()
    }

    fun delete(id: Long) {
        val view = getView(id)
        viewRepository.delete(view)
    }

    private fun getView(id: Long): View =
        viewRepository.findById(id).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "View not found")
        }

    private fun View.toDto() = ViewDto(
        id = id,
        organizationId = organizationId,
        teamId = teamId,
        projectId = projectId,
        name = name,
        description = description,
        filterJson = filterJson,
        groupBy = groupBy,
        sortJson = sortJson,
        visibility = visibility,
        isSystem = isSystem,
        createdAt = createdAt.toString(),
        updatedAt = updatedAt.toString()
    )
}
