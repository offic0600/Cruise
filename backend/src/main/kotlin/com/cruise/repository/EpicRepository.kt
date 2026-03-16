package com.cruise.repository

import com.cruise.entity.Epic
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface EpicRepository : JpaRepository<Epic, Long> {
    fun findByProjectId(projectId: Long): List<Epic>
    fun findByTeamId(teamId: Long): List<Epic>
}
