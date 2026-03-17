package com.cruise.service

import com.cruise.entity.ImportFieldMappingTemplate
import com.cruise.repository.ImportFieldMappingTemplateRepository
import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDateTime

data class ImportFieldMappingTemplateDto(
    val id: Long,
    val organizationId: Long,
    val entityType: String,
    val name: String,
    val sourceType: String,
    val mapping: Map<String, Any?>,
    val isDefault: Boolean,
    val createdAt: String
)

data class CreateImportFieldMappingTemplateRequest(
    val organizationId: Long,
    val entityType: String,
    val name: String,
    val sourceType: String = "EXCEL",
    val mapping: Map<String, Any?>,
    val isDefault: Boolean? = false
)

data class UpdateImportFieldMappingTemplateRequest(
    val name: String? = null,
    val sourceType: String? = null,
    val mapping: Map<String, Any?>? = null,
    val isDefault: Boolean? = null
)

@Service
class ImportFieldMappingTemplateService(
    private val repository: ImportFieldMappingTemplateRepository,
    private val objectMapper: ObjectMapper
) {
    fun findAll(organizationId: Long, entityType: String): List<ImportFieldMappingTemplateDto> =
        repository.findByOrganizationIdAndEntityTypeOrderByIdAsc(organizationId, entityType).map(::toDto)

    fun findById(id: Long): ImportFieldMappingTemplateDto = toDto(getTemplate(id))

    fun create(request: CreateImportFieldMappingTemplateRequest): ImportFieldMappingTemplateDto =
        toDto(repository.save(ImportFieldMappingTemplate(
            organizationId = request.organizationId,
            entityType = request.entityType,
            name = request.name,
            sourceType = request.sourceType,
            mappingJson = objectMapper.writeValueAsString(request.mapping),
            isDefault = request.isDefault ?: false,
            createdAt = LocalDateTime.now()
        )))

    fun update(id: Long, request: UpdateImportFieldMappingTemplateRequest): ImportFieldMappingTemplateDto {
        val template = getTemplate(id)
        template.name = request.name ?: template.name
        template.sourceType = request.sourceType ?: template.sourceType
        template.mappingJson = request.mapping?.let(objectMapper::writeValueAsString) ?: template.mappingJson
        template.isDefault = request.isDefault ?: template.isDefault
        return toDto(repository.save(template))
    }

    fun delete(id: Long) {
        repository.delete(getTemplate(id))
    }

    private fun getTemplate(id: Long): ImportFieldMappingTemplate =
        repository.findById(id).orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Import field mapping template not found") }

    private fun toDto(template: ImportFieldMappingTemplate) = ImportFieldMappingTemplateDto(
        template.id,
        template.organizationId,
        template.entityType,
        template.name,
        template.sourceType,
        runCatching { objectMapper.readValue(template.mappingJson, object : TypeReference<Map<String, Any?>>() {}) }.getOrElse { emptyMap() },
        template.isDefault,
        template.createdAt.toString()
    )
}
