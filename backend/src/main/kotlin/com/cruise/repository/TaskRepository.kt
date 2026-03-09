package com.cruise.repository

import com.cruise.entity.Task
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface TaskRepository : JpaRepository<Task, Long> {
    fun findByRequirementId(requirementId: Long): List<Task>
    fun findByAssigneeId(assigneeId: Long): List<Task>
    fun findByStatus(status: String): List<Task>
}