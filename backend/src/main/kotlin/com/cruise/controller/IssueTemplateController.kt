package com.cruise.controller

import com.cruise.service.CreateIssueTemplateRequest
import com.cruise.service.IssueTemplateDto
import com.cruise.service.IssueTemplateQuery
import com.cruise.service.IssueTemplateService
import com.cruise.service.UpdateIssueTemplateRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/issue-templates")
class IssueTemplateController(
    private val issueTemplateService: IssueTemplateService
) {
    @GetMapping
    fun getAll(
        @RequestParam(required = false) organizationId: Long?,
        @RequestParam(required = false) teamId: Long?,
        @RequestParam(required = false) q: String?
    ): List<IssueTemplateDto> = issueTemplateService.findAll(IssueTemplateQuery(organizationId, teamId, q))

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long): IssueTemplateDto = issueTemplateService.findById(id)

    @PostMapping
    fun create(@RequestBody request: CreateIssueTemplateRequest): ResponseEntity<IssueTemplateDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(issueTemplateService.create(request))

    @PutMapping("/{id}")
    fun update(@PathVariable id: Long, @RequestBody request: UpdateIssueTemplateRequest): IssueTemplateDto =
        issueTemplateService.update(id, request)

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        issueTemplateService.delete(id)
        return ResponseEntity.noContent().build()
    }
}
