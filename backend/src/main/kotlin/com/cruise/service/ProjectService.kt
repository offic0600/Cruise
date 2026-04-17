package com.cruise.service

import com.cruise.entity.Project
import com.cruise.entity.ProjectMilestone
import com.cruise.entity.ProjectUpdate
import com.cruise.entity.View
import com.cruise.repository.IssueRepository
import com.cruise.repository.MembershipRepository
import com.cruise.repository.ProjectRepository
import com.cruise.repository.ProjectMilestoneRepository
import com.cruise.repository.ProjectUpdateRepository
import com.cruise.repository.UserRepository
import com.cruise.repository.ViewRepository
import com.fasterxml.jackson.databind.JsonNode
import org.springframework.http.HttpStatus
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDate
import java.time.LocalDateTime

data class ProjectDto(
    val id: Long,
    val organizationId: Long,
    val teamId: Long?,
    val key: String?,
    val name: String,
    val description: String?,
    val status: String,
    val priority: String?,
    val ownerId: Long?,
    val startDate: String?,
    val targetDate: String?,
    val createdAt: String,
    val updatedAt: String,
    val archivedAt: String?
)

data class WorkspaceProjectRowDto(
    val id: Long,
    val key: String?,
    val name: String,
    val description: String?,
    val teamId: Long?,
    val leadUserId: Long?,
    val leadUserName: String?,
    val priority: String?,
    val targetDate: String?,
    val status: String,
    val health: String?,
    val latestUpdateId: Long?,
    val latestUpdateAt: String?,
    val progressPercent: Int,
    val issueCount: Int,
    val completedIssueCount: Int,
    val nextMilestoneId: Long?,
    val nextMilestoneName: String?,
    val createdAt: String,
    val updatedAt: String,
    val archivedAt: String?
)

data class ProjectQuery(
    val organizationId: Long? = null,
    val teamId: Long? = null,
    val status: String? = null,
    val q: String? = null,
    val includeArchived: Boolean = false,
    val page: Int = 0,
    val size: Int = 50
)

data class WorkspaceProjectQuery(
    val organizationId: Long,
    val teamId: Long? = null,
    val q: String? = null,
    val status: String? = null,
    val priority: String? = null,
    val ownerId: Long? = null,
    val health: String? = null,
    val hasMilestone: Boolean? = null,
    val includeArchived: Boolean = false,
    val viewId: Long? = null,
    val page: Int = 0,
    val size: Int = 100
)

data class CreateProjectRequest(
    val organizationId: Long? = null,
    val teamId: Long? = null,
    val key: String? = null,
    val name: String,
    val description: String? = null,
    val status: String? = null,
    val priority: String? = null,
    val ownerId: Long? = null,
    val startDate: String? = null,
    val targetDate: String? = null
)

data class UpdateProjectRequest(
    val teamId: Long? = null,
    val key: String? = null,
    val name: String? = null,
    val description: String? = null,
    val status: String? = null,
    val priority: String? = null,
    val ownerId: Long? = null,
    val startDate: String? = null,
    val targetDate: String? = null
)

