package com.cruise.service

import com.cruise.entity.RequirementTag
import com.cruise.repository.RequirementTagRepository
import org.springframework.stereotype.Service

data class CreateRequirementTagRequest(
    val name: String,
    val color: String = "#3B82F6",
    val sortOrder: Int = 0
)

data class UpdateRequirementTagRequest(
    val name: String?,
    val color: String?,
    val sortOrder: Int?
)

@Service
class RequirementTagService(
    private val repository: RequirementTagRepository
) {
    fun findAll(): List<RequirementTag> = repository.findAll()

    fun findById(id: Long): RequirementTag = repository.findById(id)
        .orElseThrow { RuntimeException("Tag not found: $id") }

    fun create(request: CreateRequirementTagRequest): RequirementTag {
        return repository.save(
            RequirementTag(
                name = request.name,
                color = request.color,
                sortOrder = request.sortOrder
            )
        )
    }

    fun update(id: Long, request: UpdateRequirementTagRequest): RequirementTag {
        val tag = findById(id)
        return repository.save(
            RequirementTag(
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
