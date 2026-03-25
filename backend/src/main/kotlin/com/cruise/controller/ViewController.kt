package com.cruise.controller

import com.cruise.service.CreateViewRequest
import com.cruise.service.UpdateViewRequest
import com.cruise.service.ViewDto
import com.cruise.service.ViewQuery
import com.cruise.service.ViewResultsRequest
import com.cruise.service.ViewResultsResponse
import com.cruise.service.ViewService
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
@RequestMapping("/api/views")
class ViewController(
    private val viewService: ViewService
) {
    @GetMapping
    fun getAll(
        @RequestParam(required = false) organizationId: Long?,
        @RequestParam(required = false) resourceType: String?,
        @RequestParam(required = false) scopeType: String?,
        @RequestParam(required = false) scopeId: Long?,
        @RequestParam(required = false, defaultValue = "true") includeSystem: Boolean,
        @RequestParam(required = false, defaultValue = "true") includeFavorites: Boolean,
        @RequestParam(required = false) q: String?
    ): List<ViewDto> = viewService.findAll(
        ViewQuery(
            organizationId = organizationId,
            resourceType = resourceType,
            scopeType = scopeType,
            scopeId = scopeId,
            includeSystem = includeSystem,
            includeFavorites = includeFavorites,
            q = q
        )
    )

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long): ViewDto = viewService.findById(id)

    @PostMapping
    fun create(@RequestBody request: CreateViewRequest): ResponseEntity<ViewDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(viewService.create(request))

    @PutMapping("/{id}")
    fun update(@PathVariable id: Long, @RequestBody request: UpdateViewRequest): ViewDto =
        viewService.update(id, request)

    @PostMapping("/{id}/duplicate")
    fun duplicate(@PathVariable id: Long): ResponseEntity<ViewDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(viewService.duplicate(id))

    @PostMapping("/{id}/favorite")
    fun favorite(@PathVariable id: Long): ViewDto = viewService.favorite(id)

    @DeleteMapping("/{id}/favorite")
    fun unfavorite(@PathVariable id: Long): ViewDto = viewService.unfavorite(id)

    @PostMapping("/{id}/results")
    fun results(@PathVariable id: Long, @RequestBody(required = false) request: ViewResultsRequest?): ViewResultsResponse =
        viewService.findResults(id, request ?: ViewResultsRequest())

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        viewService.delete(id)
        return ResponseEntity.noContent().build()
    }
}
