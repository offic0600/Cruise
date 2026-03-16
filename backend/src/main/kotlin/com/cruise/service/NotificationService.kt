package com.cruise.service

import com.cruise.entity.Notification
import com.cruise.repository.NotificationRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDateTime

data class NotificationDto(
    val id: Long,
    val userId: Long,
    val eventId: Long,
    val type: String,
    val title: String,
    val body: String,
    val readAt: String?,
    val createdAt: String
)

data class NotificationQuery(
    val userId: Long? = null,
    val unreadOnly: Boolean = false,
    val type: String? = null
)

data class CreateNotificationRequest(
    val userId: Long,
    val eventId: Long,
    val type: String? = null,
    val title: String,
    val body: String,
    val readAt: String? = null
)

data class UpdateNotificationRequest(
    val title: String? = null,
    val body: String? = null,
    val readAt: String? = null
)

@Service
class NotificationService(
    private val notificationRepository: NotificationRepository
) {
    fun findAll(query: NotificationQuery = NotificationQuery()): List<NotificationDto> =
        notificationRepository.findAll()
            .asSequence()
            .filter { query.userId == null || it.userId == query.userId }
            .filter { query.type == null || it.type == query.type }
            .filter { !query.unreadOnly || it.readAt == null }
            .sortedByDescending { it.id }
            .map { it.toDto() }
            .toList()

    fun findById(id: Long): NotificationDto = getNotification(id).toDto()

    fun create(request: CreateNotificationRequest): NotificationDto =
        notificationRepository.save(
            Notification(
                userId = request.userId,
                eventId = request.eventId,
                type = request.type ?: "SYSTEM",
                title = request.title,
                body = request.body,
                readAt = request.readAt?.let(LocalDateTime::parse)
            )
        ).toDto()

    fun update(id: Long, request: UpdateNotificationRequest): NotificationDto {
        val notification = getNotification(id)
        return notificationRepository.save(
            Notification(
                id = notification.id,
                userId = notification.userId,
                eventId = notification.eventId,
                type = notification.type,
                title = request.title ?: notification.title,
                body = request.body ?: notification.body,
                readAt = request.readAt?.let(LocalDateTime::parse) ?: notification.readAt,
                createdAt = notification.createdAt
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
                type = notification.type,
                title = notification.title,
                body = notification.body,
                readAt = LocalDateTime.now(),
                createdAt = notification.createdAt
            )
        ).toDto()
    }

    fun delete(id: Long) {
        notificationRepository.delete(getNotification(id))
    }

    private fun getNotification(id: Long): Notification = notificationRepository.findById(id)
        .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found") }

    private fun Notification.toDto(): NotificationDto = NotificationDto(
        id = id,
        userId = userId,
        eventId = eventId,
        type = type,
        title = title,
        body = body,
        readAt = readAt?.toString(),
        createdAt = createdAt.toString()
    )
}
