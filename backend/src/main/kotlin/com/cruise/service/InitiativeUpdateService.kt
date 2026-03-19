package com.cruise.service

import com.cruise.entity.InitiativeUpdate
import com.cruise.repository.InitiativeUpdateRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDateTime

data class InitiativeUpdateDto(
    val id: Long,
    val initiativeId: Long,
    val title: String,
    val body: String?,
    val health: String?,
    val userId: Long?,
    val createdAt: String,
    val updatedAt: String,
    val archivedAt: String?
)

data class CreateInitiativeUpdateRequest(
    val title: String,
    val body: String? = null,
    val health: String? = null,
    val userId: Long? = null
)

data class UpdateInitiativeUpdateRequest(
    val title: String? = null,
    val body: String? = null,
    val health: String? = null,
    val userId: Long? = null,
    val archivedAt: String? = null
)

@Service
class InitiativeUpdateService(
    private val initiativeUpdateRepository: InitiativeUpdateRepository
) {
    fun findByInitiative(initiativeId: Long, includeArchived: Boolean = false): List<InitiativeUpdateDto> =
        initiativeUpdateRepository.findAll()
            .asSequence()
            .filter { it.initiativeId == initiativeId }
            .filter { includeArchived || it.archivedAt == null }
            .sortedByDescending { it.createdAt }
            .map { it.toDto() }
            .toList()

    fun findById(initiativeId: Long, id: Long): InitiativeUpdateDto = getUpdate(initiativeId, id).toDto()

    fun create(initiativeId: Long, request: CreateInitiativeUpdateRequest): InitiativeUpdateDto =
        initiativeUpdateRepository.save(
            InitiativeUpdate(
                initiativeId = initiativeId,
                title = request.title,
                body = request.body,
                health = request.health,
                userId = request.userId
            )
        ).toDto()

    fun update(initiativeId: Long, id: Long, request: UpdateInitiativeUpdateRequest): InitiativeUpdateDto {
        val current = getUpdate(initiativeId, id)
        return initiativeUpdateRepository.save(
            InitiativeUpdate(
                id = current.id,
                initiativeId = current.initiativeId,
                title = request.title ?: current.title,
                body = request.body ?: current.body,
                health = request.health ?: current.health,
                userId = request.userId ?: current.userId,
                createdAt = current.createdAt,
                updatedAt = LocalDateTime.now(),
                archivedAt = parseDateTime(request.archivedAt) ?: current.archivedAt
            )
        ).toDto()
    }

    fun delete(initiativeId: Long, id: Long) {
        initiativeUpdateRepository.delete(getUpdate(initiativeId, id))
    }

    private fun getUpdate(initiativeId: Long, id: Long): InitiativeUpdate =
        initiativeUpdateRepository.findById(id)
            .filter { it.initiativeId == initiativeId }
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Initiative update not found") }

    private fun InitiativeUpdate.toDto(): InitiativeUpdateDto = InitiativeUpdateDto(
        id = id,
        initiativeId = initiativeId,
        title = title,
        body = body,
        health = health,
        userId = userId,
        createdAt = createdAt.toString(),
        updatedAt = updatedAt.toString(),
        archivedAt = archivedAt?.toString()
    )

    private fun parseDateTime(value: String?): LocalDateTime? =
        value?.takeIf(String::isNotBlank)?.let(LocalDateTime::parse)
}
