package com.cruise.controller

import com.cruise.service.CreateDocRequest
import com.cruise.service.DocDto
import com.cruise.service.DocQuery
import com.cruise.service.DocService
import com.cruise.service.UpdateDocRequest
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
@RequestMapping("/api/docs")
class DocController(
    private val docService: DocService
) {
    @GetMapping
    fun getAll(
        @RequestParam(required = false) organizationId: Long?,
        @RequestParam(required = false) teamId: Long?,
        @RequestParam(required = false) projectId: Long?,
        @RequestParam(required = false) issueId: Long?,
        @RequestParam(required = false) initiativeId: Long?,
        @RequestParam(required = false) status: String?,
        @RequestParam(required = false) q: String?,
        @RequestParam(required = false, defaultValue = "false") includeArchived: Boolean
    ): List<DocDto> = docService.findAll(
        DocQuery(
            organizationId = organizationId,
            teamId = teamId,
            projectId = projectId,
            issueId = issueId,
            initiativeId = initiativeId,
            status = status,
            q = q,
            includeArchived = includeArchived
        )
    )

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long): DocDto = docService.findById(id)

    @PostMapping
    fun create(@RequestBody request: CreateDocRequest): ResponseEntity<DocDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(docService.create(request))

    @PutMapping("/{id}")
    fun update(@PathVariable id: Long, @RequestBody request: UpdateDocRequest): DocDto =
        docService.update(id, request)

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        docService.delete(id)
        return ResponseEntity.noContent().build()
    }
}
