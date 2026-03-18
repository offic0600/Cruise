package com.cruise.service

import com.cruise.entity.Comment
import com.cruise.repository.CommentRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDateTime

data class CommentDto(
    val id: Long,
    val issueId: Long?,
    val docId: Long?,
    val parentCommentId: Long?,
    val authorId: Long,
    val body: String,
    val createdAt: String,
    val updatedAt: String
)

data class CommentQuery(
    val issueId: Long? = null,
    val docId: Long? = null,
    val authorId: Long? = null
)

data class CreateCommentRequest(
    val issueId: Long? = null,
    val docId: Long? = null,
    val parentCommentId: Long? = null,
    val authorId: Long,
    val body: String
)

data class UpdateCommentRequest(
    val body: String
)

@Service
class CommentService(
    private val commentRepository: CommentRepository
) {
    fun findAll(query: CommentQuery = CommentQuery()): List<CommentDto> =
        commentRepository.findAll()
            .asSequence()
            .filter { query.issueId == null || it.issueId == query.issueId }
            .filter { query.docId == null || it.docId == query.docId }
            .filter { query.authorId == null || it.authorId == query.authorId }
            .sortedBy { it.id }
            .map { it.toDto() }
            .toList()

    fun findById(id: Long): CommentDto = getComment(id).toDto()

    fun create(request: CreateCommentRequest): CommentDto {
        validateAttachment(request.issueId, request.docId)
        return commentRepository.save(
            Comment(
                issueId = request.issueId,
                docId = request.docId,
                parentCommentId = request.parentCommentId,
                authorId = request.authorId,
                body = request.body
            )
        ).toDto()
    }

    fun update(id: Long, request: UpdateCommentRequest): CommentDto {
        val comment = getComment(id)
        return commentRepository.save(
            Comment(
                id = comment.id,
                issueId = comment.issueId,
                docId = comment.docId,
                parentCommentId = comment.parentCommentId,
                authorId = comment.authorId,
                body = request.body,
                createdAt = comment.createdAt,
                updatedAt = LocalDateTime.now()
            )
        ).toDto()
    }

    fun delete(id: Long) {
        commentRepository.delete(getComment(id))
    }

    private fun getComment(id: Long): Comment = commentRepository.findById(id)
        .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found") }

    private fun validateAttachment(issueId: Long?, docId: Long?) {
        if (listOf(issueId, docId).count { it != null } != 1) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment must target exactly one resource")
        }
    }

    private fun Comment.toDto(): CommentDto = CommentDto(
        id = id,
        issueId = issueId,
        docId = docId,
        parentCommentId = parentCommentId,
        authorId = authorId,
        body = body,
        createdAt = createdAt.toString(),
        updatedAt = updatedAt.toString()
    )
}
