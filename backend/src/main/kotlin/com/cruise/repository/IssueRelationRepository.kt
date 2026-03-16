package com.cruise.repository

import com.cruise.entity.IssueRelation
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface IssueRelationRepository : JpaRepository<IssueRelation, Long> {
    fun findByFromIssueId(fromIssueId: Long): List<IssueRelation>
    fun findByToIssueId(toIssueId: Long): List<IssueRelation>
}
