package com.cruise.repository

import com.cruise.entity.Comment
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface CommentRepository : JpaRepository<Comment, Long> {
    fun findByTargetTypeAndTargetId(targetType: String, targetId: Long): List<Comment>
    fun findByDocumentContentId(documentContentId: Long): List<Comment>
}
