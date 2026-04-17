package com.cruise.service

import com.cruise.entity.View
import com.cruise.entity.ViewFavorite
import com.cruise.repository.MembershipRepository
import com.cruise.repository.OrganizationRepository
import com.cruise.repository.ProjectRepository
import com.cruise.repository.UserRepository
import com.cruise.repository.ViewFavoriteRepository
import com.cruise.repository.ViewRepository
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.databind.node.ObjectNode
import org.springframework.http.HttpStatus
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDate
import java.time.LocalDateTime

data class ViewDto(
    val id: Long,
    val organizationId: Long,
    val resourceType: String,
    val scopeType: String,
    val scopeId: Long?,
    val ownerUserId: Long?,
    val name: String,
    val description: String?,
    val icon: String?,
    val color: String?,
    val isSystem: Boolean,
    val systemKey: String?,
    val visibility: String,
    val position: Int,
    val layout: String,
    val queryState: JsonNode?,
    val archivedAt: String?,
    val createdAt: String,
    val updatedAt: String,
    val isFavorite: Boolean,
    val isEditable: Boolean,
    val isDeletable: Boolean,
    val teamId: Long?,
    val projectId: Long?,
    val filterJson: String?,
    val groupBy: String?,
    val sortJson: String?
)

data class ViewQuery(
    val organizationId: Long? = null,
    val resourceType: String? = null,
    val scopeType: String? = null,
    val scopeId: Long? = null,
    val includeSystem: Boolean = true,
    val includeFavorites: Boolean = true,
    val q: String? = null
)

data class CreateViewRequest(
    val organizationId: Long,
    val resourceType: String = "ISSUE",
    val scopeType: String = "WORKSPACE",
    val scopeId: Long? = null,
    val name: String,
    val description: String? = null,
    val icon: String? = null,
    val color: String? = null,
    val visibility: String? = null,
    val layout: String? = null,
    val queryState: JsonNode? = null,
    val isSystem: Boolean? = null,
    val systemKey: String? = null
)

data class UpdateViewRequest(
    val name: String? = null,
    val description: String? = null,
    val icon: String? = null,
    val color: String? = null,
    val ownerUserId: Long? = null,
    val scopeType: String? = null,
    val scopeId: Long? = null,
    val visibility: String? = null,
    val layout: String? = null,
    val position: Int? = null,
    val queryState: JsonNode? = null
)

data class ViewResultsRequest(
    val page: Int? = 0,
    val size: Int? = 50,
    val queryState: JsonNode? = null
)

data class ViewPreviewResultsRequest(
    val organizationId: Long,
    val resourceType: String = "ISSUE",
    val scopeType: String = "WORKSPACE",
    val scopeId: Long? = null,
    val queryState: JsonNode? = null,
    val page: Int? = 0,
    val size: Int? = 50
)

data class ViewResultGroupDto(
    val key: String,
    val label: String,
    val count: Int
)

data class ViewResultsResponse(
    val items: List<Any>,
    val pageInfo: RestPageInfo,
    val totalCount: Int,
    val appliedQueryState: JsonNode?,
    val groups: List<ViewResultGroupDto> = emptyList()
)

