package com.cruise.repository

import com.cruise.entity.Requirement
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface RequirementRepository : JpaRepository<Requirement, Long> {
    fun findByProjectId(projectId: Long): List<Requirement>
    fun findByProjectIdAndStatus(projectId: Long, status: String): List<Requirement>
}