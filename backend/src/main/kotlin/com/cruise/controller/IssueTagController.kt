package com.cruise.controller

import com.cruise.service.CreateIssueTagRequest
import com.cruise.service.IssueTagService
import com.cruise.service.LabelDto
import com.cruise.service.UpdateIssueTagRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
class IssueTagController(
    private val service: IssueTagService
) {
    @GetMapping("/api/issue-tags", "/api/requirement-tags")
    fun getAll(
        @RequestParam(required = false) organizationId: Long?,
        @RequestParam(required = false) teamId: Long?
    ): List<LabelDto> = service.findAll(organizationId, teamId)

    @GetMapping("/api/issue-tags/{id}", "/api/requirement-tags/{id}")
    fun getById(@PathVariable id: Long): LabelDto = service.findById(id)

    @PostMapping("/api/issue-tags", "/api/requirement-tags")
    fun create(@RequestBody request: CreateIssueTagRequest): ResponseEntity<LabelDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(service.create(request))

    @PutMapping("/api/issue-tags/{id}", "/api/requirement-tags/{id}")
    fun update(@PathVariable id: Long, @RequestBody request: UpdateIssueTagRequest): LabelDto =
        service.update(id, request)

    @DeleteMapping("/api/issue-tags/{id}", "/api/requirement-tags/{id}")
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        service.delete(id)
        return ResponseEntity.noContent().build()
    }
}
