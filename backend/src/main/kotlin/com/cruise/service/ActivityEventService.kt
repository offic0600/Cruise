package com.cruise.service

import com.cruise.entity.ActivityEvent
import com.cruise.repository.ActivityEventRepository
import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException

data class ActivityEventDto(
    val id: Long,
    val actorId: Long?,
    val entityType: String,
    val entityId: Long,
    val eventType: String,
    val payload: Map<String, Any?>?,
    val summary: String?,
    val payloadJson: String?,
    val createdAt: String
)

data class ActivityEventQuery(
    val actorId: Long? = null,
    val entityType: String? = null,
    val entityId: Long? = null,
    val eventType: String? = null
)

data class CreateActivityEventRequest(
    val actorId: Long? = null,
    val entityType: String,
    val entityId: Long,
    val eventType: String,
    val summary: String? = null,
    val payload: Map<String, Any?>? = null,
    val payloadJson: String? = null
)

data class UpdateActivityEventRequest(
    val eventType: String? = null,
    val summary: String? = null,
    val payload: Map<String, Any?>? = null,
    val payloadJson: String? = null
)

@Service
class ActivityEventService(
    private val activityEventRepository: ActivityEventRepository,
    private val objectMapper: ObjectMapper
) {
    fun findAll(query: ActivityEventQuery = ActivityEventQuery()): List<ActivityEventDto> =
        activityEventRepository.findAll()
            .asSequence()
            .filter { query.actorId == null || it.actorId == query.actorId }
            .filter { query.entityType == null || it.entityType == query.entityType }
            .filter { query.entityId == null || it.entityId == query.entityId }
            .filter { query.eventType == null || it.eventType == query.eventType }
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
                eventType = request.eventType,
                summary = request.summary ?: request.eventType,
                payloadJson = request.payloadJson ?: request.payload?.let(::serializePayload)
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
                eventType = request.eventType ?: event.eventType,
                summary = request.summary ?: event.summary,
                payloadJson = request.payloadJson ?: request.payload?.let(::serializePayload) ?: event.payloadJson,
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
        eventType = eventType,
        payload = payloadJson?.let(::deserializePayload),
        summary = summary,
        payloadJson = payloadJson,
        createdAt = createdAt.toString()
    )

    private fun serializePayload(payload: Map<String, Any?>): String =
        objectMapper.writeValueAsString(payload)

    private fun deserializePayload(payloadJson: String): Map<String, Any?> =
        objectMapper.readValue(payloadJson, object : TypeReference<Map<String, Any?>>() {})
}
