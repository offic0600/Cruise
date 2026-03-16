package com.cruise.repository

import com.cruise.entity.WorkflowTransition
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface WorkflowTransitionRepository : JpaRepository<WorkflowTransition, Long> {
    fun findByWorkflowId(workflowId: Long): List<WorkflowTransition>
}
