package com.cruise.service

import com.cruise.entity.Notification
import com.cruise.entity.NotificationPreference
import com.cruise.entity.NotificationSubscription
import com.cruise.repository.NotificationPreferenceRepository
import com.cruise.repository.NotificationRepository
import com.cruise.repository.NotificationSubscriptionRepository
import com.cruise.repository.InitiativeRepository
import com.cruise.repository.IssueRepository
import com.cruise.repository.ProjectRepository
import com.cruise.repository.UserRepository
import com.cruise.repository.ViewRepository
import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDateTime

data class NotificationDto(
    val id: Long,
    val userId: Long,
    val eventId: Long,
    val actorId: Long?,
    val type: String,
    val category: String,
    val resourceType: String?,
    val resourceId: Long?,
    val title: String,
    val body: String,
    val payloadJson: String?,
    val payload: Map<String, Any?>?,
    val eventKey: String?,
    val actorName: String?,
    val actorAvatarUrl: String?,
    val resourceTitle: String?,
    val readAt: String?,
    val updatedAt: String,
    val createdAt: String,
    val archivedAt: String?
)

data class NotificationSubscriptionDto(
    val id: Long,
    val userId: Long,
    val resourceType: String,
    val resourceId: Long,
    val eventKey: String?,
    val active: Boolean,
    val createdAt: String,
    val updatedAt: String,
    val archivedAt: String?
)

data class NotificationPreferenceDto(
    val id: Long,
    val userId: Long,
    val category: String,
    val channel: String,
    val enabled: Boolean,
    val createdAt: String,
    val updatedAt: String
)

data class NotificationQuery(
    val userId: Long? = null,
    val unreadOnly: Boolean = false,
    val actorId: Long? = null,
    val type: String? = null,
    val category: String? = null,
    val eventKey: String? = null,
    val resourceType: String? = null,
    val resourceId: Long? = null,
    val includeArchived: Boolean = false
)

data class NotificationSubscriptionQuery(
    val userId: Long? = null,
    val resourceType: String? = null,
    val resourceId: Long? = null,
    val eventKey: String? = null,
    val active: Boolean? = null,
    val includeArchived: Boolean = false
)

data class NotificationPreferenceQuery(
    val userId: Long? = null,
    val category: String? = null,
    val channel: String? = null
)

data class CreateNotificationRequest(
    val userId: Long,
    val eventId: Long,
    val actorId: Long? = null,
    val type: String? = null,
    val category: String? = null,
    val resourceType: String? = null,
    val resourceId: Long? = null,
    val title: String,
    val body: String,
    val payloadJson: String? = null,
    val readAt: String? = null
)

data class UpdateNotificationRequest(
    val actorId: Long? = null,
    val type: String? = null,
    val category: String? = null,
    val resourceType: String? = null,
    val resourceId: Long? = null,
    val title: String? = null,
    val body: String? = null,
    val payloadJson: String? = null,
    val readAt: String? = null,
    val archivedAt: String? = null
)

data class CreateNotificationSubscriptionRequest(
    val userId: Long,
    val resourceType: String,
    val resourceId: Long,
    val eventKey: String? = null,
    val active: Boolean? = null
)

data class UpdateNotificationSubscriptionRequest(
    val eventKey: String? = null,
    val active: Boolean? = null,
    val archivedAt: String? = null
)

data class CreateNotificationPreferenceRequest(
    val userId: Long,
    val category: String,
    val channel: String? = null,
    val enabled: Boolean? = null
)

data class UpdateNotificationPreferenceRequest(
    val enabled: Boolean? = null
)

