package com.cruise.controller

import com.cruise.service.CreateInitiativeRequest
import com.cruise.service.InitiativeDto
import com.cruise.service.InitiativeQuery
import com.cruise.service.InitiativeService
import com.cruise.service.RestPageResponse
import com.cruise.service.UpdateInitiativeRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/initiatives")
class InitiativeController(
    private val initiativeService: InitiativeService
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
}

