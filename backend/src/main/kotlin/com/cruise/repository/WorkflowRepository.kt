package com.cruise.repository

import com.cruise.entity.Workflow
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface WorkflowRepository : JpaRepository<Workflow, Long> {
    fun findByTeamId(teamId: Long): List<Workflow>
}
