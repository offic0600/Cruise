package com.cruise.service

import com.cruise.entity.IssueTag
import com.cruise.repository.IssueTagRepository
import org.springframework.stereotype.Service

data class CreateIssueTagRequest(
    val name: String,
    val color: String = "#3B82F6",
    val sortOrder: Int = 0
)

data class UpdateIssueTagRequest(
    val name: String?,
    val color: String?,
    val sortOrder: Int?
)

@Service
class IssueTagService(
    private val repository: IssueTagRepository
) {
    fun findAll(): List<IssueTag> = repository.findByOrderBySortOrderAsc()

    fun findById(id: Long): IssueTag = repository.findById(id)
        .orElseThrow { RuntimeException("Tag not found: $id") }

    fun create(request: CreateIssueTagRequest): IssueTag =
        repository.save(
            IssueTag(
                name = request.name,
                color = request.color,
                sortOrder = request.sortOrder
            )
        )

    fun update(id: Long, request: UpdateIssueTagRequest): IssueTag {
        val tag = findById(id)
        return repository.save(
            IssueTag(
                id = tag.id,
                name = request.name ?: tag.name,
                color = request.color ?: tag.color,
                sortOrder = request.sortOrder ?: tag.sortOrder,
                createdAt = tag.createdAt
            )
        )
    }

    fun delete(id: Long) {
        repository.deleteById(id)
    }
}
