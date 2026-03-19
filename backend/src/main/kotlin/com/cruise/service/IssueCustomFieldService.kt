package com.cruise.service

import com.cruise.entity.CustomFieldDefinition
import com.cruise.entity.CustomFieldValue
import com.cruise.entity.Issue
import com.cruise.repository.CustomFieldDefinitionRepository
import com.cruise.repository.CustomFieldValueRepository
import com.cruise.repository.TeamRepository
import com.cruise.repository.UserRepository
import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDate
import java.time.LocalDateTime

@Service
@Transactional
class IssueCustomFieldService(
    private val customFieldDefinitionService: CustomFieldDefinitionService,
    private val customFieldDefinitionRepository: CustomFieldDefinitionRepository,
    private val customFieldValueRepository: CustomFieldValueRepository,
    private val userRepository: UserRepository,
    private val teamRepository: TeamRepository,
    private val objectMapper: ObjectMapper
) {
    fun getDefinitionsForIssue(issue: Issue): List<CustomFieldDefinitionDto> =
        customFieldDefinitionService.toDtos(
            customFieldDefinitionService.applicableDefinitions(issue.organizationId, "ISSUE", issue.teamId, issue.projectId)
        )

    fun getDefinitionsForWorkspace(
        organizationId: Long,
        teamId: Long?,
        projectId: Long?
    ): List<CustomFieldDefinitionDto> = customFieldDefinitionService.toDtos(
        customFieldDefinitionService.applicableDefinitions(organizationId, "ISSUE", teamId, projectId)
    )

    fun getValuesForIssue(issue: Issue): Map<String, Any?> {
        val definitions = customFieldDefinitionService.applicableDefinitions(issue.organizationId, "ISSUE", issue.teamId, issue.projectId)
        if (definitions.isEmpty()) return emptyMap()
        return buildValueMap(definitions, customFieldValueRepository.findByEntityTypeAndEntityId("ISSUE", issue.id))
    }

    fun getValuesForIssues(issues: List<Issue>): Map<Long, Map<String, Any?>> {
        if (issues.isEmpty()) return emptyMap()
        val valuesByIssue = customFieldValueRepository.findByEntityTypeAndEntityIdIn("ISSUE", issues.map { it.id }).groupBy { it.entityId }
        return issues.associate { issue ->
            val definitions = customFieldDefinitionService.applicableDefinitions(issue.organizationId, "ISSUE", issue.teamId, issue.projectId)
            issue.id to buildValueMap(definitions, valuesByIssue[issue.id].orEmpty())
        }
    }

    fun matchesFilters(values: Map<String, Any?>, filters: Map<String, Any?>): Boolean =
        filters.all { (key, expected) ->
            val actual = values[key]
            when {
                expected == null -> true
                actual == null -> false
                expected is Collection<*> && actual is Collection<*> -> expected.all { it in actual }
                actual is Collection<*> -> actual.any { normalize(it) == normalize(expected) }
                expected is Collection<*> -> expected.any { normalize(it) == normalize(actual) }
                actual is String && expected is String -> actual.contains(expected, ignoreCase = true)
                else -> normalize(actual) == normalize(expected)
            }
        }

    @Transactional
    fun replaceIssueValues(issue: Issue, payload: Map<String, Any?>?) {
        val definitions = customFieldDefinitionService.applicableDefinitions(issue.organizationId, "ISSUE", issue.teamId, issue.projectId)
        val definitionsByKey = definitions.associateBy { it.key }
        val sanitizedPayload = payload.orEmpty().filterValues { value ->
            value != null && !(value is String && value.isBlank())
        }
        val missingDefinitions = ensureDefinitionsForUnknownKeys(issue, sanitizedPayload, definitionsByKey)
        val allDefinitions = definitions + missingDefinitions

        val now = LocalDateTime.now()
        val valuesToSave = allDefinitions.mapNotNull { definition ->
            val rawValue = sanitizedPayload[definition.key]
            if (rawValue == null) {
                if (definition.required) {
                    throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Custom field '${definition.name}' is required")
                }
                return@mapNotNull null
            }
            buildValue(definition, issue.id, rawValue, now)
        }

        customFieldValueRepository.deleteByEntityTypeAndEntityId("ISSUE", issue.id)
        customFieldValueRepository.flush()
        if (valuesToSave.isNotEmpty()) {
            customFieldValueRepository.saveAll(valuesToSave)
        }
    }

    private fun ensureDefinitionsForUnknownKeys(
        issue: Issue,
        payload: Map<String, Any?>,
        existingDefinitions: Map<String, CustomFieldDefinition>
    ): List<CustomFieldDefinition> {
        val unknownKeys = payload.keys - existingDefinitions.keys
        if (unknownKeys.isEmpty()) return emptyList()

        val now = LocalDateTime.now()
        return unknownKeys.sorted().map { key ->
            val rawValue = payload.getValue(key)
            customFieldDefinitionRepository.save(
                CustomFieldDefinition(
                    organizationId = issue.organizationId,
                    entityType = "ISSUE",
                    scopeType = "GLOBAL",
                    scopeId = null,
                    key = key,
                    name = key.split("_", "-", " ")
                        .filter { it.isNotBlank() }
                        .joinToString(" ") { token -> token.replaceFirstChar { if (it.isLowerCase()) it.titlecase() else it.toString() } },
                    description = "Auto-provisioned during Linear object-model migration.",
                    dataType = inferDataType(rawValue),
                    required = false,
                    multiple = false,
                    isActive = true,
                    isVisible = false,
                    isFilterable = false,
                    isSortable = false,
                    showOnCreate = false,
                    showOnDetail = false,
                    showOnList = false,
                    sortOrder = 10_000,
                    createdAt = now,
                    updatedAt = now
                )
            )
        }
    }

    private fun inferDataType(value: Any?): String =
        when (value) {
            is Boolean -> "BOOLEAN"
            is Number -> "NUMBER"
            else -> "TEXTAREA"
        }

    @Transactional
    fun deleteIssueValues(issueId: Long) {
        customFieldValueRepository.deleteByEntityTypeAndEntityId("ISSUE", issueId)
    }

    private fun buildValueMap(definitions: List<CustomFieldDefinition>, values: List<CustomFieldValue>): Map<String, Any?> {
        if (definitions.isEmpty()) return emptyMap()
        val valuesByDefinitionId = values.associateBy { it.fieldDefinitionId }
        return definitions.mapNotNull { definition ->
            valuesByDefinitionId[definition.id]?.let { definition.key to parseStoredValue(definition.dataType, it) }
        }.toMap()
    }

    private fun buildValue(definition: CustomFieldDefinition, entityId: Long, rawValue: Any, now: LocalDateTime): CustomFieldValue {
        val value = CustomFieldValue(
            fieldDefinitionId = definition.id,
            entityType = "ISSUE",
            entityId = entityId,
            createdAt = now,
            updatedAt = now
        )
        when (definition.dataType) {
            "TEXT", "TEXTAREA", "URL", "SINGLE_SELECT" -> value.valueText = requireString(definition, rawValue)
            "NUMBER" -> value.valueNumber = requireNumber(definition, rawValue)
            "BOOLEAN" -> value.valueBoolean = requireBoolean(definition, rawValue)
            "DATE" -> value.valueDate = LocalDate.parse(requireString(definition, rawValue))
            "DATETIME" -> value.valueDateTime = LocalDateTime.parse(requireString(definition, rawValue))
            "MULTI_SELECT" -> {
                val values = requireStringCollection(definition, rawValue)
                validateOptions(definition, values)
                value.valueJson = objectMapper.writeValueAsString(values)
            }
            "USER" -> {
                val userId = requireId(definition, rawValue)
                if (!userRepository.existsById(userId)) throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown user for '${definition.name}'")
                value.valueText = userId.toString()
            }
            "TEAM" -> {
                val teamId = requireId(definition, rawValue)
                if (!teamRepository.existsById(teamId)) throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown team for '${definition.name}'")
                value.valueText = teamId.toString()
            }
            else -> throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported custom field data type")
        }
        if (definition.dataType == "SINGLE_SELECT") validateOptions(definition, listOf(value.valueText ?: ""))
        return value
    }

    private fun parseStoredValue(dataType: String, value: CustomFieldValue): Any? =
        when (dataType) {
            "TEXT", "TEXTAREA", "URL", "SINGLE_SELECT" -> value.valueText
            "NUMBER" -> value.valueNumber
            "BOOLEAN" -> value.valueBoolean
            "DATE" -> value.valueDate?.toString()
            "DATETIME" -> value.valueDateTime?.toString()
            "MULTI_SELECT" -> parseJsonArray(value.valueJson)
            "USER", "TEAM" -> value.valueText?.toLongOrNull()
            else -> value.valueJson ?: value.valueText
        }

    private fun parseJsonArray(raw: String?): List<String> {
        if (raw.isNullOrBlank()) return emptyList()
        return runCatching { objectMapper.readValue(raw, object : TypeReference<List<String>>() {}) }.getOrElse { emptyList() }
    }

    private fun validateOptions(definition: CustomFieldDefinition, values: List<String>) {
        if (definition.dataType !in setOf("SINGLE_SELECT", "MULTI_SELECT")) return
        val allowedOptions = customFieldDefinitionService.optionMapFor(listOf(definition.id))[definition.id].orEmpty()
            .filter { it.isActive }
            .map { it.value }
            .toSet()
        if (allowedOptions.isEmpty()) return
        if (values.any { it !in allowedOptions }) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported option for '${definition.name}'")
        }
    }

    private fun requireString(definition: CustomFieldDefinition, rawValue: Any): String =
        (rawValue as? String)
            ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Custom field '${definition.name}' expects a string")

    private fun requireNumber(definition: CustomFieldDefinition, rawValue: Any): Double =
        when (rawValue) {
            is Number -> rawValue.toDouble()
            is String -> rawValue.toDoubleOrNull()
            else -> null
        } ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Custom field '${definition.name}' expects a number")

    private fun requireBoolean(definition: CustomFieldDefinition, rawValue: Any): Boolean =
        when (rawValue) {
            is Boolean -> rawValue
            is String -> rawValue.equals("true", ignoreCase = true)
            else -> throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Custom field '${definition.name}' expects a boolean")
        }

    private fun requireId(definition: CustomFieldDefinition, rawValue: Any): Long =
        when (rawValue) {
            is Number -> rawValue.toLong()
            is String -> rawValue.toLongOrNull()
            else -> null
        } ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Custom field '${definition.name}' expects an ID")

    private fun requireStringCollection(definition: CustomFieldDefinition, rawValue: Any): List<String> =
        when (rawValue) {
            is Collection<*> -> rawValue.map {
                it as? String ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Custom field '${definition.name}' expects a list of strings")
            }
            is String -> rawValue.split(",").map(String::trim).filter(String::isNotBlank)
            else -> throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Custom field '${definition.name}' expects multiple values")
        }

    private fun normalize(value: Any?): String =
        when (value) {
            null -> ""
            is String -> value.trim().lowercase()
            else -> value.toString().trim().lowercase()
        }
}