@Service
@Transactional
class ViewService(
    private val viewRepository: ViewRepository,
    private val viewFavoriteRepository: ViewFavoriteRepository,
    private val membershipRepository: MembershipRepository,
    private val organizationRepository: OrganizationRepository,
    private val projectRepository: ProjectRepository,
    private val userRepository: UserRepository,
    private val issueService: IssueService,
    private val projectService: ProjectService,
    private val initiativeService: InitiativeService,
    private val objectMapper: ObjectMapper,
    private val persistedViewQueryStateResolver: PersistedViewQueryStateResolver
) {
    fun findAll(query: ViewQuery = ViewQuery()): List<ViewDto> {
        val userId = requireCurrentUserId()
        if (query.organizationId != null) {
            purgeSystemViews(query.organizationId)
        }
        val favoriteIds = favoriteIdsByUser(userId)
        val memberships = membershipRepository.findByUserIdAndActiveTrue(userId)
        val candidateViews = if (query.organizationId != null) {
            viewRepository.findByOrganizationId(query.organizationId)
        } else {
            val organizationIds = memberships.map { it.organizationId }.distinct()
            viewRepository.findAll().filter { it.organizationId in organizationIds }
        }

        val normalizedResourceType = query.resourceType?.let(::normalizeResourceType)

        return candidateViews
            .asSequence()
            .filter { it.archivedAt == null }
            .filter { query.organizationId == null || it.organizationId == query.organizationId }
            .filter { normalizedResourceType == null || it.resourceType == normalizedResourceType }
            .filter { query.scopeType == null || it.scopeType == query.scopeType }
            .filter { query.scopeId == null || it.scopeId == query.scopeId }
            .filter { query.includeSystem || !it.isSystem }
            .filter { query.q.isNullOrBlank() || listOfNotNull(it.name, it.description).any { text -> text.contains(query.q, ignoreCase = true) } }
            .filter { canReadView(it, userId, memberships) }
            .sortedWith(
                compareBy<View> { !favoriteIds.contains(it.id) }
                    .thenBy { it.position }
                    .thenBy { it.name.lowercase() }
            )
            .map { it.toDto(isFavorite = favoriteIds.contains(it.id), currentUserId = userId) }
            .toList()
    }

    fun findById(id: Long): ViewDto {
        val userId = requireCurrentUserId()
        val memberships = membershipRepository.findByUserIdAndActiveTrue(userId)
        val view = getView(id)
        if (view.isSystem) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "View not found")
        }
        if (!canReadView(view, userId, memberships)) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "View not accessible")
        }
        return view.toDto(isFavorite = viewFavoriteRepository.findByUserIdAndViewId(userId, id) != null, currentUserId = userId)
    }

    fun create(request: CreateViewRequest): ViewDto {
        val userId = requireCurrentUserId()
        validateOrganizationAccess(request.organizationId, userId)
        validateScopeAccess(request.organizationId, request.scopeType, request.scopeId, userId)
        val normalizedResourceType = normalizeResourceType(request.resourceType)
        val normalizedQueryState = normalizeQueryState(request.queryState, request.layout, normalizedResourceType)
        val normalizedScopeType = request.scopeType.uppercase()
        val visibility = normalizeVisibility(normalizedScopeType, request.visibility)
        val saved = viewRepository.save(
            View(
                organizationId = request.organizationId,
                resourceType = normalizedResourceType,
                scopeType = normalizedScopeType,
                scopeId = request.scopeId,
                ownerUserId = if (request.isSystem ?: false) null else userId,
                name = request.name,
                description = request.description,
                icon = request.icon,
                color = request.color,
                filterJson = deriveLegacyFilterJson(normalizedQueryState),
                groupBy = deriveLegacyGroupBy(normalizedQueryState),
                sortJson = deriveLegacySortJson(normalizedQueryState),
                queryState = serializeQueryState(normalizedQueryState),
                visibility = visibility,
                isSystem = request.isSystem ?: false,
                systemKey = request.systemKey,
                position = nextPosition(request.organizationId, normalizedResourceType, normalizedScopeType, request.scopeId),
                layout = layoutFromQueryState(normalizedQueryState)
            )
        )
        return saved.toDto(false, userId)
    }

    fun update(id: Long, request: UpdateViewRequest): ViewDto {
        val userId = requireCurrentUserId()
        val view = getView(id)
        if (view.isSystem) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "System views cannot be updated directly")
        }
        if (!canEditView(view, userId)) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "View not editable")
        }
        val targetLayout = request.layout ?: view.layout
        val normalizedQueryState = request.queryState?.let { normalizeQueryState(it, targetLayout, view.resourceType) }
            ?: normalizeQueryState(effectiveQueryState(view), targetLayout, view.resourceType)
        val normalizedScopeType = request.scopeType?.uppercase() ?: view.scopeType
        val normalizedScopeId = if (request.scopeType != null) request.scopeId else view.scopeId
        validateScopeAccess(view.organizationId, normalizedScopeType, normalizedScopeId, userId)
        val nextOwnerUserId = request.ownerUserId ?: view.ownerUserId
        validateOwnerAccess(view.organizationId, normalizedScopeType, normalizedScopeId, nextOwnerUserId)
        val normalizedVisibility = normalizeVisibility(normalizedScopeType, request.visibility ?: view.visibility)
        val saved = viewRepository.save(
            View(
                id = view.id,
                organizationId = view.organizationId,
                resourceType = view.resourceType,
                scopeType = normalizedScopeType,
                scopeId = normalizedScopeId,
                ownerUserId = nextOwnerUserId,
                name = request.name ?: view.name,
                description = request.description ?: view.description,
                icon = request.icon ?: view.icon,
                color = request.color ?: view.color,
                filterJson = deriveLegacyFilterJson(normalizedQueryState),
                groupBy = deriveLegacyGroupBy(normalizedQueryState),
                sortJson = deriveLegacySortJson(normalizedQueryState),
                queryState = serializeQueryState(normalizedQueryState),
                visibility = normalizedVisibility,
                isSystem = view.isSystem,
                systemKey = view.systemKey,
                position = request.position ?: view.position,
                layout = request.layout ?: layoutFromQueryState(normalizedQueryState),
                createdAt = view.createdAt,
                updatedAt = LocalDateTime.now(),
                archivedAt = view.archivedAt
            )
        )
        return saved.toDto(viewFavoriteRepository.findByUserIdAndViewId(userId, id) != null, userId)
    }

    fun duplicate(id: Long): ViewDto {
        val userId = requireCurrentUserId()
        val memberships = membershipRepository.findByUserIdAndActiveTrue(userId)
        val source = getView(id)
        if (!canReadView(source, userId, memberships)) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "View not accessible")
        }
        val sourceQueryState = effectiveQueryState(source)
        val duplicated = viewRepository.save(
            View(
                organizationId = source.organizationId,
                resourceType = source.resourceType,
                scopeType = source.scopeType,
                scopeId = source.scopeId,
                ownerUserId = userId,
                name = "${source.name} Copy",
                description = source.description,
                icon = source.icon,
                color = source.color,
                filterJson = deriveLegacyFilterJson(sourceQueryState),
                groupBy = deriveLegacyGroupBy(sourceQueryState),
                sortJson = deriveLegacySortJson(sourceQueryState),
                queryState = serializeQueryState(sourceQueryState),
                visibility = VISIBILITY_PERSONAL,
                isSystem = false,
                systemKey = null,
                position = nextPosition(source.organizationId, source.resourceType, source.scopeType, source.scopeId),
                layout = layoutFromQueryState(sourceQueryState)
            )
        )
        return duplicated.toDto(false, userId)
    }

    fun favorite(id: Long): ViewDto {
        val userId = requireCurrentUserId()
        val memberships = membershipRepository.findByUserIdAndActiveTrue(userId)
        val view = getView(id)
        if (!canReadView(view, userId, memberships)) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "View not accessible")
        }
        if (viewFavoriteRepository.findByUserIdAndViewId(userId, id) == null) {
            viewFavoriteRepository.save(ViewFavorite(viewId = id, userId = userId))
        }
        return view.toDto(true, userId)
    }

    fun unfavorite(id: Long): ViewDto {
        val userId = requireCurrentUserId()
        val view = getView(id)
        viewFavoriteRepository.findByUserIdAndViewId(userId, id)?.let(viewFavoriteRepository::delete)
        return view.toDto(false, userId)
    }

    fun delete(id: Long) {
        val userId = requireCurrentUserId()
        val view = getView(id)
        if (view.isSystem) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "System views cannot be deleted")
        }
        if (!canDeleteView(view, userId)) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "View not deletable")
        }
        viewFavoriteRepository.findByViewId(id).forEach(viewFavoriteRepository::delete)
        viewRepository.save(
            View(
                id = view.id,
                organizationId = view.organizationId,
                resourceType = view.resourceType,
                scopeType = view.scopeType,
                scopeId = view.scopeId,
                ownerUserId = view.ownerUserId,
                name = view.name,
                description = view.description,
                icon = view.icon,
                color = view.color,
                filterJson = view.filterJson,
                groupBy = view.groupBy,
                sortJson = view.sortJson,
                queryState = view.queryState,
                visibility = view.visibility,
                isSystem = view.isSystem,
                systemKey = view.systemKey,
                position = view.position,
                layout = view.layout,
                createdAt = view.createdAt,
                updatedAt = LocalDateTime.now(),
                archivedAt = LocalDateTime.now()
            )
        )
    }

    fun findResults(id: Long, request: ViewResultsRequest): ViewResultsResponse {
        val userId = requireCurrentUserId()
        val memberships = membershipRepository.findByUserIdAndActiveTrue(userId)
        val view = getView(id)
        if (view.isSystem) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "View not found")
        }
        if (!canReadView(view, userId, memberships)) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "View not accessible")
        }
        val queryState = request.queryState?.let { normalizeQueryState(it, null, view.resourceType) } ?: effectiveQueryState(view)
        val page = request.page ?: 0
        val size = request.size ?: 50
        return when (view.resourceType) {
            RESOURCE_ISSUE -> buildIssueResults(view, queryState, userId, page, size)
            RESOURCE_PROJECT -> buildProjectResults(view, queryState, userId, page, size)
            RESOURCE_INITIATIVE -> buildInitiativeResults(view, queryState, userId, page, size)
            else -> throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported resource type")
        }
    }

    fun findPreviewResults(request: ViewPreviewResultsRequest): ViewResultsResponse {
        val userId = requireCurrentUserId()
        validateOrganizationAccess(request.organizationId, userId)
        validateScopeAccess(request.organizationId, request.scopeType, request.scopeId, userId)
        val normalizedScopeType = request.scopeType.uppercase()
        val resourceType = normalizeResourceType(request.resourceType)
        val queryState = normalizeQueryState(request.queryState, null, resourceType)
        val page = request.page ?: 0
        val size = request.size ?: 50
        val previewView = View(
            organizationId = request.organizationId,
            resourceType = resourceType,
            scopeType = normalizedScopeType,
            scopeId = request.scopeId,
            ownerUserId = userId,
            name = "Preview",
            queryState = serializeQueryState(queryState),
            visibility = VISIBILITY_PERSONAL,
            layout = layoutFromQueryState(queryState)
        )
        return when (resourceType) {
            RESOURCE_ISSUE -> buildIssueResults(previewView, queryState, userId, page, size)
            RESOURCE_PROJECT -> buildProjectResults(previewView, queryState, userId, page, size)
            RESOURCE_INITIATIVE -> buildInitiativeResults(previewView, queryState, userId, page, size)
            else -> throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported resource type")
        }
    }

    private fun buildIssueResults(
        view: View,
        queryState: ObjectNode,
        currentUserId: Long,
        page: Int,
        size: Int
    ): ViewResultsResponse {
        val issueQuery = IssueQuery(
            organizationId = view.organizationId,
            teamId = if (view.scopeType == SCOPE_TEAM) view.scopeId else null,
            projectId = if (view.scopeType == SCOPE_PROJECT) view.scopeId else null,
            includeArchived = false,
            page = 0,
            size = Int.MAX_VALUE
        )
        val allIssues = issueService.findAllMatching(issueQuery)
        val parentIssueIds = allIssues.mapNotNull { it.parentIssueId }.toSet()
        val filtered = allIssues.filter { matchesIssueFilters(queryState.path("filters"), it, currentUserId, parentIssueIds) }
        val sorted = sortItems(filtered, queryState.path("sorting")) { item, field -> issueFieldValue(item, field, parentIssueIds) }
        val groups = buildGroups(sorted, queryState.path("grouping")) { item, field -> issueFieldValue(item, field, parentIssueIds) }
        val paged = sorted.toRestPage(page, size)
        return ViewResultsResponse(
            items = paged.items,
            pageInfo = paged.pageInfo,
            totalCount = paged.totalCount,
            appliedQueryState = queryState,
            groups = groups
        )
    }

    private fun buildProjectResults(
        view: View,
        queryState: ObjectNode,
        currentUserId: Long,
        page: Int,
        size: Int
    ): ViewResultsResponse {
        val projectQuery = ProjectQuery(
            organizationId = view.organizationId,
            teamId = if (view.scopeType == SCOPE_TEAM) view.scopeId else null,
            includeArchived = false,
            page = 0,
            size = Int.MAX_VALUE
        )
        val allProjects = projectService.findAllMatching(projectQuery)
        val filtered = allProjects.filter { matchesProjectFilters(queryState.path("filters"), it, currentUserId) }
        val sorted = sortItems(filtered, queryState.path("sorting")) { item, field -> projectFieldValue(item, field) }
        val groups = buildGroups(sorted, queryState.path("grouping")) { item, field -> projectFieldValue(item, field) }
        val paged = sorted.toRestPage(page, size)
        return ViewResultsResponse(
            items = paged.items,
            pageInfo = paged.pageInfo,
            totalCount = paged.totalCount,
            appliedQueryState = queryState,
            groups = groups
        )
    }

    private fun buildInitiativeResults(
        view: View,
        queryState: ObjectNode,
        currentUserId: Long,
        page: Int,
        size: Int
    ): ViewResultsResponse {
        val allInitiatives = initiativeService.findAll(
            InitiativeQuery(
                organizationId = view.organizationId,
                includeArchived = false,
                page = 0,
                size = Int.MAX_VALUE
            )
        ).items
        val filtered = allInitiatives.filter { matchesInitiativeFilters(queryState.path("filters"), it, currentUserId) }
        val sorted = sortItems(filtered, queryState.path("sorting")) { item, field -> initiativeFieldValue(item, field) }
        val groups = buildGroups(sorted, queryState.path("grouping")) { item, field -> initiativeFieldValue(item, field) }
        val paged = sorted.toRestPage(page, size)
        return ViewResultsResponse(
            items = paged.items,
            pageInfo = paged.pageInfo,
            totalCount = paged.totalCount,
            appliedQueryState = queryState,
            groups = groups
        )
    }

    private fun <T> sortItems(
        items: List<T>,
        sortingNode: JsonNode,
        fieldResolver: (T, String) -> Any?
    ): List<T> {
        if (!sortingNode.isArray || sortingNode.isEmpty) return items
        val rules = sortingNode.filter { it.isObject }
        val comparator = Comparator<T> { left, right ->
            for (rule in rules) {
                val field = rule.path("field").asText("")
                if (field.isBlank()) continue
                val direction = rule.path("direction").asText("asc")
                val nulls = rule.path("nulls").asText("last")
                val comparison = compareValues(fieldResolver(left, field), fieldResolver(right, field), nulls)
                if (comparison != 0) {
                    return@Comparator if (direction.equals("desc", ignoreCase = true)) -comparison else comparison
                }
            }
            0
        }
        return items.sortedWith(comparator)
    }

    private fun <T> buildGroups(
        items: List<T>,
        groupingNode: JsonNode,
        fieldResolver: (T, String) -> Any?
    ): List<ViewResultGroupDto> {
        val field = groupingNode.path("field").asText("")
        if (field.isBlank()) return emptyList()
        return items.groupBy { stringifyValue(fieldResolver(it, field)) }
            .entries
            .sortedBy { it.key }
            .map { (key, groupItems) -> ViewResultGroupDto(key = key, label = key, count = groupItems.size) }
    }

    private fun matchesIssueFilters(filtersNode: JsonNode, issue: IssueDto, currentUserId: Long, parentIssueIds: Set<Long>): Boolean =
        evaluateFilterNode(filtersNode, currentUserId) { field -> issueFieldValue(issue, field, parentIssueIds) }

    private fun matchesProjectFilters(filtersNode: JsonNode, project: ProjectDto, currentUserId: Long): Boolean =
        evaluateFilterNode(filtersNode, currentUserId) { field -> projectFieldValue(project, field) }

    private fun matchesInitiativeFilters(filtersNode: JsonNode, initiative: InitiativeDto, currentUserId: Long): Boolean =
        evaluateFilterNode(filtersNode, currentUserId) { field -> initiativeFieldValue(initiative, field) }

    private fun evaluateFilterNode(
        node: JsonNode,
        currentUserId: Long,
        fieldResolver: (String) -> Any?
    ): Boolean {
        if (node.isMissingNode || node.isNull || !node.isObject) return true
        val children = node.path("children")
        if (!children.isArray || children.isEmpty) return true
        val operator = node.path("operator").asText("AND").uppercase()
        val results = children.map { child ->
            if (child.path("children").isArray) evaluateFilterNode(child, currentUserId, fieldResolver)
            else evaluateCondition(child, currentUserId, fieldResolver)
        }
        return if (operator == "OR") results.any { it } else results.all { it }
    }

    private fun evaluateCondition(node: JsonNode, currentUserId: Long, fieldResolver: (String) -> Any?): Boolean {
        val field = node.path("field").asText("")
        val operator = node.path("operator").asText("is")
        if (field.isBlank()) return true
        val actual = fieldResolver(field)
        val value = resolveFilterValue(node.get("value"), currentUserId)
        return when (operator) {
            "is" -> valuesEqual(actual, value)
            "isNot" -> !valuesEqual(actual, value)
            "in" -> listContains(value, actual)
            "notIn" -> !listContains(value, actual)
            "contains" -> containsValue(actual, value)
            "notContains" -> !containsValue(actual, value)
            "lt" -> compareValues(actual, value) < 0
            "lte" -> compareValues(actual, value) <= 0
            "gt" -> compareValues(actual, value) > 0
            "gte" -> compareValues(actual, value) >= 0
            "isEmpty" -> isEmptyValue(actual)
            "isNotEmpty" -> !isEmptyValue(actual)
            "between" -> isBetween(actual, value)
            else -> true
        }
    }

    private fun valuesEqual(actual: Any?, expected: Any?): Boolean =
        if (actual is Collection<*>) actual.any { normalizeComparable(it) == normalizeComparable(expected) }
        else normalizeComparable(actual) == normalizeComparable(expected)

    private fun listContains(container: Any?, actual: Any?): Boolean {
        val expectedValues = when (container) {
            is Collection<*> -> container.map(::normalizeComparable)
            else -> listOf(normalizeComparable(container))
        }
        return when (actual) {
            is Collection<*> -> actual.any { normalizeComparable(it) in expectedValues }
            else -> normalizeComparable(actual) in expectedValues
        }
    }

    private fun containsValue(actual: Any?, expected: Any?): Boolean = when (actual) {
        is String -> actual.contains(expected?.toString().orEmpty(), ignoreCase = true)
        is Collection<*> -> actual.any { it?.toString()?.contains(expected?.toString().orEmpty(), ignoreCase = true) == true }
        else -> false
    }

    private fun isEmptyValue(actual: Any?): Boolean = when (actual) {
        null -> true
        is String -> actual.isBlank()
        is Collection<*> -> actual.isEmpty()
        else -> false
    }

    private fun isBetween(actual: Any?, value: Any?): Boolean {
        val range = value as? Collection<*> ?: return false
        val start = range.elementAtOrNull(0)
        val end = range.elementAtOrNull(1)
        return compareValues(actual, start) >= 0 && compareValues(actual, end) <= 0
    }

    private fun compareValues(left: Any?, right: Any?, nulls: String = "last"): Int {
        if (left == null && right == null) return 0
        if (left == null) return if (nulls == "first") -1 else 1
        if (right == null) return if (nulls == "first") 1 else -1
        val normalizedLeft = normalizeComparable(left)
        val normalizedRight = normalizeComparable(right)
        return when {
            normalizedLeft is Long && normalizedRight is Long -> normalizedLeft.compareTo(normalizedRight)
            normalizedLeft is Double && normalizedRight is Double -> normalizedLeft.compareTo(normalizedRight)
            else -> normalizedLeft.toString().compareTo(normalizedRight.toString(), ignoreCase = true)
        }
    }

    private fun normalizeComparable(value: Any?): Any? = when (value) {
        null -> null
        is Int -> value.toLong()
        is Long -> value
        is Float -> value.toDouble()
        is Double -> value
        is Boolean -> value
        is String -> value
        else -> value.toString()
    }

    private fun stringifyValue(value: Any?): String = when (value) {
        null -> "Unassigned"
        is Collection<*> -> value.joinToString(", ") { it?.toString().orEmpty() }.ifBlank { "Unassigned" }
        else -> value.toString()
    }

    private fun issueFieldValue(issue: IssueDto, field: String, parentIssueIds: Set<Long>): Any? = when (field) {
        "identifier" -> issue.identifier
        "title" -> issue.title
        "state" -> issue.state
        "stateCategory" -> issue.stateCategory
        "priority" -> issue.priority
        "assigneeId" -> issue.assigneeId
        "creatorId" -> issue.reporterId
        "projectId" -> issue.projectId
        "teamId" -> issue.teamId
        "labelIds" -> issue.labels.map { it.id }
        "labels" -> issue.labels.map { it.name }
        "createdAt" -> issue.createdAt
        "updatedAt" -> issue.updatedAt
        "completedAt" -> if (issue.stateCategory == "COMPLETED" || issue.stateCategory == "CANCELED") issue.updatedAt else null
        "hasDescription" -> !issue.description.isNullOrBlank()
        "hasSubIssues" -> issue.id in parentIssueIds
        else -> issue.customFields[field]
    }

    private fun projectFieldValue(project: ProjectDto, field: String): Any? = when (field) {
        "name" -> project.name
        "status" -> project.status
        "priority" -> project.priority
        "ownerId" -> project.ownerId
        "teamId" -> project.teamId
        "createdAt" -> project.createdAt
        "updatedAt" -> project.updatedAt
        "targetDate" -> project.targetDate
        "key" -> project.key
        else -> null
    }

    private fun initiativeFieldValue(initiative: InitiativeDto, field: String): Any? = when (field) {
        "name" -> initiative.name
        "slugId" -> initiative.slugId
        "status" -> initiative.status
        "health" -> initiative.health
        "ownerId" -> initiative.ownerId
        "parentInitiativeId" -> initiative.parentInitiativeId
        "targetDate" -> initiative.targetDate
        "createdAt" -> initiative.createdAt
        "updatedAt" -> initiative.updatedAt
        else -> null
    }

    private fun getView(id: Long): View =
        viewRepository.findById(id).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "View not found")
        }

    private fun View.toDto(isFavorite: Boolean, currentUserId: Long): ViewDto = ViewDto(
        id = id,
        organizationId = organizationId,
        resourceType = resourceType,
        scopeType = scopeType,
        scopeId = scopeId,
        ownerUserId = ownerUserId,
        name = name,
        description = description,
        icon = icon,
        color = color,
        isSystem = isSystem,
        systemKey = systemKey,
        visibility = visibility,
        position = position,
        layout = layout,
        queryState = effectiveQueryState(this),
        archivedAt = archivedAt?.toString(),
        createdAt = createdAt.toString(),
        updatedAt = updatedAt.toString(),
        isFavorite = isFavorite,
        isEditable = canEditView(this, currentUserId),
        isDeletable = canDeleteView(this, currentUserId),
        teamId = if (scopeType == SCOPE_TEAM) scopeId else null,
        projectId = if (scopeType == SCOPE_PROJECT) scopeId else null,
        filterJson = filterJson,
        groupBy = groupBy,
        sortJson = sortJson
    )

    private fun favoriteIdsByUser(userId: Long): Set<Long> =
        viewFavoriteRepository.findByUserId(userId).map { it.viewId }.toSet()

    private fun canReadView(view: View, userId: Long, memberships: List<com.cruise.entity.Membership>): Boolean {
        val organizationMember = memberships.any { it.organizationId == view.organizationId }
        if (!organizationMember) return false
        return when (view.visibility) {
            VISIBILITY_PERSONAL -> view.ownerUserId == userId
            VISIBILITY_TEAM -> when (view.scopeType) {
                SCOPE_TEAM -> memberships.any { it.teamId == view.scopeId }
                SCOPE_PROJECT -> {
                    val project = view.scopeId?.let { projectRepository.findById(it).orElse(null) }
                    project?.teamId?.let { teamId -> memberships.any { it.teamId == teamId } } ?: organizationMember
                }
                else -> organizationMember
            }
            else -> organizationMember
        }
    }

    private fun canEditView(view: View, userId: Long): Boolean =
        !view.isSystem && view.ownerUserId == userId && view.archivedAt == null

    private fun canDeleteView(view: View, userId: Long): Boolean =
        !view.isSystem && view.ownerUserId == userId && view.archivedAt == null

    private fun validateOrganizationAccess(organizationId: Long, userId: Long) {
        organizationRepository.findById(organizationId).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "Organization not found")
        }
        membershipRepository.findFirstByUserIdAndOrganizationIdAndActiveTrue(userId, organizationId)
            ?: throw ResponseStatusException(HttpStatus.FORBIDDEN, "Organization not accessible")
    }

    private fun validateScopeAccess(organizationId: Long, scopeType: String, scopeId: Long?, userId: Long) {
        when (scopeType.uppercase()) {
            SCOPE_WORKSPACE -> validateOrganizationAccess(organizationId, userId)
            SCOPE_TEAM -> {
                val membership = membershipRepository.findByUserIdAndActiveTrue(userId)
                    .firstOrNull { it.organizationId == organizationId && it.teamId == scopeId }
                if (membership == null) {
                    throw ResponseStatusException(HttpStatus.FORBIDDEN, "Team not accessible")
                }
            }
            SCOPE_PROJECT -> {
                val project = scopeId?.let { projectRepository.findById(it).orElse(null) }
                    ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found")
                if (project.organizationId != organizationId) {
                    throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Project scope mismatch")
                }
                validateOrganizationAccess(organizationId, userId)
            }
        }
    }

    private fun validateOwnerAccess(organizationId: Long, scopeType: String, scopeId: Long?, ownerUserId: Long?) {
        if (ownerUserId == null) return
        membershipRepository.findFirstByUserIdAndOrganizationIdAndActiveTrue(ownerUserId, organizationId)
            ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Owner not in organization")
        if (scopeType.uppercase() == SCOPE_TEAM) {
            val teamMembership = membershipRepository.findByUserIdAndActiveTrue(ownerUserId)
                .firstOrNull { it.organizationId == organizationId && it.teamId == scopeId }
            if (teamMembership == null) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Owner not in team")
            }
        }
    }

    private fun normalizeVisibility(scopeType: String, requestedVisibility: String?): String {
        val visibility = requestedVisibility?.uppercase() ?: VISIBILITY_PERSONAL
        return when (scopeType.uppercase()) {
            SCOPE_WORKSPACE -> when (visibility) {
                VISIBILITY_PERSONAL, VISIBILITY_WORKSPACE -> visibility
                else -> throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Workspace views only support PERSONAL or WORKSPACE visibility")
            }
            SCOPE_TEAM -> when (visibility) {
                VISIBILITY_PERSONAL, VISIBILITY_TEAM -> visibility
                else -> throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Team views only support PERSONAL or TEAM visibility")
            }
            SCOPE_PROJECT -> when (visibility) {
                VISIBILITY_PERSONAL, VISIBILITY_WORKSPACE -> visibility
                else -> throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Project views only support PERSONAL or WORKSPACE visibility")
            }
            else -> throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported scope type")
        }
    }

    private fun requireCurrentUserId(): Long {
        val principal = SecurityContextHolder.getContext().authentication?.name
            ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required")
        return userRepository.findByUsername(principal)?.id
            ?: userRepository.findByEmail(principal)?.id
            ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found")
    }

    private fun nextPosition(organizationId: Long, resourceType: String, scopeType: String, scopeId: Long?): Int =
        viewRepository.findByOrganizationId(organizationId)
            .asSequence()
            .filter { it.archivedAt == null }
            .filter { it.resourceType == resourceType }
            .filter { it.scopeType == scopeType }
            .filter { it.scopeId == scopeId }
            .maxOfOrNull { it.position }
            ?.plus(1)
            ?: 0

    private fun normalizeResourceType(resourceType: String): String = when (resourceType.uppercase()) {
        RESOURCE_ISSUE, RESOURCE_PROJECT, RESOURCE_INITIATIVE -> resourceType.uppercase()
        else -> throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported resource type")
    }

    private fun normalizeQueryState(queryState: JsonNode?, requestedLayout: String?, resourceType: String): ObjectNode =
        persistedViewQueryStateResolver.normalizeQueryState(queryState, requestedLayout, resourceType)

    private fun serializeQueryState(queryState: JsonNode?): String? =
        queryState?.takeUnless { it.isNull }?.let { objectMapper.writeValueAsString(it) }

    private fun effectiveQueryState(view: View): ObjectNode =
        persistedViewQueryStateResolver.effectiveQueryState(view)

    private fun deriveLegacyFilterJson(queryState: JsonNode?): String? =
        queryState?.path("filters")?.takeIf { it.isObject && it.path("children").isArray && it.path("children").size() > 0 }?.toString()

    private fun deriveLegacyGroupBy(queryState: JsonNode?): String? =
        queryState?.path("grouping")?.path("field")?.takeIf { !it.isMissingNode && !it.isNull && it.asText().isNotBlank() }?.asText()

    private fun deriveLegacySortJson(queryState: JsonNode?): String? =
        queryState?.path("sorting")?.takeIf { it.isArray && it.size() > 0 }?.toString()

    private fun layoutFromQueryState(queryState: JsonNode?): String =
        queryState?.path("display")?.path("layout")?.asText("LIST")?.uppercase() ?: "LIST"

    private fun resolveFilterValue(node: JsonNode?, currentUserId: Long): Any? = when {
        node == null || node.isNull -> null
        node.isArray -> node.map { resolveFilterValue(it, currentUserId) }
        node.isNumber -> node.asLong()
        node.isBoolean -> node.asBoolean()
        node.isTextual -> when (node.asText()) {
            "\$me" -> currentUserId
            IssueService.NO_PRIORITY_FILTER -> null
            else -> node.asText()
        }
        else -> node.toString()
    }

    private fun purgeSystemViews(organizationId: Long) {
        validateOrganizationAccess(organizationId, requireCurrentUserId())
        viewRepository.findByOrganizationId(organizationId)
            .filter { it.isSystem && it.archivedAt == null }
            .forEach { view ->
                viewFavoriteRepository.findByViewId(view.id).forEach(viewFavoriteRepository::delete)
                viewRepository.save(
                    View(
                        id = view.id,
                        organizationId = view.organizationId,
                        resourceType = view.resourceType,
                        scopeType = view.scopeType,
                        scopeId = view.scopeId,
                        ownerUserId = view.ownerUserId,
                        name = view.name,
                        description = view.description,
                        icon = view.icon,
                        color = view.color,
                        filterJson = view.filterJson,
                        groupBy = view.groupBy,
                        sortJson = view.sortJson,
                        queryState = view.queryState,
                        visibility = view.visibility,
                        isSystem = view.isSystem,
                        systemKey = view.systemKey,
                        position = view.position,
                        layout = view.layout,
                        createdAt = view.createdAt,
                        updatedAt = LocalDateTime.now(),
                        archivedAt = LocalDateTime.now()
                    )
                )
            }
    }

    companion object {
        const val RESOURCE_ISSUE = "ISSUE"
        const val RESOURCE_PROJECT = "PROJECT"
        const val RESOURCE_INITIATIVE = "INITIATIVE"

        const val SCOPE_WORKSPACE = "WORKSPACE"
        const val SCOPE_TEAM = "TEAM"
        const val SCOPE_PROJECT = "PROJECT"

        const val VISIBILITY_PERSONAL = "PERSONAL"
        const val VISIBILITY_WORKSPACE = "WORKSPACE"
        const val VISIBILITY_TEAM = "TEAM"
    }
}