@Service
class ProjectService(
    private val projectRepository: ProjectRepository,
    private val projectUpdateRepository: ProjectUpdateRepository,
    private val projectMilestoneRepository: ProjectMilestoneRepository,
    private val issueRepository: IssueRepository,
    private val userRepository: UserRepository,
    private val membershipRepository: MembershipRepository,
    private val viewRepository: ViewRepository,
    private val persistedViewQueryStateResolver: PersistedViewQueryStateResolver
) {
    fun findAll(query: ProjectQuery = ProjectQuery()): RestPageResponse<ProjectDto> =
        findAllMatching(query).toRestPage(query.page, query.size)

    fun findAllMatching(query: ProjectQuery = ProjectQuery()): List<ProjectDto> =
        projectRepository.findAll()
            .asSequence()
            .filter { query.organizationId == null || it.organizationId == query.organizationId }
            .filter { query.teamId == null || it.teamId == query.teamId }
            .filter { query.status == null || it.status == query.status }
            .filter { query.includeArchived || it.archivedAt == null }
            .filter {
                query.q.isNullOrBlank() || listOfNotNull(it.name, it.description, it.key)
                    .any { text -> text.contains(query.q, ignoreCase = true) }
            }
            .sortedBy { it.id }
            .map { it.toDto() }
            .toList()

    fun findById(id: Long): ProjectDto = getProject(id).toDto()

    fun create(request: CreateProjectRequest): ProjectDto =
        projectRepository.save(
            Project(
                organizationId = request.organizationId ?: 1L,
                teamId = request.teamId,
                key = request.key,
                name = request.name,
                description = request.description,
                status = request.status ?: "ACTIVE",
                priority = normalizePriority(request.priority),
                ownerId = request.ownerId,
                startDate = parseDate(request.startDate),
                targetDate = parseDate(request.targetDate),
                archivedAt = null
            )
        ).toDto()

    fun update(id: Long, request: UpdateProjectRequest): ProjectDto {
        val project = getProject(id)
        return projectRepository.save(
            Project(
                id = project.id,
                organizationId = project.organizationId,
                teamId = request.teamId ?: project.teamId,
                key = request.key ?: project.key,
                name = request.name ?: project.name,
                description = request.description ?: project.description,
                status = request.status ?: project.status,
                priority = request.priority ?: project.priority,
                ownerId = request.ownerId ?: project.ownerId,
                startDate = parseDate(request.startDate) ?: project.startDate,
                targetDate = parseDate(request.targetDate) ?: project.targetDate,
                createdAt = project.createdAt,
                updatedAt = LocalDateTime.now(),
                archivedAt = project.archivedAt
            )
        ).toDto()
    }

    fun delete(id: Long) {
        projectRepository.delete(getProject(id))
    }

    fun findWorkspaceProjects(query: WorkspaceProjectQuery): RestPageResponse<WorkspaceProjectRowDto> {
        val view = resolveWorkspaceProjectView(query)
        val baseProjects = projectRepository.findAll()
            .asSequence()
            .filter { it.organizationId == query.organizationId }
            .filter { query.teamId == null || it.teamId == query.teamId }
            .filter { query.includeArchived || it.archivedAt == null }
            .filter {
                query.q.isNullOrBlank() || listOfNotNull(it.name, it.description, it.key)
                    .any { text -> text.contains(query.q, ignoreCase = true) }
            }
            .toList()

        val projectIds = baseProjects.map { it.id }
        val updatesByProject = projectUpdateRepository.findAll()
            .asSequence()
            .filter { it.projectId in projectIds }
            .filter { it.archivedAt == null }
            .groupBy { it.projectId }
        val milestonesByProject = projectMilestoneRepository.findAll()
            .asSequence()
            .filter { it.projectId in projectIds }
            .filter { it.archivedAt == null }
            .groupBy { it.projectId }
        val issuesByProject = issueRepository.findAll()
            .asSequence()
            .filter { it.projectId in projectIds }
            .filter { it.archivedAt == null }
            .groupBy { it.projectId }
        val userNamesById = userRepository.findAllById(baseProjects.mapNotNull { it.ownerId }.distinct())
            .associate { user -> user.id to (user.displayName ?: user.username ?: user.email ?: "User #${user.id}") }

        var rows = baseProjects.map { project ->
            val latestUpdate = updatesByProject[project.id]
                ?.maxWithOrNull(compareBy<ProjectUpdate> { it.updatedAt }.thenBy { it.id })
            val nextMilestone = milestonesByProject[project.id]
                ?.filter { !it.status.equals("completed", ignoreCase = true) && !it.status.equals("done", ignoreCase = true) }
                ?.minWithOrNull(compareBy<ProjectMilestone>({ it.targetDate ?: LocalDate.MAX }, { it.sortOrder }, { it.id }))
                ?: milestonesByProject[project.id]
                    ?.minWithOrNull(compareBy<ProjectMilestone>({ it.targetDate ?: LocalDate.MAX }, { it.sortOrder }, { it.id }))
            val issues = issuesByProject[project.id].orEmpty()
            val completedIssueCount = issues.count { issue -> issue.state == "DONE" || issue.state == "CANCELED" }
            val issueCount = issues.size
            WorkspaceProjectRowDto(
                id = project.id,
                key = project.key,
                name = project.name,
                description = project.description,
                teamId = project.teamId,
                leadUserId = project.ownerId,
                leadUserName = project.ownerId?.let { userNamesById[it] },
                priority = project.priority,
                targetDate = project.targetDate?.toString(),
                status = project.status,
                health = latestUpdate?.health,
                latestUpdateId = latestUpdate?.id,
                latestUpdateAt = latestUpdate?.updatedAt?.toString(),
                progressPercent = if (issueCount == 0) 0 else ((completedIssueCount * 100.0) / issueCount).toInt(),
                issueCount = issueCount,
                completedIssueCount = completedIssueCount,
                nextMilestoneId = nextMilestone?.id,
                nextMilestoneName = nextMilestone?.name,
                createdAt = project.createdAt.toString(),
                updatedAt = project.updatedAt.toString(),
                archivedAt = project.archivedAt?.toString()
            )
        }.sortedWith(compareBy<WorkspaceProjectRowDto> { it.name.lowercase() }.thenBy { it.id })

        rows = applyWorkspaceProjectFilters(rows, query)
        rows = applyWorkspaceProjectView(rows, view)
        rows = applyWorkspaceProjectSorting(rows, view)

        val page = query.page.coerceAtLeast(0)
        val size = query.size.coerceAtLeast(1)
        val start = (page * size).coerceAtMost(rows.size)
        val end = (start + size).coerceAtMost(rows.size)
        val paged = rows.subList(start, end)

        return RestPageResponse(
            items = paged,
            pageInfo = RestPageInfo(
                nextCursor = if (end < rows.size) (page + 1).toString() else null,
                prevCursor = if (page > 0) (page - 1).toString() else null,
                hasNextPage = end < rows.size,
                hasPreviousPage = page > 0
            ),
            totalCount = rows.size
        )
    }

    private fun getProject(id: Long): Project = projectRepository.findById(id)
        .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found") }

    private fun Project.toDto(): ProjectDto = ProjectDto(
        id = id,
        organizationId = organizationId,
        teamId = teamId,
        key = key,
        name = name,
        description = description,
        status = status,
        priority = priority,
        ownerId = ownerId,
        startDate = startDate?.toString(),
        targetDate = targetDate?.toString(),
        createdAt = createdAt.toString(),
        updatedAt = updatedAt.toString(),
        archivedAt = archivedAt?.toString()
    )

    private fun parseDate(value: String?): LocalDate? = value?.let(LocalDate::parse)

    private fun normalizePriority(value: String?): String? = value?.uppercase()

    private fun applyWorkspaceProjectFilters(
        items: List<WorkspaceProjectRowDto>,
        query: WorkspaceProjectQuery
    ): List<WorkspaceProjectRowDto> = items
        .asSequence()
        .filter { query.status == null || it.status == query.status }
        .filter { query.priority == null || (query.priority == NO_PRIORITY_FILTER && it.priority == null) || it.priority == query.priority }
        .filter { query.ownerId == null || it.leadUserId == query.ownerId }
        .filter { query.health == null || (query.health == NO_HEALTH_FILTER && it.health == null) || it.health == query.health }
        .filter { query.hasMilestone == null || (query.hasMilestone && it.nextMilestoneId != null) || (!query.hasMilestone && it.nextMilestoneId == null) }
        .toList()

    private fun applyWorkspaceProjectView(items: List<WorkspaceProjectRowDto>, view: View?): List<WorkspaceProjectRowDto> {
        if (view == null) return items
        val queryState = persistedViewQueryStateResolver.effectiveQueryState(view)
        val filtersNode = queryState.path("filters")
        return items.filter { evaluateProjectFilterNode(filtersNode) { field -> projectFieldValue(it, field) } }
    }

    private fun applyWorkspaceProjectSorting(items: List<WorkspaceProjectRowDto>, view: View?): List<WorkspaceProjectRowDto> {
        if (view == null) {
            return items.sortedWith(compareBy<WorkspaceProjectRowDto> { it.name.lowercase() }.thenBy { it.id })
        }
        val queryState = persistedViewQueryStateResolver.effectiveQueryState(view)
        val sortingNode = queryState.path("sorting")
        if (!sortingNode.isArray) {
            return items
        }
        if (sortingNode.isEmpty) {
            return items
        }
        val rules = sortingNode.filter { it.isObject }
        val comparator = Comparator<WorkspaceProjectRowDto> { left, right ->
            for (rule in rules) {
                val field = rule.path("field").asText("")
                if (field.isBlank()) continue
                val direction = rule.path("direction").asText("asc")
                val nulls = rule.path("nulls").asText("last")
                val comparison = compareValues(projectFieldValue(left, field), projectFieldValue(right, field), nulls)
                if (comparison != 0) {
                    return@Comparator if (direction.equals("desc", ignoreCase = true)) -comparison else comparison
                }
            }
            compareValues(left.name, right.name, "last").takeIf { it != 0 } ?: compareValues(left.id, right.id, "last")
        }
        return items.sortedWith(comparator)
    }

    private fun resolveWorkspaceProjectView(query: WorkspaceProjectQuery): View? {
        val viewId = query.viewId ?: return null
        val userId = requireCurrentUserId()
        val memberships = membershipRepository.findByUserIdAndActiveTrue(userId)
        val view = viewRepository.findById(viewId).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "View not found")
        }
        if (view.resourceType != "PROJECT" || view.archivedAt != null || view.organizationId != query.organizationId) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "View not found")
        }
        if (!canReadView(view, userId, memberships)) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "View not accessible")
        }
        return view
    }

    private fun canReadView(view: View, userId: Long, memberships: List<com.cruise.entity.Membership>): Boolean {
        val organizationMember = memberships.any { it.organizationId == view.organizationId }
        if (!organizationMember) return false
        return when (view.visibility) {
            "PERSONAL" -> view.ownerUserId == userId
            "TEAM" -> when (view.scopeType) {
                "TEAM" -> memberships.any { it.teamId == view.scopeId }
                "PROJECT" -> {
                    val project = view.scopeId?.let { projectRepository.findById(it).orElse(null) }
                    project?.teamId?.let { teamId -> memberships.any { it.teamId == teamId } } ?: organizationMember
                }
                else -> organizationMember
            }
            else -> organizationMember
        }
    }

    private fun requireCurrentUserId(): Long {
        val principal = SecurityContextHolder.getContext().authentication?.name
            ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required")
        return userRepository.findByUsername(principal)?.id
            ?: userRepository.findByEmail(principal)?.id
            ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found")
    }

    private fun projectFieldValue(project: WorkspaceProjectRowDto, field: String): Any? = when (field) {
        "name" -> project.name
        "status" -> project.status
        "ownerId", "leadUserId" -> project.leadUserId
        "teamId" -> project.teamId
        "createdAt" -> project.createdAt
        "updatedAt" -> project.updatedAt
        "targetDate" -> project.targetDate
        "key" -> project.key
        "priority" -> project.priority
        "health" -> project.health
        "progress", "progressPercent" -> project.progressPercent
        "description" -> project.description
        "milestone", "nextMilestoneId" -> project.nextMilestoneId
        else -> null
    }

    private fun evaluateProjectFilterNode(node: JsonNode?, fieldResolver: (String) -> Any?): Boolean {
        if (node == null || node.isNull || node.isMissingNode) return true
        if (!node.isObject) return true
        val children = node.path("children")
        if (!children.isArray || children.isEmpty) return true
        val operator = node.path("operator").asText("AND").uppercase()
        val results = children.map { child ->
            if (child.path("children").isArray) evaluateProjectFilterNode(child, fieldResolver)
            else evaluateProjectCondition(child, fieldResolver)
        }
        return if (operator == "OR") results.any { it } else results.all { it }
    }

    private fun evaluateProjectCondition(node: JsonNode, fieldResolver: (String) -> Any?): Boolean {
        val field = node.path("field").asText("")
        if (field.isBlank()) return true
        val operator = node.path("operator").asText("is")
        val actual = fieldResolver(field)
        val expected = resolveProjectFilterValue(node.get("value"))
        return when (operator) {
            "is" -> valuesEqual(actual, expected)
            "isNot" -> !valuesEqual(actual, expected)
            "in" -> listContains(expected, actual)
            "notIn" -> !listContains(expected, actual)
            "contains" -> containsValue(actual, expected)
            "notContains" -> !containsValue(actual, expected)
            "isEmpty" -> isEmptyValue(actual)
            "isNotEmpty" -> !isEmptyValue(actual)
            else -> true
        }
    }

    private fun resolveProjectFilterValue(node: JsonNode?): Any? = when {
        node == null || node.isNull -> null
        node.isArray -> node.map(::resolveProjectFilterValue)
        node.isNumber -> node.asLong()
        node.isBoolean -> node.asBoolean()
        node.isTextual -> when (node.asText()) {
            NO_PRIORITY_FILTER -> null
            else -> node.asText()
        }
        else -> node.toString()
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

    private fun compareValues(left: Any?, right: Any?, nulls: String = "last"): Int {
        if (left == null && right == null) return 0
        if (left == null) return if (nulls.equals("first", ignoreCase = true)) -1 else 1
        if (right == null) return if (nulls.equals("first", ignoreCase = true)) 1 else -1
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

    companion object {
        const val NO_PRIORITY_FILTER = "NO_PRIORITY"
        const val NO_HEALTH_FILTER = "NO_UPDATES"
    }
}
