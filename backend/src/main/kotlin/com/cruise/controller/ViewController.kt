package com.cruise.controller

import com.cruise.service.CreateViewRequest
import com.cruise.service.UpdateViewRequest
import com.cruise.service.ViewDto
import com.cruise.service.ViewQuery
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
        @RequestParam(required = false) teamId: Long?,
        @RequestParam(required = false) projectId: Long?,
        @RequestParam(required = false) visibility: String?,
        @RequestParam(required = false) q: String?
    ): List<ViewDto> = viewService.findAll(
        ViewQuery(
            organizationId = organizationId,
            teamId = teamId,
            projectId = projectId,
            visibility = visibility,
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

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        viewService.delete(id)
        return ResponseEntity.noContent().build()
    }
}
