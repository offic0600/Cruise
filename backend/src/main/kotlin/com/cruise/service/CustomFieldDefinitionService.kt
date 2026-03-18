package com.cruise.service

import com.cruise.entity.CustomFieldDefinition
import com.cruise.entity.CustomFieldOption
import com.cruise.repository.CustomFieldDefinitionRepository
import com.cruise.repository.CustomFieldOptionRepository
import com.cruise.repository.ProjectRepository
import com.cruise.repository.TeamRepository
import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDateTime

data class CustomFieldOptionDto(
    val id: Long,
    val value: String,
    val label: String,
    val color: String?,
    val sortOrder: Int,
    val isActive: Boolean
)

data class CustomFieldDefinitionDto(
    val id: Long,
    val organizationId: Long,
    val entityType: String,
    val scopeType: String,
    val scopeId: Long?,
    val key: String,
    val name: String,
    val description: String?,
    val dataType: String,
    val required: Boolean,
    val multiple: Boolean,
    val isActive: Boolean,
    val isVisible: Boolean,
    val isFilterable: Boolean,
    val isSortable: Boolean,
    val showOnCreate: Boolean,
    val showOnDetail: Boolean,
    val showOnList: Boolean,
    val sortOrder: Int,
    val config: Map<String, Any?>,
    val options: List<CustomFieldOptionDto>,
    val createdAt: String,
    val updatedAt: String
)

data class CustomFieldOptionRequest(
    val value: String,
    val label: String,
    val color: String? = null,
    val sortOrder: Int? = null,
    val isActive: Boolean? = true
)

data class CreateCustomFieldDefinitionRequest(
    val organizationId: Long,
    val entityType: String,
    val scopeType: String = "GLOBAL",
    val scopeId: Long? = null,
    val key: String,
    val name: String,
    val description: String? = null,
    val dataType: String,
    val required: Boolean? = false,
    val multiple: Boolean? = false,
    val isActive: Boolean? = true,
    val isVisible: Boolean? = true,
    val isFilterable: Boolean? = false,
    val isSortable: Boolean? = false,
    val showOnCreate: Boolean? = true,
    val showOnDetail: Boolean? = true,
    val showOnList: Boolean? = false,
    val sortOrder: Int? = 0,
    val config: Map<String, Any?>? = null,
    val options: List<CustomFieldOptionRequest> = emptyList()
)

data class UpdateCustomFieldDefinitionRequest(
    val scopeType: String? = null,
    val scopeId: Long? = null,
    val name: String? = null,
    val description: String? = null,
    val dataType: String? = null,
    val required: Boolean? = null,
    val multiple: Boolean? = null,
    val isActive: Boolean? = null,
    val isVisible: Boolean? = null,
    val isFilterable: Boolean? = null,
    val isSortable: Boolean? = null,
    val showOnCreate: Boolean? = null,
    val showOnDetail: Boolean? = null,
    val showOnList: Boolean? = null,
    val sortOrder: Int? = null,
    val config: Map<String, Any?>? = null,
    val options: List<CustomFieldOptionRequest>? = null
)

