package com.cruise.repository

import com.cruise.entity.DocRevision
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface DocRevisionRepository : JpaRepository<DocRevision, Long> {
    fun findByDocIdOrderByVersionNumberDesc(docId: Long): List<DocRevision>
}
