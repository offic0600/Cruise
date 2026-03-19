package com.cruise.service

import com.cruise.entity.Notification
import com.cruise.entity.NotificationPreference
import com.cruise.entity.NotificationSubscription
import com.cruise.repository.NotificationPreferenceRepository
import com.cruise.repository.NotificationRepository
import com.cruise.repository.NotificationSubscriptionRepository
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
    val type: String? = null,
    val category: String? = null,
    val resourceType: String? = null,
    val resourceId: Long? = null,
    val includeArchived: Boolean = false
)

data class NotificationSubscriptionQuery(
    val userId: Long? = null,
    val resourceType: String? = null,
    val resourceId: Long? = null,
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
    val active: Boolean? = null
)

data class UpdateNotificationSubscriptionRequest(
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
    private val notificationPreferenceRepository: NotificationPreferenceRepository
) {
    fun findAll(query: NotificationQuery = NotificationQuery()): List<NotificationDto> =
        notificationRepository.findAll()
            .asSequence()
            .filter { query.userId == null || it.userId == query.userId }
            .filter { query.type == null || it.type == query.type }
            .filter { query.category == null || it.category == query.category }
            .filter { query.resourceType == null || it.resourceType == query.resourceType }
            .filter { query.resourceId == null || it.resourceId == query.resourceId }
            .filter { !query.unreadOnly || it.readAt == null }
            .filter { query.includeArchived || it.archivedAt == null }
            .sortedByDescending { it.id }
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

    fun delete(id: Long) {
        notificationRepository.delete(getNotification(id))
    }

    fun findSubscriptions(query: NotificationSubscriptionQuery = NotificationSubscriptionQuery()): List<NotificationSubscriptionDto> =
        notificationSubscriptionRepository.findAll()
            .asSequence()
            .filter { query.userId == null || it.userId == query.userId }
            .filter { query.resourceType == null || it.resourceType == query.resourceType }
            .filter { query.resourceId == null || it.resourceId == query.resourceId }
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

    private fun getNotification(id: Long): Notification = notificationRepository.findById(id)
        .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found") }

    private fun getSubscription(id: Long): NotificationSubscription = notificationSubscriptionRepository.findById(id)
        .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Notification subscription not found") }

    private fun getPreference(id: Long): NotificationPreference = notificationPreferenceRepository.findById(id)
        .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Notification preference not found") }

    private fun Notification.toDto(): NotificationDto = NotificationDto(
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
        readAt = readAt?.toString(),
        updatedAt = updatedAt.toString(),
        createdAt = createdAt.toString(),
        archivedAt = archivedAt?.toString()
    )

    private fun NotificationSubscription.toDto(): NotificationSubscriptionDto = NotificationSubscriptionDto(
        id = id,
        userId = userId,
        resourceType = resourceType,
        resourceId = resourceId,
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
}
