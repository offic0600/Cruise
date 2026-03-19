package com.cruise.repository

import com.cruise.entity.IssueLabel
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface IssueLabelRepository : JpaRepository<IssueLabel, Long> {
    fun findByIssueIdIn(issueIds: Collection<Long>): List<IssueLabel>
    fun findByIssueId(issueId: Long): List<IssueLabel>
    fun deleteByIssueId(issueId: Long)
}
