package com.cruise.controller

import com.cruise.service.CreateIssueRelationRequest
import com.cruise.service.IssueRelationDto
import com.cruise.service.IssueRelationService
import com.cruise.service.UpdateIssueRelationRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/issues/{issueId}/relations")
class IssueRelationController(
    private val issueRelationService: IssueRelationService
) {
    @GetMapping
    fun getAll(@PathVariable issueId: Long): List<IssueRelationDto> =
        issueRelationService.findForIssue(issueId)

    @PostMapping
    fun create(
        @PathVariable issueId: Long,
        @RequestBody request: CreateIssueRelationRequest
    ): ResponseEntity<IssueRelationDto> {
        val payload = if (request.fromIssueId == 0L) {
            request.copy(fromIssueId = issueId)
        } else {
            request
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(issueRelationService.create(payload))
    }

    @PutMapping("/{relationId}")
    fun update(
        @PathVariable issueId: Long,
        @PathVariable relationId: Long,
        @RequestBody request: UpdateIssueRelationRequest
    ): IssueRelationDto = issueRelationService.update(issueId, relationId, request)

    @DeleteMapping("/{relationId}")
    fun delete(
        @PathVariable issueId: Long,
        @PathVariable relationId: Long
    ): ResponseEntity<Void> {
        issueRelationService.delete(issueId, relationId)
        return ResponseEntity.noContent().build()
    }
}
