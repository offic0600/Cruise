package com.cruise.service

import com.cruise.entity.IssueAttachment
import com.cruise.repository.IssueAttachmentRepository
import org.springframework.beans.factory.annotation.Value
import org.springframework.core.io.Resource
import org.springframework.core.io.UrlResource
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.server.ResponseStatusException
import java.net.MalformedURLException
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.nio.file.StandardCopyOption
import java.time.LocalDateTime
import java.util.UUID

data class IssueAttachmentDto(
    val id: Long,
    val issueId: Long,
    val filename: String,
    val attachmentType: String,
    val contentType: String?,
    val size: Long,
    val externalUrl: String?,
    val linkTitle: String?,
    val metadataJson: String?,
    val uploadedBy: Long?,
    val createdAt: String
)

data class AttachmentDownload(
    val attachment: IssueAttachment,
    val resource: Resource
)

@Service
class IssueAttachmentService(
    private val issueAttachmentRepository: IssueAttachmentRepository,
    private val issueService: IssueService,
    @Value("\${cruise.storage.attachments-root:storage}") attachmentsRoot: String
) {
    data class CreateLinkAttachmentRequest(
        val url: String,
        val title: String? = null,
        val metadataJson: String? = null,
        val uploadedBy: Long? = null
    )

    private val rootPath: Path = Paths.get(attachmentsRoot).toAbsolutePath().normalize()

    fun findAll(issueId: Long): List<IssueAttachmentDto> {
        issueService.getIssue(issueId)
        return issueAttachmentRepository.findByIssueIdOrderByCreatedAtDesc(issueId).map(::toDto)
    }

    @Transactional
    fun upload(issueId: Long, file: MultipartFile, uploadedBy: Long?): IssueAttachmentDto {
        issueService.getIssue(issueId)
        if (file.isEmpty) throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Attachment is empty")

        val originalName = sanitizeFilename(file.originalFilename ?: "attachment")
        val issueDir = rootPath.resolve("issues").resolve(issueId.toString())
        Files.createDirectories(issueDir)

        val storedFilename = "${UUID.randomUUID()}-$originalName"
        val targetFile = issueDir.resolve(storedFilename)
        file.inputStream.use { input ->
            Files.copy(input, targetFile, StandardCopyOption.REPLACE_EXISTING)
        }

        val attachment = issueAttachmentRepository.save(
            IssueAttachment(
                issueId = issueId,
                filename = originalName,
                attachmentType = "FILE",
                contentType = file.contentType,
                size = file.size,
                storagePath = targetFile.toString(),
                uploadedBy = uploadedBy,
                createdAt = LocalDateTime.now()
            )
        )

        return toDto(attachment)
    }

    @Transactional
    fun createLinkAttachments(issueId: Long, requests: List<CreateLinkAttachmentRequest>): List<IssueAttachmentDto> {
        issueService.getIssue(issueId)
        return requests.map { request ->
            val safeUrl = request.url.trim()
            if (safeUrl.isBlank()) throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Link URL is required")
            issueAttachmentRepository.save(
                IssueAttachment(
                    issueId = issueId,
                    filename = request.title?.takeIf { it.isNotBlank() } ?: safeUrl,
                    attachmentType = "LINK",
                    contentType = "text/uri-list",
                    size = safeUrl.length.toLong(),
                    storagePath = null,
                    externalUrl = safeUrl,
                    linkTitle = request.title?.trim()?.takeIf { it.isNotBlank() },
                    metadataJson = request.metadataJson,
                    uploadedBy = request.uploadedBy,
                    createdAt = LocalDateTime.now()
                )
            )
        }.map(::toDto)
    }

    fun load(issueId: Long, attachmentId: Long): AttachmentDownload {
        val attachment = getAttachment(issueId, attachmentId)
        if (attachment.attachmentType != "FILE" || attachment.storagePath.isNullOrBlank()) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Only file attachments can be downloaded")
        }
        val resource = try {
            UrlResource(Paths.get(attachment.storagePath).toUri())
        } catch (error: MalformedURLException) {
            throw ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Attachment path is invalid", error)
        }
        if (!resource.exists()) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Attachment file not found")
        }
        return AttachmentDownload(attachment, resource)
    }

    @Transactional
    fun delete(issueId: Long, attachmentId: Long) {
        val attachment = getAttachment(issueId, attachmentId)
        runCatching { Files.deleteIfExists(Paths.get(attachment.storagePath)) }
        issueAttachmentRepository.delete(attachment)
    }

    private fun getAttachment(issueId: Long, attachmentId: Long): IssueAttachment =
        issueAttachmentRepository.findByIdAndIssueId(attachmentId, issueId)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Attachment not found")

    private fun sanitizeFilename(filename: String): String =
        filename.replace(Regex("[^a-zA-Z0-9._-]"), "_").take(180).ifBlank { "attachment" }

    private fun toDto(attachment: IssueAttachment) = IssueAttachmentDto(
        id = attachment.id,
        issueId = attachment.issueId,
        filename = attachment.filename,
        attachmentType = attachment.attachmentType,
        contentType = attachment.contentType,
        size = attachment.size,
        externalUrl = attachment.externalUrl,
        linkTitle = attachment.linkTitle,
        metadataJson = attachment.metadataJson,
        uploadedBy = attachment.uploadedBy,
        createdAt = attachment.createdAt.toString()
    )
}
