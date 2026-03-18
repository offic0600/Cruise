package com.cruise.repository

import com.cruise.entity.IssueAttachment
import org.springframework.data.jpa.repository.JpaRepository

interface IssueAttachmentRepository : JpaRepository<IssueAttachment, Long> {
    fun findByIssueIdOrderByCreatedAtDesc(issueId: Long): List<IssueAttachment>
    fun findByIdAndIssueId(id: Long, issueId: Long): IssueAttachment?
}
