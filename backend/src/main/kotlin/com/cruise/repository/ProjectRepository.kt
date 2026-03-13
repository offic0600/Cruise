package com.cruise.repository

import com.cruise.entity.Project
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ProjectRepository : JpaRepository<Project, Long> {
    fun findByStatus(status: String): List<Project>
}