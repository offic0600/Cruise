package com.cruise.service

import com.cruise.entity.Comment
import com.cruise.repository.CommentRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDateTime

data class CommentDto(
    val id: Long,
    val targetType: String,
    val targetId: Long,
    val documentContentId: Long?,
    val parentCommentId: Long?,
    val authorId: Long,
    val body: String,
    val createdAt: String,
    val updatedAt: String,
    val archivedAt: String?
)

data class CommentQuery(
    val targetType: String? = null,
    val targetId: Long? = null,
    val documentContentId: Long? = null,
    val authorId: Long? = null,
    val includeArchived: Boolean = false
)

data class CreateCommentRequest(
    val targetType: String,
    val targetId: Long,
    val documentContentId: Long? = null,
    val parentCommentId: Long? = null,
    val authorId: Long,
    val body: String
)

data class UpdateCommentRequest(
    val body: String,
    val archivedAt: String? = null
)

@Service
class CommentService(
    private val commentRepository: CommentRepository
) {
    fun findAll(query: CommentQuery = CommentQuery()): List<CommentDto> =
        commentRepository.findAll()
            .asSequence()
            .filter { query.targetType == null || it.targetType == query.targetType }
            .filter { query.targetId == null || it.targetId == query.targetId }
            .filter { query.documentContentId == null || it.documentContentId == query.documentContentId }
            .filter { query.authorId == null || it.authorId == query.authorId }
            .filter { query.includeArchived || it.archivedAt == null }
            .sortedBy { it.id }
            .map { it.toDto() }
            .toList()

    fun findById(id: Long): CommentDto = getComment(id).toDto()

    fun create(request: CreateCommentRequest): CommentDto =
        commentRepository.save(
            Comment(
                targetType = request.targetType,
                targetId = request.targetId,
                documentContentId = request.documentContentId,
                parentCommentId = request.parentCommentId,
                authorId = request.authorId,
                body = request.body
            )
        ).toDto()

    fun update(id: Long, request: UpdateCommentRequest): CommentDto {
        val comment = getComment(id)
        return commentRepository.save(
            Comment(
                id = comment.id,
                targetType = comment.targetType,
                targetId = comment.targetId,
                documentContentId = comment.documentContentId,
                parentCommentId = comment.parentCommentId,
                authorId = comment.authorId,
                body = request.body,
                createdAt = comment.createdAt,
                updatedAt = LocalDateTime.now(),
                archivedAt = parseDateTime(request.archivedAt) ?: comment.archivedAt
            )
        ).toDto()
    }

    fun delete(id: Long) {
        commentRepository.delete(getComment(id))
    }

    private fun getComment(id: Long): Comment = commentRepository.findById(id)
        .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found") }

    private fun Comment.toDto(): CommentDto = CommentDto(
        id = id,
        targetType = targetType,
        targetId = targetId,
        documentContentId = documentContentId,
        parentCommentId = parentCommentId,
        authorId = authorId,
        body = body,
        createdAt = createdAt.toString(),
        updatedAt = updatedAt.toString(),
        archivedAt = archivedAt?.toString()
    )

    private fun parseDateTime(value: String?): LocalDateTime? =
        value?.takeIf(String::isNotBlank)?.let(LocalDateTime::parse)
}