@Service
class CustomFieldDefinitionService(
    private val customFieldDefinitionRepository: CustomFieldDefinitionRepository,
    private val customFieldOptionRepository: CustomFieldOptionRepository,
    private val teamRepository: TeamRepository,
    private val projectRepository: ProjectRepository,
    private val objectMapper: ObjectMapper
) {
    fun findAll(
        organizationId: Long,
        entityType: String,
        includeInactive: Boolean = false
    ): List<CustomFieldDefinitionDto> = toDtos(
        customFieldDefinitionRepository.findByOrganizationIdAndEntityTypeOrderBySortOrderAscNameAsc(organizationId, entityType)
            .filter { includeInactive || it.isActive }
    )

    fun findById(id: Long): CustomFieldDefinitionDto = toDto(getDefinition(id), optionMapFor(listOf(id))[id].orEmpty())

    fun create(request: CreateCustomFieldDefinitionRequest): CustomFieldDefinitionDto {
        validateRequest(
            organizationId = request.organizationId,
            entityType = request.entityType,
            key = request.key,
            dataType = request.dataType,
            scopeType = request.scopeType,
            scopeId = request.scopeId,
            options = request.options,
            excludeId = null
        )

        val now = LocalDateTime.now()
        val definition = customFieldDefinitionRepository.save(
            CustomFieldDefinition(
                organizationId = request.organizationId,
                entityType = request.entityType,
                scopeType = request.scopeType,
                scopeId = request.scopeId,
                key = request.key,
                name = request.name,
                description = request.description,
                dataType = request.dataType,
                required = request.required ?: false,
                multiple = request.multiple ?: false,
                isActive = request.isActive ?: true,
                isVisible = request.isVisible ?: true,
                isFilterable = request.isFilterable ?: false,
                isSortable = request.isSortable ?: false,
                showOnCreate = request.showOnCreate ?: true,
                showOnDetail = request.showOnDetail ?: true,
                showOnList = request.showOnList ?: false,
                sortOrder = request.sortOrder ?: 0,
                configJson = stringifyConfig(request.config),
                createdAt = now,
                updatedAt = now
            )
        )

        val savedOptions = saveOptions(definition.id, request.options)
        return toDto(definition, savedOptions)
    }

    fun update(id: Long, request: UpdateCustomFieldDefinitionRequest): CustomFieldDefinitionDto {
        val definition = getDefinition(id)
        val nextScopeType = request.scopeType ?: definition.scopeType
        val nextScopeId = when {
            nextScopeType == "GLOBAL" -> null
            request.scopeId != null -> request.scopeId
            request.scopeType != null -> null
            else -> definition.scopeId
        }
        val nextDataType = request.dataType ?: definition.dataType

        validateRequest(
            organizationId = definition.organizationId,
            entityType = definition.entityType,
            key = definition.key,
            dataType = nextDataType,
            scopeType = nextScopeType,
            scopeId = nextScopeId,
            options = request.options ?: optionMapFor(listOf(id))[id].orEmpty().map {
                CustomFieldOptionRequest(it.value, it.label, it.color, it.sortOrder, it.isActive)
            },
            excludeId = definition.id
        )

        definition.scopeType = nextScopeType
        definition.scopeId = nextScopeId
        definition.name = request.name ?: definition.name
        definition.description = request.description ?: definition.description
        definition.dataType = nextDataType
        definition.required = request.required ?: definition.required
        definition.multiple = request.multiple ?: definition.multiple
        definition.isActive = request.isActive ?: definition.isActive
        definition.isVisible = request.isVisible ?: definition.isVisible
        definition.isFilterable = request.isFilterable ?: definition.isFilterable
        definition.isSortable = request.isSortable ?: definition.isSortable
        definition.showOnCreate = request.showOnCreate ?: definition.showOnCreate
        definition.showOnDetail = request.showOnDetail ?: definition.showOnDetail
        definition.showOnList = request.showOnList ?: definition.showOnList
        definition.sortOrder = request.sortOrder ?: definition.sortOrder
        definition.configJson = request.config?.let(::stringifyConfig) ?: definition.configJson
        definition.updatedAt = LocalDateTime.now()

        val savedDefinition = customFieldDefinitionRepository.save(definition)
        val savedOptions = if (request.options != null) {
            customFieldOptionRepository.deleteByFieldDefinitionId(id)
            saveOptions(id, request.options)
        } else {
            optionMapFor(listOf(id))[id].orEmpty()
        }
        return toDto(savedDefinition, savedOptions)
    }

    fun delete(id: Long) {
        customFieldOptionRepository.deleteByFieldDefinitionId(id)
        customFieldDefinitionRepository.delete(getDefinition(id))
    }

    fun applicableDefinitions(
        organizationId: Long,
        entityType: String,
        teamId: Long?,
        projectId: Long?
    ): List<CustomFieldDefinition> = customFieldDefinitionRepository
        .findByOrganizationIdAndEntityTypeOrderBySortOrderAscNameAsc(organizationId, entityType)
        .filter { it.isActive }
        .filter {
            when (it.scopeType) {
                "GLOBAL" -> true
                "TEAM" -> it.scopeId == teamId
                "PROJECT" -> it.scopeId == projectId
                else -> false
            }
        }

    fun optionMapFor(definitionIds: Collection<Long>): Map<Long, List<CustomFieldOptionDto>> {
        if (definitionIds.isEmpty()) return emptyMap()
        return customFieldOptionRepository.findByFieldDefinitionIdInOrderBySortOrderAscIdAsc(definitionIds)
            .groupBy { it.fieldDefinitionId }
            .mapValues { (_, options) -> options.map(::toOptionDto) }
    }

    fun toDtos(definitions: List<CustomFieldDefinition>): List<CustomFieldDefinitionDto> {
        val optionsByDefinition = optionMapFor(definitions.map { it.id })
        return definitions.map { toDto(it, optionsByDefinition[it.id].orEmpty()) }
    }

    private fun validateRequest(
        organizationId: Long,
        entityType: String,
        key: String,
        dataType: String,
        scopeType: String,
        scopeId: Long?,
        options: List<CustomFieldOptionRequest>,
        excludeId: Long?
    ) {
        if (excludeId == null && customFieldDefinitionRepository.existsByOrganizationIdAndEntityTypeAndKey(organizationId, entityType, key)) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "Custom field key already exists")
        }
        when (scopeType) {
            "GLOBAL" -> if (scopeId != null) throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Global scope cannot define scopeId")
            "TEAM" -> if (scopeId == null || !teamRepository.existsById(scopeId)) throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Scoped team field must reference an existing team")
            "PROJECT" -> if (scopeId == null || !projectRepository.existsById(scopeId)) throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Scoped project field must reference an existing project")
            else -> throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported scope type")
        }
        val supportedDataTypes = setOf("TEXT", "TEXTAREA", "NUMBER", "DATE", "DATETIME", "SINGLE_SELECT", "MULTI_SELECT", "BOOLEAN", "USER", "TEAM", "URL")
        if (dataType !in supportedDataTypes) throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported custom field data type")
        if (dataType !in setOf("SINGLE_SELECT", "MULTI_SELECT") && options.isNotEmpty()) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Options are only valid for select fields")
        }
    }

    private fun saveOptions(fieldDefinitionId: Long, options: List<CustomFieldOptionRequest>): List<CustomFieldOptionDto> =
        customFieldOptionRepository.saveAll(
            options.mapIndexed { index, option ->
                CustomFieldOption(
                    fieldDefinitionId = fieldDefinitionId,
                    value = option.value,
                    label = option.label,
                    color = option.color,
                    sortOrder = option.sortOrder ?: index,
                    isActive = option.isActive ?: true
                )
            }
        ).map(::toOptionDto)

    private fun getDefinition(id: Long): CustomFieldDefinition =
        customFieldDefinitionRepository.findById(id)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Custom field definition not found") }

    private fun toDto(definition: CustomFieldDefinition, options: List<CustomFieldOptionDto>) = CustomFieldDefinitionDto(
        definition.id,
        definition.organizationId,
        definition.entityType,
        definition.scopeType,
        definition.scopeId,
        definition.key,
        definition.name,
        definition.description,
        definition.dataType,
        definition.required,
        definition.multiple,
        definition.isActive,
        definition.isVisible,
        definition.isFilterable,
        definition.isSortable,
        definition.showOnCreate,
        definition.showOnDetail,
        definition.showOnList,
        definition.sortOrder,
        parseConfig(definition.configJson),
        options,
        definition.createdAt.toString(),
        definition.updatedAt.toString()
    )

    private fun toOptionDto(option: CustomFieldOption) = CustomFieldOptionDto(
        option.id,
        option.value,
        option.label,
        option.color,
        option.sortOrder,
        option.isActive
    )

    private fun parseConfig(configJson: String?): Map<String, Any?> {
        if (configJson.isNullOrBlank()) return emptyMap()
        return runCatching { objectMapper.readValue(configJson, object : TypeReference<Map<String, Any?>>() {}) }.getOrElse { emptyMap() }
    }

    private fun stringifyConfig(config: Map<String, Any?>?): String? =
        config?.takeIf { it.isNotEmpty() }?.let(objectMapper::writeValueAsString)
}
