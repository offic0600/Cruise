package com.cruise.controller

import com.cruise.service.CreateImportFieldMappingTemplateRequest
import com.cruise.service.ImportFieldMappingTemplateDto
import com.cruise.service.ImportFieldMappingTemplateService
import com.cruise.service.UpdateImportFieldMappingTemplateRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/import-field-mappings")
class ImportFieldMappingTemplateController(
    private val importFieldMappingTemplateService: ImportFieldMappingTemplateService
) {
    @GetMapping
    fun getAll(
        @RequestParam organizationId: Long,
        @RequestParam entityType: String
    ): List<ImportFieldMappingTemplateDto> =
        importFieldMappingTemplateService.findAll(organizationId, entityType)

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long): ImportFieldMappingTemplateDto =
        importFieldMappingTemplateService.findById(id)

    @PostMapping
    fun create(@RequestBody request: CreateImportFieldMappingTemplateRequest): ResponseEntity<ImportFieldMappingTemplateDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(importFieldMappingTemplateService.create(request))

    @PutMapping("/{id}")
    fun update(@PathVariable id: Long, @RequestBody request: UpdateImportFieldMappingTemplateRequest): ImportFieldMappingTemplateDto =
        importFieldMappingTemplateService.update(id, request)

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        importFieldMappingTemplateService.delete(id)
        return ResponseEntity.noContent().build()
    }
}
