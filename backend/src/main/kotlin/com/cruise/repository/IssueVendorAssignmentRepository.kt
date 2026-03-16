package com.cruise.repository

import com.cruise.entity.IssueVendorAssignment
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface IssueVendorAssignmentRepository : JpaRepository<IssueVendorAssignment, Long> {
    fun findByIssueId(issueId: Long): List<IssueVendorAssignment>
}
