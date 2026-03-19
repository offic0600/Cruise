package com.cruise.controller

import com.cruise.service.CommentDto
import com.cruise.service.CommentQuery
import com.cruise.service.CommentService
import com.cruise.service.CreateCommentRequest
import com.cruise.service.UpdateCommentRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/comments")
class CommentController(
    private val commentService: CommentService
) {
    @GetMapping
    fun getAll(
        @RequestParam(required = false) targetType: String?,
        @RequestParam(required = false) targetId: Long?,
        @RequestParam(required = false) documentContentId: Long?,
        @RequestParam(required = false) authorId: Long?,
        @RequestParam(required = false, defaultValue = "false") includeArchived: Boolean
    ): List<CommentDto> = commentService.findAll(
        CommentQuery(
            targetType = targetType,
            targetId = targetId,
            documentContentId = documentContentId,
            authorId = authorId,
            includeArchived = includeArchived
        )
    )

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long): CommentDto = commentService.findById(id)

    @PostMapping
    fun create(@RequestBody request: CreateCommentRequest): ResponseEntity<CommentDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(commentService.create(request))

    @PutMapping("/{id}")
    fun update(@PathVariable id: Long, @RequestBody request: UpdateCommentRequest): CommentDto =
        commentService.update(id, request)

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        commentService.delete(id)
        return ResponseEntity.noContent().build()
    }
}
