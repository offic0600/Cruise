package com.cruise.service

import com.cruise.entity.View
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.databind.node.ObjectNode
import org.springframework.stereotype.Component

@Component
class PersistedViewQueryStateResolver(
    private val objectMapper: ObjectMapper
) {
    fun normalizeQueryState(queryState: JsonNode?, requestedLayout: String?, resourceType: String): ObjectNode {
        val normalized = when {
            queryState == null || queryState.isNull -> defaultQueryState(resourceType)
            queryState.isObject -> queryState.deepCopy<ObjectNode>()
            else -> defaultQueryState(resourceType)
        }
        if (!normalized.has("filters") || !normalized.get("filters").isObject) {
            normalized.set<ObjectNode>("filters", defaultFilters())
        }
        if (!normalized.has("display") || !normalized.get("display").isObject) {
            normalized.set<ObjectNode>("display", defaultDisplay(resourceType))
        }
        if (!normalized.path("display").path("visibleColumns").isArray) {
            normalized.with("display").set<ArrayNode>("visibleColumns", defaultVisibleColumns(resourceType))
        }
        if (!normalized.has("grouping") || !normalized.get("grouping").isObject) {
            normalized.set<ObjectNode>("grouping", defaultGrouping())
        }
        if (!normalized.has("subGrouping") || !normalized.get("subGrouping").isObject) {
            normalized.set<ObjectNode>("subGrouping", defaultGrouping())
        }
        if (!normalized.has("sorting") || !normalized.get("sorting").isArray) {
            normalized.set<ArrayNode>("sorting", defaultSorting())
        }
        if (requestedLayout != null) {
            normalized.with("display").put("layout", requestedLayout.uppercase())
        }
        return normalized
    }

    fun effectiveQueryState(view: View): ObjectNode {
        val stored = view.queryState?.takeIf { it.isNotBlank() }?.let { objectMapper.readTree(it) as? ObjectNode }
        return normalizeQueryState(stored ?: legacyQueryState(view), view.layout, view.resourceType)
    }

    private fun legacyQueryState(view: View): ObjectNode {
        val state = defaultQueryState(view.resourceType)
        val filters = view.filterJson?.takeIf { it.isNotBlank() }?.let { objectMapper.readTree(it) } ?: defaultFilters()
        state.set<JsonNode>("filters", filters)
        if (!view.groupBy.isNullOrBlank()) {
            state.set<ObjectNode>("grouping", objectMapper.createObjectNode().apply { put("field", view.groupBy) })
        }
        if (!view.sortJson.isNullOrBlank()) {
            val sorting = objectMapper.readTree(view.sortJson)
            if (sorting.isArray) {
                state.set<ArrayNode>("sorting", sorting as ArrayNode)
            }
        }
        state.with("display").put("layout", view.layout.ifBlank { "LIST" })
        return state
    }

    private fun defaultQueryState(resourceType: String): ObjectNode = objectMapper.createObjectNode().apply {
        set<ObjectNode>("filters", defaultFilters())
        set<ObjectNode>("display", defaultDisplay(resourceType))
        set<ObjectNode>("grouping", defaultGrouping())
        set<ObjectNode>("subGrouping", defaultGrouping())
        set<ArrayNode>("sorting", defaultSorting())
    }

    private fun defaultFilters(): ObjectNode = objectMapper.createObjectNode().apply {
        put("operator", "AND")
        set<ArrayNode>("children", objectMapper.createArrayNode())
    }

    private fun defaultDisplay(resourceType: String): ObjectNode = objectMapper.createObjectNode().apply {
        put("layout", "LIST")
        set<ArrayNode>("visibleColumns", defaultVisibleColumns(resourceType))
        put("density", "comfortable")
        put("showSubIssues", true)
        put("showEmptyGroups", true)
    }

    private fun defaultVisibleColumns(resourceType: String): ArrayNode = objectMapper.createArrayNode().apply {
        when (resourceType) {
            ViewService.RESOURCE_ISSUE -> listOf("identifier", "title", "priority", "state", "assignee", "project", "labels", "updatedAt", "createdAt")
            ViewService.RESOURCE_PROJECT -> listOf("key", "name", "status", "ownerId", "teamId", "updatedAt", "createdAt")
            ViewService.RESOURCE_INITIATIVE -> listOf("slugId", "name", "status", "health", "ownerId", "targetDate", "updatedAt", "createdAt")
            else -> listOf("identifier", "title", "priority", "state", "assignee", "project", "labels", "updatedAt", "createdAt")
        }.forEach(::add)
    }

    private fun defaultGrouping(): ObjectNode = objectMapper.createObjectNode().apply {
        putNull("field")
    }

    private fun defaultSorting(): ArrayNode = objectMapper.createArrayNode().apply {
        add(
            objectMapper.createObjectNode().apply {
                put("field", "updatedAt")
                put("direction", "desc")
                put("nulls", "last")
            }
        )
    }
}
