package com.cruise.controller

import com.cruise.service.CreateCustomFieldDefinitionRequest
import com.cruise.service.CustomFieldDefinitionDto
import com.cruise.service.CustomFieldDefinitionService
import com.cruise.service.UpdateCustomFieldDefinitionRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/custom-fields")
class CustomFieldController(
    private val customFieldDefinitionService: CustomFieldDefinitionService
) {
    @GetMapping
    fun getAll(
        @RequestParam organizationId: Long,
        @RequestParam entityType: String,
        @RequestParam(required = false, defaultValue = "false") includeInactive: Boolean
    ): List<CustomFieldDefinitionDto> =
        customFieldDefinitionService.findAll(organizationId, entityType, includeInactive)

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long): CustomFieldDefinitionDto =
        customFieldDefinitionService.findById(id)

    @PostMapping
    fun create(@RequestBody request: CreateCustomFieldDefinitionRequest): ResponseEntity<CustomFieldDefinitionDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(customFieldDefinitionService.create(request))

    @PutMapping("/{id}")
    fun update(@PathVariable id: Long, @RequestBody request: UpdateCustomFieldDefinitionRequest): CustomFieldDefinitionDto =
        customFieldDefinitionService.update(id, request)

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        customFieldDefinitionService.delete(id)
        return ResponseEntity.noContent().build()
    }
}
