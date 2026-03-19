package com.cruise.controller

import com.cruise.service.CreateProjectRequest
import com.cruise.service.CreateProjectMilestoneRequest
import com.cruise.service.CreateProjectUpdateRequest
import com.cruise.service.CreateCommentRequest
import com.cruise.service.CommentDto
import com.cruise.service.CommentQuery
import com.cruise.service.CommentService
import com.cruise.service.ProjectDto
import com.cruise.service.ProjectMilestoneDto
import com.cruise.service.ProjectMilestoneService
import com.cruise.service.ProjectQuery
import com.cruise.service.ProjectService
import com.cruise.service.ProjectUpdateDto
import com.cruise.service.ProjectUpdateService
import com.cruise.service.RestPageResponse
import com.cruise.service.UpdateProjectRequest
import com.cruise.service.UpdateProjectMilestoneRequest
import com.cruise.service.UpdateProjectUpdateRequest
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
@RequestMapping("/api/projects")
class ProjectController(
    private val projectService: ProjectService,
    private val projectMilestoneService: ProjectMilestoneService,
    private val projectUpdateService: ProjectUpdateService,
    private val commentService: CommentService
) {
    @GetMapping
    fun getAll(
        @RequestParam(required = false) organizationId: Long?,
        @RequestParam(required = false) teamId: Long?,
        @RequestParam(required = false) status: String?,
        @RequestParam(required = false) q: String?,
        @RequestParam(required = false, defaultValue = "false") includeArchived: Boolean,
        @RequestParam(required = false, defaultValue = "0") page: Int,
        @RequestParam(required = false, defaultValue = "50") size: Int
    ): RestPageResponse<ProjectDto> = projectService.findAll(
        ProjectQuery(
            organizationId = organizationId,
            teamId = teamId,
            status = status,
            q = q,
            includeArchived = includeArchived,
            page = page,
            size = size
        )
    )

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long): ProjectDto = projectService.findById(id)

    @PostMapping
    fun create(@RequestBody request: CreateProjectRequest): ResponseEntity<ProjectDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(projectService.create(request))

    @PutMapping("/{id}")
    fun update(@PathVariable id: Long, @RequestBody request: UpdateProjectRequest): ProjectDto =
        projectService.update(id, request)

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        projectService.delete(id)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/{id}/milestones")
    fun getMilestones(
        @PathVariable id: Long,
        @RequestParam(required = false, defaultValue = "false") includeArchived: Boolean
    ): List<ProjectMilestoneDto> = projectMilestoneService.findByProject(id, includeArchived)

    @GetMapping("/{id}/milestones/{milestoneId}")
    fun getMilestone(@PathVariable id: Long, @PathVariable milestoneId: Long): ProjectMilestoneDto =
        projectMilestoneService.findById(id, milestoneId)

    @PostMapping("/{id}/milestones")
    fun createMilestone(
        @PathVariable id: Long,
        @RequestBody request: CreateProjectMilestoneRequest
    ): ResponseEntity<ProjectMilestoneDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(projectMilestoneService.create(id, request))

    @PutMapping("/{id}/milestones/{milestoneId}")
    fun updateMilestone(
        @PathVariable id: Long,
        @PathVariable milestoneId: Long,
        @RequestBody request: UpdateProjectMilestoneRequest
    ): ProjectMilestoneDto = projectMilestoneService.update(id, milestoneId, request)

    @DeleteMapping("/{id}/milestones/{milestoneId}")
    fun deleteMilestone(@PathVariable id: Long, @PathVariable milestoneId: Long): ResponseEntity<Void> {
        projectMilestoneService.delete(id, milestoneId)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/{id}/updates")
    fun getUpdates(
        @PathVariable id: Long,
        @RequestParam(required = false, defaultValue = "false") includeArchived: Boolean
    ): List<ProjectUpdateDto> = projectUpdateService.findByProject(id, includeArchived)

    @GetMapping("/{id}/updates/{updateId}")
    fun getUpdate(@PathVariable id: Long, @PathVariable updateId: Long): ProjectUpdateDto =
        projectUpdateService.findById(id, updateId)

    @PostMapping("/{id}/updates")
    fun createUpdate(
        @PathVariable id: Long,
        @RequestBody request: CreateProjectUpdateRequest
    ): ResponseEntity<ProjectUpdateDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(projectUpdateService.create(id, request))

    @PutMapping("/{id}/updates/{updateId}")
    fun updateUpdate(
        @PathVariable id: Long,
        @PathVariable updateId: Long,
        @RequestBody request: UpdateProjectUpdateRequest
    ): ProjectUpdateDto = projectUpdateService.update(id, updateId, request)

    @DeleteMapping("/{id}/updates/{updateId}")
    fun deleteUpdate(@PathVariable id: Long, @PathVariable updateId: Long): ResponseEntity<Void> {
        projectUpdateService.delete(id, updateId)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/{id}/updates/{updateId}/comments")
    fun getUpdateComments(
        @PathVariable id: Long,
        @PathVariable updateId: Long,
        @RequestParam(required = false, defaultValue = "false") includeArchived: Boolean
    ): List<CommentDto> {
        projectUpdateService.findById(id, updateId)
        return commentService.findAll(
            CommentQuery(
                targetType = "PROJECT_UPDATE",
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
        projectUpdateService.findById(id, updateId)
        return ResponseEntity.status(HttpStatus.CREATED).body(
            commentService.create(
                CreateCommentRequest(
                    targetType = "PROJECT_UPDATE",
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
        @RequestBody request: com.cruise.service.UpdateCommentRequest
    ): CommentDto {
        projectUpdateService.findById(id, updateId)
        val comment = commentService.findById(commentId)
        if (comment.targetType != "PROJECT_UPDATE" || comment.targetId != updateId) {
            throw org.springframework.web.server.ResponseStatusException(HttpStatus.NOT_FOUND, "Project update comment not found")
        }
        return commentService.update(commentId, request)
    }

    @DeleteMapping("/{id}/updates/{updateId}/comments/{commentId}")
    fun deleteUpdateComment(
        @PathVariable id: Long,
        @PathVariable updateId: Long,
        @PathVariable commentId: Long
    ): ResponseEntity<Void> {
        projectUpdateService.findById(id, updateId)
        val comment = commentService.findById(commentId)
        if (comment.targetType != "PROJECT_UPDATE" || comment.targetId != updateId) {
            throw org.springframework.web.server.ResponseStatusException(HttpStatus.NOT_FOUND, "Project update comment not found")
        }
        commentService.delete(commentId)
        return ResponseEntity.noContent().build()
    }
}
