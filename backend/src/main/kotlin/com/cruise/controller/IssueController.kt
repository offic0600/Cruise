package com.cruise.controller

import com.cruise.service.CreateIssueRequest
import com.cruise.service.IssueDto
import com.cruise.service.IssueQuery
import com.cruise.service.IssueService
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
        @RequestParam(required = false) epicId: Long?,
        @RequestParam(required = false) sprintId: Long?,
        @RequestParam(required = false) projectId: Long?,
        @RequestParam(required = false) assigneeId: Long?,
        @RequestParam(required = false) parentIssueId: Long?,
        @RequestParam(required = false) state: String?,
        @RequestParam(required = false) q: String?
    ): List<IssueDto> = issueService.findAll(
        IssueQuery(
            type = type,
            organizationId = organizationId,
            epicId = epicId,
            sprintId = sprintId,
            projectId = projectId,
            assigneeId = assigneeId,
            parentIssueId = parentIssueId,
            state = state,
            q = q
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
        issueService.updateState(id, request["state"] ?: throw IllegalArgumentException("State is required"))

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        issueService.delete(id)
        return ResponseEntity.noContent().build()
    }
}
