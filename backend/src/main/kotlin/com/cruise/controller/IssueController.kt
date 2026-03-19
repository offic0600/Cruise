package com.cruise.controller

import com.cruise.service.CreateIssueRequest
import com.cruise.service.IssueDto
import com.cruise.service.IssueQuery
import com.cruise.service.IssueService
import com.cruise.service.RestPageResponse
import com.cruise.service.UpdateIssueRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/issues")
class IssueController(
    private val issueService: IssueService
) {
    @GetMapping
    fun getAll(
        @RequestParam(required = false) type: String?,
        @RequestParam(required = false) organizationId: Long?,
        @RequestParam(required = false) teamId: Long?,
        @RequestParam(required = false) projectId: Long?,
        @RequestParam(required = false) assigneeId: Long?,
        @RequestParam(required = false) parentIssueId: Long?,
        @RequestParam(required = false) state: String?,
        @RequestParam(required = false) priority: String?,
        @RequestParam(required = false) q: String?,
        @RequestParam(required = false) customFieldFilters: String?,
        @RequestParam(required = false, defaultValue = "false") includeArchived: Boolean,
        @RequestParam(required = false, defaultValue = "0") page: Int,
        @RequestParam(required = false, defaultValue = "50") size: Int
    ): RestPageResponse<IssueDto> = issueService.findAll(
        IssueQuery(
            type = type,
            organizationId = organizationId,
            teamId = teamId,
            projectId = projectId,
            assigneeId = assigneeId,
            parentIssueId = parentIssueId,
            state = state,
            priority = priority,
            q = q,
            customFieldFilters = issueService.parseCustomFieldFilters(customFieldFilters),
            includeArchived = includeArchived,
            page = page,
            size = size
        )
    )

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long): IssueDto = issueService.findById(id)

    @PostMapping
    fun create(@RequestBody request: CreateIssueRequest): ResponseEntity<IssueDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(issueService.create(request))

    @PutMapping("/{id}")
    fun update(@PathVariable id: Long, @RequestBody request: UpdateIssueRequest): IssueDto =
        issueService.update(id, request)

    @PatchMapping("/{id}/state")
    fun updateState(@PathVariable id: Long, @RequestBody request: Map<String, String>): IssueDto =
        issueService.updateState(
            id,
            request["state"] ?: throw IllegalArgumentException("State is required"),
            request["resolution"]
        )

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        issueService.delete(id)
        return ResponseEntity.noContent().build()
    }
}
