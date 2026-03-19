package com.cruise.service

import com.cruise.entity.EmailIntakeConfig
import com.cruise.entity.EmailIntakeMessage
import com.cruise.repository.EmailIntakeConfigRepository
import com.cruise.repository.EmailIntakeMessageRepository
import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDateTime

data class EmailIntakeConfigDto(
    val id: Long,
    val organizationId: Long,
    val teamId: Long?,
    val projectId: Long?,
    val templateId: Long?,
    val name: String,
    val emailAddress: String,
    val active: Boolean,
    val createdAt: String,
    val updatedAt: String
)

data class SaveEmailIntakeConfigRequest(
    val organizationId: Long? = null,
    val teamId: Long? = null,
    val projectId: Long? = null,
    val templateId: Long? = null,
    val name: String,
    val emailAddress: String,
    val active: Boolean = true
)

data class IngestEmailMessageRequest(
    val emailAddress: String,
    val sourceMessageId: String,
    val senderEmail: String? = null,
    val subject: String? = null,
    val body: String? = null,
    val attachments: List<Map<String, Any?>>? = null
)

data class EmailIntakeMessageDto(
    val id: Long,
    val configId: Long,
    val sourceMessageId: String,
    val senderEmail: String?,
    val subject: String?,
    val body: String?,
    val attachments: List<Map<String, Any?>>,
    val processedIssueId: Long?,
    val processedAt: String?,
    val createdAt: String
)

@Service
class EmailIntakeService(
    private val emailIntakeConfigRepository: EmailIntakeConfigRepository,
    private val emailIntakeMessageRepository: EmailIntakeMessageRepository,
    private val issueService: IssueService,
    private val issueTemplateService: IssueTemplateService,
    private val issueAttachmentService: IssueAttachmentService,
    private val objectMapper: ObjectMapper
) {
    fun getConfigs(): List<EmailIntakeConfigDto> = emailIntakeConfigRepository.findAll().sortedBy { it.id }.map(::toDto)

    fun createConfig(request: SaveEmailIntakeConfigRequest): EmailIntakeConfigDto =
        emailIntakeConfigRepository.save(
            EmailIntakeConfig(
                organizationId = request.organizationId ?: 1L,
                teamId = request.teamId,
                projectId = request.projectId,
                templateId = request.templateId,
                name = request.name,
                emailAddress = request.emailAddress.trim().lowercase(),
                active = request.active
            )
        ).let(::toDto)

    fun updateConfig(id: Long, request: SaveEmailIntakeConfigRequest): EmailIntakeConfigDto {
        val config = getConfigEntity(id)
        return emailIntakeConfigRepository.save(
            EmailIntakeConfig(
                id = config.id,
                organizationId = request.organizationId ?: config.organizationId,
                teamId = normalizeNullable(request.teamId, config.teamId),
                projectId = normalizeNullable(request.projectId, config.projectId),
                templateId = normalizeNullable(request.templateId, config.templateId),
                name = request.name,
                emailAddress = request.emailAddress.trim().lowercase(),
                active = request.active,
                createdAt = config.createdAt,
                updatedAt = LocalDateTime.now()
            )
        ).let(::toDto)
    }

    fun deleteConfig(id: Long) {
        emailIntakeConfigRepository.delete(getConfigEntity(id))
    }

    fun ingest(request: IngestEmailMessageRequest): EmailIntakeMessageDto {
        val config = emailIntakeConfigRepository.findByEmailAddress(request.emailAddress.trim().lowercase())
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Email intake config not found")
        if (!config.active) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Email intake config is disabled")
        }
        val existing = emailIntakeMessageRepository.findByConfigIdAndSourceMessageId(config.id, request.sourceMessageId)
        if (existing != null) return toDto(existing)

        val template = config.templateId?.let { issueTemplateService.findById(it) }
        val issue = issueService.create(
            CreateIssueRequest(
                organizationId = config.organizationId,
                type = template?.type ?: "TASK",
                title = request.subject?.takeIf { it.isNotBlank() } ?: template?.title ?: "Email request",
                description = request.body?.takeIf { it.isNotBlank() } ?: template?.description,
                state = template?.state,
                priority = template?.priority,
                projectId = template?.projectId ?: config.projectId
                    ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Email intake config must define a project"),
                teamId = template?.teamId ?: config.teamId,
                assigneeId = template?.assigneeId,
                estimatePoints = template?.estimatePoints,
                plannedStartDate = template?.plannedStartDate,
                plannedEndDate = template?.plannedEndDate,
                sourceType = "EMAIL",
                customFields = template?.customFields?.filterKeys { it != "links" }
            )
        )
        val attachments = request.attachments ?: emptyList()
        if (attachments.isNotEmpty()) {
            issueAttachmentService.createLinkAttachments(
                issue.id,
                attachments.map {
                    IssueAttachmentService.CreateLinkAttachmentRequest(
                        url = it["url"]?.toString() ?: "",
                        title = it["title"]?.toString(),
                        metadataJson = objectMapper.writeValueAsString(it)
                    )
                }
            )
        }
        val message = emailIntakeMessageRepository.save(
            EmailIntakeMessage(
                configId = config.id,
                sourceMessageId = request.sourceMessageId,
                senderEmail = request.senderEmail,
                subject = request.subject,
                body = request.body,
                attachmentsJson = objectMapper.writeValueAsString(attachments),
                processedIssueId = issue.id,
                processedAt = LocalDateTime.now()
            )
        )
        return toDto(message)
    }

    private fun getConfigEntity(id: Long): EmailIntakeConfig = emailIntakeConfigRepository.findById(id)
        .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Email intake config not found") }

    private fun toDto(config: EmailIntakeConfig) = EmailIntakeConfigDto(
        id = config.id,
        organizationId = config.organizationId,
        teamId = config.teamId,
        projectId = config.projectId,
        templateId = config.templateId,
        name = config.name,
        emailAddress = config.emailAddress,
        active = config.active,
        createdAt = config.createdAt.toString(),
        updatedAt = config.updatedAt.toString()
    )

    private fun toDto(message: EmailIntakeMessage) = EmailIntakeMessageDto(
        id = message.id,
        configId = message.configId,
        sourceMessageId = message.sourceMessageId,
        senderEmail = message.senderEmail,
        subject = message.subject,
        body = message.body,
        attachments = if (message.attachmentsJson.isNullOrBlank()) emptyList() else objectMapper.readValue(
            message.attachmentsJson,
            object : TypeReference<List<Map<String, Any?>>>() {}
        ),
        processedIssueId = message.processedIssueId,
        processedAt = message.processedAt?.toString(),
        createdAt = message.createdAt.toString()
    )

    private fun normalizeNullable(requestValue: Long?, currentValue: Long?): Long? =
        when {
            requestValue == null -> currentValue
            requestValue <= 0 -> null
            else -> requestValue
        }
}
