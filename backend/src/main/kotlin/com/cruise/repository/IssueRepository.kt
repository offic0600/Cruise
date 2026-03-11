package com.cruise.repository

import com.cruise.entity.Issue
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface IssueRepository : JpaRepository<Issue, Long> {
    fun findByType(type: String): List<Issue>
    fun findByProjectId(projectId: Long): List<Issue>
    fun findByProjectIdAndType(projectId: Long, type: String): List<Issue>
    fun findByParentIssueId(parentIssueId: Long): List<Issue>
    fun findByAssigneeId(assigneeId: Long): List<Issue>
    fun findByAssigneeIdAndType(assigneeId: Long, type: String): List<Issue>
}
