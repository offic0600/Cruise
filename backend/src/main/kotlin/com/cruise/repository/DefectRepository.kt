package com.cruise.repository

import com.cruise.entity.Defect
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface DefectRepository : JpaRepository<Defect, Long> {
    fun findByProjectId(projectId: Long): List<Defect>
    fun findByTaskId(taskId: Long): List<Defect>
    fun findByStatus(status: String): List<Defect>
    fun findBySeverity(severity: String): List<Defect>
}
