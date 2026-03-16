package com.cruise.repository

import com.cruise.entity.Sprint
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface SprintRepository : JpaRepository<Sprint, Long> {
    fun findByTeamId(teamId: Long): List<Sprint>
    fun findByProjectId(projectId: Long): List<Sprint>
}