@Service
class NotificationService(
    private val notificationRepository: NotificationRepository,
    private val notificationSubscriptionRepository: NotificationSubscriptionRepository,
    private val notificationPreferenceRepository: NotificationPreferenceRepository,
    private val userRepository: UserRepository,
    private val viewRepository: ViewRepository,
    private val projectRepository: ProjectRepository,
    private val issueRepository: IssueRepository,
    private val initiativeRepository: InitiativeRepository,
    private val objectMapper: ObjectMapper
) {
    fun findAll(query: NotificationQuery = NotificationQuery()): List<NotificationDto> =
        notificationRepository.findAll()
            .asSequence()
            .filter { query.userId == null || it.userId == query.userId }
            .filter { query.actorId == null || it.actorId == query.actorId }
            .filter { query.type == null || it.type == query.type }
            .filter { query.category == null || it.category == query.category }
            .filter { query.resourceType == null || it.resourceType == query.resourceType }
            .filter { query.resourceId == null || it.resourceId == query.resourceId }
            .filter { !query.unreadOnly || it.readAt == null }
            .filter { query.eventKey == null || extractEventKey(it.payloadJson) == query.eventKey }
            .filter { query.includeArchived || it.archivedAt == null }
            .sortedByDescending { it.createdAt }
            .map { it.toDto() }
            .toList()

    fun findById(id: Long): NotificationDto = getNotification(id).toDto()

    fun create(request: CreateNotificationRequest): NotificationDto =
        notificationRepository.save(
            Notification(
                userId = request.userId,
                eventId = request.eventId,
                actorId = request.actorId,
                type = request.type ?: "SYSTEM",
                category = request.category ?: "system",
                resourceType = request.resourceType,
                resourceId = request.resourceId,
                title = request.title,
                body = request.body,
                payloadJson = request.payloadJson,
                readAt = parseDateTime(request.readAt)
            )
        ).toDto()

    fun update(id: Long, request: UpdateNotificationRequest): NotificationDto {
        val notification = getNotification(id)
        return notificationRepository.save(
            Notification(
                id = notification.id,
                userId = notification.userId,
                eventId = notification.eventId,
                actorId = request.actorId ?: notification.actorId,
                type = request.type ?: notification.type,
                category = request.category ?: notification.category,
                resourceType = request.resourceType ?: notification.resourceType,
                resourceId = request.resourceId ?: notification.resourceId,
                title = request.title ?: notification.title,
                body = request.body ?: notification.body,
                payloadJson = request.payloadJson ?: notification.payloadJson,
                readAt = parseDateTime(request.readAt) ?: notification.readAt,
                updatedAt = LocalDateTime.now(),
                createdAt = notification.createdAt,
                archivedAt = parseDateTime(request.archivedAt) ?: notification.archivedAt
            )
        ).toDto()
    }

    fun markRead(id: Long): NotificationDto {
        val notification = getNotification(id)
        return notificationRepository.save(
            Notification(
                id = notification.id,
                userId = notification.userId,
                eventId = notification.eventId,
                actorId = notification.actorId,
                type = notification.type,
                category = notification.category,
                resourceType = notification.resourceType,
                resourceId = notification.resourceId,
                title = notification.title,
                body = notification.body,
                payloadJson = notification.payloadJson,
                readAt = LocalDateTime.now(),
                updatedAt = LocalDateTime.now(),
                createdAt = notification.createdAt,
                archivedAt = notification.archivedAt
            )
        ).toDto()
    }

    fun archive(id: Long): NotificationDto {
        val notification = getNotification(id)
        val now = LocalDateTime.now()
        return notificationRepository.save(
            Notification(
                id = notification.id,
                userId = notification.userId,
                eventId = notification.eventId,
                actorId = notification.actorId,
                type = notification.type,
                category = notification.category,
                resourceType = notification.resourceType,
                resourceId = notification.resourceId,
                title = notification.title,
                body = notification.body,
                payloadJson = notification.payloadJson,
                readAt = notification.readAt,
                updatedAt = now,
                createdAt = notification.createdAt,
                archivedAt = now
            )
        ).toDto()
    }

    fun delete(id: Long) {
        notificationRepository.delete(getNotification(id))
    }

    fun findSubscriptions(query: NotificationSubscriptionQuery = NotificationSubscriptionQuery()): List<NotificationSubscriptionDto> =
        notificationSubscriptionRepository.findAll()
            .asSequence()
            .filter { query.userId == null || it.userId == query.userId }
            .filter { query.resourceType == null || it.resourceType == query.resourceType }
            .filter { query.resourceId == null || it.resourceId == query.resourceId }
            .filter { query.eventKey == null || it.eventKey == query.eventKey }
            .filter { query.active == null || it.active == query.active }
            .filter { query.includeArchived || it.archivedAt == null }
            .sortedByDescending { it.id }
            .map { it.toDto() }
            .toList()

    fun findSubscriptionById(id: Long): NotificationSubscriptionDto = getSubscription(id).toDto()

    fun createSubscription(request: CreateNotificationSubscriptionRequest): NotificationSubscriptionDto =
        notificationSubscriptionRepository.save(
            NotificationSubscription(
                userId = request.userId,
                resourceType = request.resourceType,
                resourceId = request.resourceId,
                eventKey = request.eventKey,
                active = request.active ?: true
            )
        ).toDto()

    fun updateSubscription(id: Long, request: UpdateNotificationSubscriptionRequest): NotificationSubscriptionDto {
        val subscription = getSubscription(id)
        return notificationSubscriptionRepository.save(
            NotificationSubscription(
                id = subscription.id,
                userId = subscription.userId,
                resourceType = subscription.resourceType,
                resourceId = subscription.resourceId,
                eventKey = request.eventKey ?: subscription.eventKey,
                active = request.active ?: subscription.active,
                createdAt = subscription.createdAt,
                updatedAt = LocalDateTime.now(),
                archivedAt = parseDateTime(request.archivedAt) ?: subscription.archivedAt
            )
        ).toDto()
    }

    fun deleteSubscription(id: Long) {
        notificationSubscriptionRepository.delete(getSubscription(id))
    }

    fun findPreferences(query: NotificationPreferenceQuery = NotificationPreferenceQuery()): List<NotificationPreferenceDto> =
        notificationPreferenceRepository.findAll()
            .asSequence()
            .filter { query.userId == null || it.userId == query.userId }
            .filter { query.category == null || it.category == query.category }
            .filter { query.channel == null || it.channel == query.channel }
            .sortedByDescending { it.id }
            .map { it.toDto() }
            .toList()

    fun findPreferenceById(id: Long): NotificationPreferenceDto = getPreference(id).toDto()

    fun createPreference(request: CreateNotificationPreferenceRequest): NotificationPreferenceDto =
        notificationPreferenceRepository.save(
            NotificationPreference(
                userId = request.userId,
                category = request.category,
                channel = request.channel ?: "in_app",
                enabled = request.enabled ?: true
            )
        ).toDto()

    fun updatePreference(id: Long, request: UpdateNotificationPreferenceRequest): NotificationPreferenceDto {
        val preference = getPreference(id)
        return notificationPreferenceRepository.save(
            NotificationPreference(
                id = preference.id,
                userId = preference.userId,
                category = preference.category,
                channel = preference.channel,
                enabled = request.enabled ?: preference.enabled,
                createdAt = preference.createdAt,
                updatedAt = LocalDateTime.now()
            )
        ).toDto()
    }

    fun deletePreference(id: Long) {
        notificationPreferenceRepository.delete(getPreference(id))
    }

    fun notifyIssueAddedToMatchingViews(issue: IssueDto, actorId: Long?) {
        notifyMatchingIssueViewSubscriptions(
            issue = issue,
            actorId = actorId,
            eventKey = VIEW_EVENT_ISSUE_ADDED,
            titleBuilder = { viewName -> "${issue.identifier} was added to $viewName" },
            bodyBuilder = { issue.title }
        )
    }

    fun notifyIssueCompletedOrCanceledInMatchingViews(issue: IssueDto, actorId: Long?) {
        notifyMatchingIssueViewSubscriptions(
            issue = issue,
            actorId = actorId,
            eventKey = VIEW_EVENT_ISSUE_COMPLETED_OR_CANCELED,
            titleBuilder = { viewName -> "${issue.identifier} changed status in $viewName" },
            bodyBuilder = { "${displayIssueState(issue.state)} · ${issue.title}" }
        )
    }

    fun notifyProjectUpdated(projectId: Long, updateId: Long?, updateTitle: String, actorId: Long?) {
        val project = projectRepository.findById(projectId).orElse(null) ?: return
        notifyResourceSubscribers(
            resourceType = "PROJECT",
            resourceId = projectId,
            eventKey = PROJECT_EVENT_UPDATED,
            actorId = actorId,
            eventId = updateId ?: projectId,
            type = "SYSTEM",
            category = "project",
            title = "${project.name} received an update",
            body = updateTitle,
            payload = mapOf(
                "eventKey" to PROJECT_EVENT_UPDATED,
                "projectId" to projectId,
                "projectName" to project.name,
                "projectUpdateId" to updateId
            )
        )
    }

    fun notifyProjectMilestoneAdded(projectId: Long, milestoneId: Long?, milestoneName: String, actorId: Long?) {
        val project = projectRepository.findById(projectId).orElse(null) ?: return
        notifyResourceSubscribers(
            resourceType = "PROJECT",
            resourceId = projectId,
            eventKey = PROJECT_EVENT_MILESTONE_ADDED,
            actorId = actorId,
            eventId = milestoneId ?: projectId,
            type = "SYSTEM",
            category = "project",
            title = "Milestone added to ${project.name}",
            body = milestoneName,
            payload = mapOf(
                "eventKey" to PROJECT_EVENT_MILESTONE_ADDED,
                "projectId" to projectId,
                "projectName" to project.name,
                "milestoneId" to milestoneId,
                "milestoneName" to milestoneName
            )
        )
    }

    private fun getNotification(id: Long): Notification = notificationRepository.findById(id)
        .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found") }

    private fun getSubscription(id: Long): NotificationSubscription = notificationSubscriptionRepository.findById(id)
        .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Notification subscription not found") }

    private fun getPreference(id: Long): NotificationPreference = notificationPreferenceRepository.findById(id)
        .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Notification preference not found") }

    private fun Notification.toDto(): NotificationDto {
        val payload = payloadJson?.let(::deserializePayload)
        val actor = actorId?.let { userRepository.findById(it).orElse(null) }
        return NotificationDto(
            id = id,
            userId = userId,
            eventId = eventId,
            actorId = actorId,
            type = type,
            category = category,
            resourceType = resourceType,
            resourceId = resourceId,
            title = title,
            body = body,
            payloadJson = payloadJson,
            payload = payload,
            eventKey = extractEventKey(payload),
            actorName = actor?.displayName ?: actor?.username ?: actor?.email,
            actorAvatarUrl = actor?.avatarUrl,
            resourceTitle = resolveResourceTitle(resourceType, resourceId, payload),
            readAt = readAt?.toString(),
            updatedAt = updatedAt.toString(),
            createdAt = createdAt.toString(),
            archivedAt = archivedAt?.toString()
        )
    }

    private fun NotificationSubscription.toDto(): NotificationSubscriptionDto = NotificationSubscriptionDto(
        id = id,
        userId = userId,
        resourceType = resourceType,
        resourceId = resourceId,
        eventKey = eventKey,
        active = active,
        createdAt = createdAt.toString(),
        updatedAt = updatedAt.toString(),
        archivedAt = archivedAt?.toString()
    )

    private fun NotificationPreference.toDto(): NotificationPreferenceDto = NotificationPreferenceDto(
        id = id,
        userId = userId,
        category = category,
        channel = channel,
        enabled = enabled,
        createdAt = createdAt.toString(),
        updatedAt = updatedAt.toString()
    )

    private fun parseDateTime(value: String?): LocalDateTime? =
        value?.takeIf(String::isNotBlank)?.let(LocalDateTime::parse)

    private fun notifyMatchingIssueViewSubscriptions(
        issue: IssueDto,
        actorId: Long?,
        eventKey: String,
        titleBuilder: (String) -> String,
        bodyBuilder: () -> String
    ) {
        val hasSubIssues = issueRepository.findAll().any { it.parentIssueId == issue.id && it.archivedAt == null }
        notificationSubscriptionRepository.findAll()
            .asSequence()
            .filter { it.active && it.archivedAt == null }
            .filter { it.resourceType == "VIEW" && it.eventKey == eventKey }
            .forEach { subscription ->
                val view = viewRepository.findById(subscription.resourceId).orElse(null) ?: return@forEach
                if (view.archivedAt != null || view.resourceType != "ISSUE") return@forEach
                if (view.organizationId != issue.organizationId) return@forEach
                if (view.scopeType == "TEAM" && view.scopeId != issue.teamId) return@forEach
                if (view.scopeType == "PROJECT" && view.scopeId != issue.projectId) return@forEach
                if (!issueMatchesView(issue, hasSubIssues, view.queryState, subscription.userId)) return@forEach
                create(
                    CreateNotificationRequest(
                        userId = subscription.userId,
                        eventId = issue.id,
                        actorId = actorId,
                        type = "SYSTEM",
                        category = "view",
                        resourceType = "VIEW",
                        resourceId = view.id,
                        title = titleBuilder(view.name),
                        body = bodyBuilder(),
                        payloadJson = serializePayload(
                            mapOf(
                                "eventKey" to eventKey,
                                "issueId" to issue.id,
                                "issueIdentifier" to issue.identifier,
                                "issueTitle" to issue.title,
                                "viewId" to view.id,
                                "viewName" to view.name,
                                "viewResourceType" to view.resourceType
                            )
                        )
                    )
                )
            }
    }

    private fun notifyResourceSubscribers(
        resourceType: String,
        resourceId: Long,
        eventKey: String,
        actorId: Long?,
        eventId: Long,
        type: String,
        category: String,
        title: String,
        body: String,
        payload: Map<String, Any?>
    ) {
        notificationSubscriptionRepository.findAll()
            .asSequence()
            .filter { it.active && it.archivedAt == null }
            .filter { it.resourceType == resourceType && it.resourceId == resourceId && it.eventKey == eventKey }
            .forEach { subscription ->
                create(
                    CreateNotificationRequest(
                        userId = subscription.userId,
                        eventId = eventId,
                        actorId = actorId,
                        type = type,
                        category = category,
                        resourceType = resourceType,
                        resourceId = resourceId,
                        title = title,
                        body = body,
                        payloadJson = serializePayload(payload)
                    )
                )
            }
    }

    private fun issueMatchesView(issue: IssueDto, hasSubIssues: Boolean, queryStateRaw: String?, currentUserId: Long): Boolean {
        val queryState = queryStateRaw?.takeIf { it.isNotBlank() }?.let { objectMapper.readTree(it) } ?: return true
        return evaluateIssueFilterNode(queryState.path("filters"), issue, hasSubIssues, currentUserId)
    }

    private fun evaluateIssueFilterNode(node: JsonNode, issue: IssueDto, hasSubIssues: Boolean, currentUserId: Long): Boolean {
        if (node.isMissingNode || node.isNull || !node.isObject) return true
        val children = node.path("children")
        if (!children.isArray || children.isEmpty) return true
        val operator = node.path("operator").asText("AND").uppercase()
        val results = children.map { child ->
            if (child.path("children").isArray) evaluateIssueFilterNode(child, issue, hasSubIssues, currentUserId)
            else evaluateIssueCondition(child, issue, hasSubIssues, currentUserId)
        }
        return if (operator == "OR") results.any { it } else results.all { it }
    }

    private fun evaluateIssueCondition(node: JsonNode, issue: IssueDto, hasSubIssues: Boolean, currentUserId: Long): Boolean {
        val field = node.path("field").asText("")
        val operator = node.path("operator").asText("is")
        if (field.isBlank()) return true
        val actual = issueFieldValue(issue, field, hasSubIssues)
        val value = resolveIssueFilterValue(node.get("value"), currentUserId)
        return when (operator) {
            "is" -> valuesEqual(actual, value)
            "isNot" -> !valuesEqual(actual, value)
            "in" -> listContains(value, actual)
            "notIn" -> !listContains(value, actual)
            "contains" -> containsValue(actual, value)
            "notContains" -> !containsValue(actual, value)
            "isEmpty" -> isEmptyValue(actual)
            "isNotEmpty" -> !isEmptyValue(actual)
            else -> true
        }
    }

    private fun issueFieldValue(issue: IssueDto, field: String, hasSubIssues: Boolean): Any? = when (field) {
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
        "hasSubIssues" -> hasSubIssues
        else -> issue.customFields[field]
    }

    private fun resolveIssueFilterValue(node: JsonNode?, currentUserId: Long): Any? = when {
        node == null || node.isNull -> null
        node.isArray -> node.map { resolveIssueFilterValue(it, currentUserId) }
        node.isNumber -> node.asLong()
        node.isBoolean -> node.asBoolean()
        node.isTextual -> when (node.asText()) {
            "\$me" -> currentUserId
            IssueService.NO_PRIORITY_FILTER -> null
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

    private fun resolveResourceTitle(resourceType: String?, resourceId: Long?, payload: Map<String, Any?>?): String? {
        if (resourceType == null || resourceId == null) return null
        return when (resourceType) {
            "VIEW" -> payload?.get("viewName")?.toString() ?: viewRepository.findById(resourceId).orElse(null)?.name
            "PROJECT" -> payload?.get("projectName")?.toString() ?: projectRepository.findById(resourceId).orElse(null)?.name
            "ISSUE" -> issueRepository.findById(resourceId).orElse(null)?.let { "${it.identifier} · ${it.title}" }
            "INITIATIVE" -> initiativeRepository.findById(resourceId).orElse(null)?.name
            else -> null
        }
    }

    private fun extractEventKey(payloadJson: String?): String? =
        payloadJson?.let(::deserializePayload)?.let(::extractEventKey)

    private fun extractEventKey(payload: Map<String, Any?>?): String? =
        payload?.get("eventKey")?.toString()

    private fun deserializePayload(payloadJson: String): Map<String, Any?> =
        objectMapper.readValue(payloadJson, object : TypeReference<Map<String, Any?>>() {})

    private fun serializePayload(payload: Map<String, Any?>): String =
        objectMapper.writeValueAsString(payload)

    private fun displayIssueState(state: String): String = when (state) {
        "BACKLOG" -> "Backlog"
        "TODO" -> "Todo"
        "IN_PROGRESS" -> "In Progress"
        "IN_REVIEW" -> "In Review"
        "DONE" -> "Done"
        "CANCELED" -> "Canceled"
        else -> state
    }

    companion object {
        const val VIEW_EVENT_ISSUE_ADDED = "ISSUE_ADDED"
        const val VIEW_EVENT_ISSUE_COMPLETED_OR_CANCELED = "ISSUE_COMPLETED_OR_CANCELED"
        const val PROJECT_EVENT_UPDATED = "PROJECT_UPDATED"
        const val PROJECT_EVENT_MILESTONE_ADDED = "PROJECT_MILESTONE_ADDED"
    }
}
