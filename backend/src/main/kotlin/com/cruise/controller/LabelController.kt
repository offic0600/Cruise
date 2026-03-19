package com.cruise.controller

import com.cruise.service.CreateLabelRequest
import com.cruise.service.LabelCatalogDto
import com.cruise.service.LabelDto
import com.cruise.service.LabelService
import com.cruise.service.UpdateLabelRequest
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
@RequestMapping("/api/labels")
class LabelController(
    private val labelService: LabelService
) {
    @GetMapping
    fun getAll(
        @RequestParam(required = false) organizationId: Long?,
        @RequestParam(required = false) teamId: Long?,
        @RequestParam(required = false) q: String?
    ): LabelCatalogDto = labelService.findCatalog(organizationId, teamId, q)

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long): LabelDto = labelService.findById(id)

    @PostMapping
    fun create(@RequestBody request: CreateLabelRequest): ResponseEntity<LabelDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(labelService.create(request))

    @PutMapping("/{id}")
    fun update(@PathVariable id: Long, @RequestBody request: UpdateLabelRequest): LabelDto = labelService.update(id, request)

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        labelService.delete(id)
        return ResponseEntity.noContent().build()
    }
}
