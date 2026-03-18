package com.cruise.service

import com.cruise.entity.Doc
import com.cruise.entity.DocRevision
import com.cruise.repository.DocRepository
import com.cruise.repository.DocRevisionRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDateTime

data class DocRevisionDto(
    val id: Long,
    val docId: Long,
    val versionNumber: Int,
    val content: String,
    val authorId: Long,
    val createdAt: String
)

data class DocDto(
    val id: Long,
    val organizationId: Long,
    val teamId: Long?,
    val projectId: Long?,
    val issueId: Long?,
    val title: String,
    val slug: String,
    val status: String,
    val authorId: Long,
    val currentRevisionId: Long?,
    val createdAt: String,
    val updatedAt: String,
    val currentRevision: DocRevisionDto?,
    val revisions: List<DocRevisionDto>
)

data class DocQuery(
    val organizationId: Long? = null,
    val teamId: Long? = null,
    val projectId: Long? = null,
    val issueId: Long? = null,
    val status: String? = null,
    val q: String? = null
)

data class CreateDocRequest(
    val organizationId: Long? = null,
    val teamId: Long? = null,
    val projectId: Long? = null,
    val issueId: Long? = null,
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
    val title: String? = null,
    val slug: String? = null,
    val status: String? = null,
    val authorId: Long? = null,
    val content: String? = null
)

@Service
class DocService(
    private val docRepository: DocRepository,
    private val docRevisionRepository: DocRevisionRepository
) {
    fun findAll(query: DocQuery = DocQuery()): List<DocDto> =
        docRepository.findAll()
            .asSequence()
            .filter { query.organizationId == null || it.organizationId == query.organizationId }
            .filter { query.teamId == null || it.teamId == query.teamId }
            .filter { query.projectId == null || it.projectId == query.projectId }
            .filter { query.issueId == null || it.issueId == query.issueId }
            .filter { query.status == null || it.status == query.status }
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
                title = request.title,
                slug = request.slug ?: defaultSlug(request.title),
                status = request.status ?: "DRAFT",
                authorId = request.authorId
            )
        )
        val revision = docRevisionRepository.save(
            DocRevision(
                docId = doc.id,
                versionNumber = 1,
                content = request.content,
                authorId = request.authorId
            )
        )
        doc.currentRevisionId = revision.id
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
                title = request.title ?: doc.title,
                slug = request.slug ?: doc.slug,
                status = request.status ?: doc.status,
                authorId = request.authorId ?: doc.authorId,
                currentRevisionId = doc.currentRevisionId,
                createdAt = doc.createdAt,
                updatedAt = LocalDateTime.now()
            )
        )
        if (request.content != null) {
            val nextVersion = (docRevisionRepository.findByDocIdOrderByVersionNumberDesc(id).firstOrNull()?.versionNumber ?: 0) + 1
            val revision = docRevisionRepository.save(
                DocRevision(
                    docId = updated.id,
                    versionNumber = nextVersion,
                    content = request.content,
                    authorId = request.authorId ?: updated.authorId
                )
            )
            updated.currentRevisionId = revision.id
            updated.updatedAt = LocalDateTime.now()
            docRepository.save(updated)
        }
        return getDoc(id).toDto()
    }

    fun delete(id: Long) {
        getDoc(id)
        docRevisionRepository.deleteAll(docRevisionRepository.findByDocIdOrderByVersionNumberDesc(id))
        docRepository.deleteById(id)
    }

    private fun getDoc(id: Long): Doc = docRepository.findById(id)
        .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Doc not found") }

    private fun getRevision(id: Long): DocRevision? =
        id.takeIf { it > 0 }?.let { docRevisionRepository.findById(it).orElse(null) }

    private fun Doc.toDto(): DocDto {
        val revisions = docRevisionRepository.findByDocIdOrderByVersionNumberDesc(id).map { it.toDto() }
        return DocDto(
            id = id,
            organizationId = organizationId,
            teamId = teamId,
            projectId = projectId,
            issueId = issueId,
            title = title,
            slug = slug,
            status = status,
            authorId = authorId,
            currentRevisionId = currentRevisionId,
            createdAt = createdAt.toString(),
            updatedAt = updatedAt.toString(),
            currentRevision = currentRevisionId?.let(::getRevision)?.toDto(),
            revisions = revisions
        )
    }

    private fun DocRevision.toDto(): DocRevisionDto = DocRevisionDto(
        id = id,
        docId = docId,
        versionNumber = versionNumber,
        content = content,
        authorId = authorId,
        createdAt = createdAt.toString()
    )

    private fun defaultSlug(title: String): String =
        title.lowercase()
            .replace(Regex("[^a-z0-9]+"), "-")
            .trim('-')
            .ifBlank { "doc-${System.currentTimeMillis()}" }
}
