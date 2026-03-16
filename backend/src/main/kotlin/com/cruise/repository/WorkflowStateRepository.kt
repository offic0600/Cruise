package com.cruise.repository

import com.cruise.entity.WorkflowState
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface WorkflowStateRepository : JpaRepository<WorkflowState, Long> {
    fun findByWorkflowIdOrderBySortOrderAsc(workflowId: Long): List<WorkflowState>
}
