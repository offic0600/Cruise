package com.cruise.repository

import com.cruise.entity.DocumentContent
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface DocumentContentRepository : JpaRepository<DocumentContent, Long> {
    fun findByDocumentIdOrderByVersionNumberDesc(documentId: Long): List<DocumentContent>
}
