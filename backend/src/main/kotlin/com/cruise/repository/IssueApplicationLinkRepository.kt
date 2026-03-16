package com.cruise.repository

import com.cruise.entity.IssueApplicationLink
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface IssueApplicationLinkRepository : JpaRepository<IssueApplicationLink, Long> {
    fun findByIssueId(issueId: Long): List<IssueApplicationLink>
}
