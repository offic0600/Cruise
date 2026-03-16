package com.cruise.service

import com.cruise.entity.ActivityEvent
import com.cruise.repository.ActivityEventRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDateTime

data class ActivityEventDto(
    val id: Long,
    val actorId: Long?,
    val entityType: String,
    val entityId: Long,
    val actionType: String,
    val summary: String,
    val payloadJson: String?,
    val createdAt: String
)

data class ActivityEventQuery(
    val actorId: Long? = null,
    val entityType: String? = null,
    val entityId: Long? = null,
    val actionType: String? = null
)

data class CreateActivityEventRequest(
    val actorId: Long? = null,
    val entityType: String,
    val entityId: Long,
    val actionType: String,
    val summary: String,
    val payloadJson: String? = null
)

data class UpdateActivityEventRequest(
    val summary: String? = null,
    val payloadJson: String? = null
)

@Service
class ActivityEventService(
    private val activityEventRepository: ActivityEventRepository
) {
    fun findAll(query: ActivityEventQuery = ActivityEventQuery()): List<ActivityEventDto> =
        activityEventRepository.findAll()
            .asSequence()
            .filter { query.actorId == null || it.actorId == query.actorId }
            .filter { query.entityType == null || it.entityType == query.entityType }
            .filter { query.entityId == null || it.entityId == query.entityId }
            .filter { query.actionType == null || it.actionType == query.actionType }
            .sortedByDescending { it.id }
            .map { it.toDto() }
            .toList()

    fun findById(id: Long): ActivityEventDto = getEvent(id).toDto()

    fun create(request: CreateActivityEventRequest): ActivityEventDto =
        activityEventRepository.save(
            ActivityEvent(
                actorId = request.actorId,
                entityType = request.entityType,
                entityId = request.entityId,
                actionType = request.actionType,
                summary = request.summary,
                payloadJson = request.payloadJson
            )
        ).toDto()

    fun update(id: Long, request: UpdateActivityEventRequest): ActivityEventDto {
        val event = getEvent(id)
        return activityEventRepository.save(
            ActivityEvent(
                id = event.id,
                actorId = event.actorId,
                entityType = event.entityType,
                entityId = event.entityId,
                actionType = event.actionType,
                summary = request.summary ?: event.summary,
                payloadJson = request.payloadJson ?: event.payloadJson,
                createdAt = event.createdAt
            )
        ).toDto()
    }

    fun delete(id: Long) {
        activityEventRepository.delete(getEvent(id))
    }

    private fun getEvent(id: Long): ActivityEvent = activityEventRepository.findById(id)
        .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Activity event not found") }

    private fun ActivityEvent.toDto(): ActivityEventDto = ActivityEventDto(
        id = id,
        actorId = actorId,
        entityType = entityType,
        entityId = entityId,
        actionType = actionType,
        summary = summary,
        payloadJson = payloadJson,
        createdAt = createdAt.toString()
    )
}
