package com.cruise.repository

import com.cruise.entity.Comment
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface CommentRepository : JpaRepository<Comment, Long> {
    fun findByIssueId(issueId: Long): List<Comment>
    fun findByDocId(docId: Long): List<Comment>
}
