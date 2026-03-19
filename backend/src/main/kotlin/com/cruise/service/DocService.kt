package com.cruise.service

import com.cruise.entity.Doc
import com.cruise.entity.DocumentContent
import com.cruise.repository.DocRepository
import com.cruise.repository.DocumentContentRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDateTime

data class DocumentContentDto(
    val id: Long,
    val documentId: Long,
    val content: String,
    val versionNumber: Int,
    val authorId: Long?,
    val createdAt: String
)

data class DocDto(
    val id: Long,
    val organizationId: Long,
    val teamId: Long?,
    val projectId: Long?,
    val issueId: Long?,
    val initiativeId: Long?,
    val title: String,
    val slug: String,
    val status: String,
    val authorId: Long,
    val currentContentId: Long?,
    val createdAt: String,
    val updatedAt: String,
    val archivedAt: String?,
    val currentContent: DocumentContentDto?,
    val contents: List<DocumentContentDto>
)

data class DocQuery(
    val organizationId: Long? = null,
    val teamId: Long? = null,
    val projectId: Long? = null,
    val issueId: Long? = null,
    val initiativeId: Long? = null,
    val status: String? = null,
    val q: String? = null,
    val includeArchived: Boolean = false
)

data class CreateDocRequest(
    val organizationId: Long? = null,
    val teamId: Long? = null,
    val projectId: Long? = null,
    val issueId: Long? = null,
    val initiativeId: Long? = null,
    val title: String,
    val slug: String? = null,
    val status: String? = null,
    val authorId: Long,
    val content: String
)

data class UpdateDocRequest(
    val teamId: Long? = null,
    val projectId: Long? = null,
    val issueId: Long? = null,
    val initiativeId: Long? = null,
    val title: String? = null,
    val slug: String? = null,
    val status: String? = null,
    val authorId: Long? = null,
    val content: String? = null,
    val archivedAt: String? = null
)

@Service
class DocService(
    private val docRepository: DocRepository,
    private val documentContentRepository: DocumentContentRepository
) {
    fun findAll(query: DocQuery = DocQuery()): List<DocDto> =
        docRepository.findAll()
            .asSequence()
            .filter { query.organizationId == null || it.organizationId == query.organizationId }
            .filter { query.teamId == null || it.teamId == query.teamId }
            .filter { query.projectId == null || it.projectId == query.projectId }
            .filter { query.issueId == null || it.issueId == query.issueId }
            .filter { query.initiativeId == null || it.initiativeId == query.initiativeId }
            .filter { query.status == null || it.status == query.status }
            .filter { query.includeArchived || it.archivedAt == null }
            .filter {
                query.q.isNullOrBlank() || listOfNotNull(it.title, it.slug)
                    .any { text -> text.contains(query.q, ignoreCase = true) }
            }
            .sortedBy { it.id }
            .map { it.toDto() }
            .toList()

    fun findById(id: Long): DocDto = getDoc(id).toDto()

    fun create(request: CreateDocRequest): DocDto {
        val doc = docRepository.save(
            Doc(
                organizationId = request.organizationId ?: 1L,
                teamId = request.teamId,
                projectId = request.projectId,
                issueId = request.issueId,
                initiativeId = request.initiativeId,
                title = request.title,
                slug = request.slug ?: defaultSlug(request.title),
                status = request.status ?: "DRAFT",
                authorId = request.authorId
            )
        )
        val content = documentContentRepository.save(
            DocumentContent(
                documentId = doc.id,
                content = request.content,
                versionNumber = 1,
                authorId = request.authorId
            )
        )
        doc.currentContentId = content.id
        doc.updatedAt = LocalDateTime.now()
        docRepository.save(doc)
        return getDoc(doc.id).toDto()
    }

    fun update(id: Long, request: UpdateDocRequest): DocDto {
        val doc = getDoc(id)
        val updated = docRepository.save(
            Doc(
                id = doc.id,
                organizationId = doc.organizationId,
                teamId = request.teamId ?: doc.teamId,
                projectId = request.projectId ?: doc.projectId,
                issueId = request.issueId ?: doc.issueId,
                initiativeId = request.initiativeId ?: doc.initiativeId,
                title = request.title ?: doc.title,
                slug = request.slug ?: doc.slug,
                status = request.status ?: doc.status,
                authorId = request.authorId ?: doc.authorId,
                currentContentId = doc.currentContentId,
                createdAt = doc.createdAt,
                updatedAt = LocalDateTime.now(),
                archivedAt = parseDateTime(request.archivedAt) ?: doc.archivedAt
            )
        )
        if (request.content != null) {
            val nextVersion = (documentContentRepository.findByDocumentIdOrderByVersionNumberDesc(id).firstOrNull()?.versionNumber ?: 0) + 1
            val content = documentContentRepository.save(
                DocumentContent(
                    documentId = updated.id,
                    content = request.content,
                    versionNumber = nextVersion,
                    authorId = request.authorId ?: updated.authorId
                )
            )
            updated.currentContentId = content.id
            updated.updatedAt = LocalDateTime.now()
            docRepository.save(updated)
        }
        return getDoc(id).toDto()
    }

    fun delete(id: Long) {
        getDoc(id)
        documentContentRepository.deleteAll(documentContentRepository.findByDocumentIdOrderByVersionNumberDesc(id))
        docRepository.deleteById(id)
    }

    private fun getDoc(id: Long): Doc = docRepository.findById(id)
        .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found") }

    private fun getContent(id: Long): DocumentContent? =
        id.takeIf { it > 0 }?.let { documentContentRepository.findById(it).orElse(null) }

    private fun Doc.toDto(): DocDto {
        val contents = documentContentRepository.findByDocumentIdOrderByVersionNumberDesc(id).map { it.toDto() }
        return DocDto(
            id = id,
            organizationId = organizationId,
            teamId = teamId,
            projectId = projectId,
            issueId = issueId,
            initiativeId = initiativeId,
            title = title,
            slug = slug,
            status = status,
            authorId = authorId,
            currentContentId = currentContentId,
            createdAt = createdAt.toString(),
            updatedAt = updatedAt.toString(),
            archivedAt = archivedAt?.toString(),
            currentContent = currentContentId?.let(::getContent)?.toDto(),
            contents = contents
        )
    }

    private fun DocumentContent.toDto(): DocumentContentDto = DocumentContentDto(
        id = id,
        documentId = documentId,
        content = content,
        versionNumber = versionNumber,
        authorId = authorId,
        createdAt = createdAt.toString()
    )

    private fun defaultSlug(title: String): String =
        title.lowercase()
            .replace(Regex("[^a-z0-9]+"), "-")
            .trim('-')
            .ifBlank { "doc-${System.currentTimeMillis()}" }

    private fun parseDateTime(value: String?): LocalDateTime? =
        value?.takeIf(String::isNotBlank)?.let(LocalDateTime::parse)
}
