package com.cruise.controller

import com.cruise.service.CreateInitiativeRequest
import com.cruise.service.CreateInitiativeUpdateRequest
import com.cruise.service.CreateCommentRequest
import com.cruise.service.AttachInitiativeProjectRequest
import com.cruise.service.CommentDto
import com.cruise.service.CommentService
import com.cruise.service.InitiativeDto
import com.cruise.service.InitiativeProjectDto
import com.cruise.service.InitiativeQuery
import com.cruise.service.InitiativeService
import com.cruise.service.InitiativeUpdateDto
import com.cruise.service.InitiativeUpdateService
import com.cruise.service.RestPageResponse
import com.cruise.service.UpdateInitiativeRequest
import com.cruise.service.UpdateInitiativeUpdateRequest
import com.cruise.service.UpdateCommentRequest
import com.cruise.service.UpdateInitiativeProjectRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/initiatives")
class InitiativeController(
    private val initiativeService: InitiativeService,
    private val initiativeUpdateService: InitiativeUpdateService,
    private val commentService: CommentService
) {
    @GetMapping
    fun getAll(
        @RequestParam(required = false) organizationId: Long?,
        @RequestParam(required = false) parentInitiativeId: Long?,
        @RequestParam(required = false) status: String?,
        @RequestParam(required = false) q: String?,
        @RequestParam(required = false, defaultValue = "false") includeArchived: Boolean,
        @RequestParam(required = false, defaultValue = "0") page: Int,
        @RequestParam(required = false, defaultValue = "50") size: Int
    ): RestPageResponse<InitiativeDto> = initiativeService.findAll(
        InitiativeQuery(
            organizationId = organizationId,
            parentInitiativeId = parentInitiativeId,
            status = status,
            q = q,
            includeArchived = includeArchived,
            page = page,
            size = size
        )
    )

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long): InitiativeDto = initiativeService.findById(id)

    @PostMapping
    fun create(@RequestBody request: CreateInitiativeRequest): ResponseEntity<InitiativeDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(initiativeService.create(request))

    @PutMapping("/{id}")
    fun update(@PathVariable id: Long, @RequestBody request: UpdateInitiativeRequest): InitiativeDto =
        initiativeService.update(id, request)

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        initiativeService.delete(id)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/{id}/projects")
    fun getProjects(
        @PathVariable id: Long,
        @RequestParam(required = false, defaultValue = "false") includeArchived: Boolean
    ): List<InitiativeProjectDto> = initiativeService.findProjects(id, includeArchived)

    @PostMapping("/{id}/projects")
    fun attachProject(
        @PathVariable id: Long,
        @RequestBody request: AttachInitiativeProjectRequest
    ): ResponseEntity<InitiativeProjectDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(initiativeService.attachProject(id, request))

    @PutMapping("/{id}/projects/{relationId}")
    fun updateProject(
        @PathVariable id: Long,
        @PathVariable relationId: Long,
        @RequestBody request: UpdateInitiativeProjectRequest
    ): InitiativeProjectDto = initiativeService.updateProject(id, relationId, request)

    @DeleteMapping("/{id}/projects/{relationId}")
    fun detachProject(@PathVariable id: Long, @PathVariable relationId: Long): ResponseEntity<Void> {
        initiativeService.detachProject(id, relationId)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/{id}/updates")
    fun getUpdates(
        @PathVariable id: Long,
        @RequestParam(required = false, defaultValue = "false") includeArchived: Boolean
    ): List<InitiativeUpdateDto> = initiativeUpdateService.findByInitiative(id, includeArchived)

    @GetMapping("/{id}/updates/{updateId}")
    fun getUpdate(@PathVariable id: Long, @PathVariable updateId: Long): InitiativeUpdateDto =
        initiativeUpdateService.findById(id, updateId)

    @PostMapping("/{id}/updates")
    fun createUpdate(
        @PathVariable id: Long,
        @RequestBody request: CreateInitiativeUpdateRequest
    ): ResponseEntity<InitiativeUpdateDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(initiativeUpdateService.create(id, request))

    @PutMapping("/{id}/updates/{updateId}")
    fun updateUpdate(
        @PathVariable id: Long,
        @PathVariable updateId: Long,
        @RequestBody request: UpdateInitiativeUpdateRequest
    ): InitiativeUpdateDto = initiativeUpdateService.update(id, updateId, request)

    @DeleteMapping("/{id}/updates/{updateId}")
    fun deleteUpdate(@PathVariable id: Long, @PathVariable updateId: Long): ResponseEntity<Void> {
        initiativeUpdateService.delete(id, updateId)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/{id}/updates/{updateId}/comments")
    fun getUpdateComments(
        @PathVariable id: Long,
        @PathVariable updateId: Long,
        @RequestParam(required = false, defaultValue = "false") includeArchived: Boolean
    ): List<CommentDto> {
        initiativeUpdateService.findById(id, updateId)
        return commentService.findAll(
            com.cruise.service.CommentQuery(
                targetType = "INITIATIVE_UPDATE",
                targetId = updateId,
                includeArchived = includeArchived
            )
        )
    }

    @PostMapping("/{id}/updates/{updateId}/comments")
    fun createUpdateComment(
        @PathVariable id: Long,
        @PathVariable updateId: Long,
        @RequestBody request: CreateCommentRequest
    ): ResponseEntity<CommentDto> {
        initiativeUpdateService.findById(id, updateId)
        return ResponseEntity.status(HttpStatus.CREATED).body(
            commentService.create(
                CreateCommentRequest(
                    targetType = "INITIATIVE_UPDATE",
                    targetId = updateId,
                    documentContentId = request.documentContentId,
                    parentCommentId = request.parentCommentId,
                    authorId = request.authorId,
                    body = request.body
                )
            )
        )
    }

    @PutMapping("/{id}/updates/{updateId}/comments/{commentId}")
    fun updateUpdateComment(
        @PathVariable id: Long,
        @PathVariable updateId: Long,
        @PathVariable commentId: Long,
        @RequestBody request: UpdateCommentRequest
    ): CommentDto {
        initiativeUpdateService.findById(id, updateId)
        val comment = commentService.findById(commentId)
        if (comment.targetType != "INITIATIVE_UPDATE" || comment.targetId != updateId) {
            throw org.springframework.web.server.ResponseStatusException(HttpStatus.NOT_FOUND, "Initiative update comment not found")
        }
        return commentService.update(commentId, request)
    }

    @DeleteMapping("/{id}/updates/{updateId}/comments/{commentId}")
    fun deleteUpdateComment(
        @PathVariable id: Long,
        @PathVariable updateId: Long,
        @PathVariable commentId: Long
    ): ResponseEntity<Void> {
        initiativeUpdateService.findById(id, updateId)
        val comment = commentService.findById(commentId)
        if (comment.targetType != "INITIATIVE_UPDATE" || comment.targetId != updateId) {
            throw org.springframework.web.server.ResponseStatusException(HttpStatus.NOT_FOUND, "Initiative update comment not found")
        }
        commentService.delete(commentId)
        return ResponseEntity.noContent().build()
    }
}
