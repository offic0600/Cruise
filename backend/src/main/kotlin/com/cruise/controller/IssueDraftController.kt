package com.cruise.controller

import com.cruise.service.IssueDraftDto
import com.cruise.service.IssueDraftQuery
import com.cruise.service.IssueDraftService
import com.cruise.service.SaveIssueDraftRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/issue-drafts")
class IssueDraftController(
    private val issueDraftService: IssueDraftService
) {
    @GetMapping
    fun getAll(
        @RequestParam(required = false) organizationId: Long?,
        @RequestParam(required = false) teamId: Long?,
        @RequestParam(required = false) status: String?
    ): List<IssueDraftDto> = issueDraftService.findAll(IssueDraftQuery(organizationId, teamId, status))

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long): IssueDraftDto = issueDraftService.findById(id)

    @PostMapping
    fun create(@RequestBody request: SaveIssueDraftRequest): ResponseEntity<IssueDraftDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(issueDraftService.create(request))

    @PutMapping("/{id}")
    fun update(@PathVariable id: Long, @RequestBody request: SaveIssueDraftRequest): IssueDraftDto =
        issueDraftService.update(id, request)

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        issueDraftService.delete(id)
        return ResponseEntity.noContent().build()
    }
}
