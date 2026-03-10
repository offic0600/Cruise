package com.cruise.repository

import com.cruise.entity.SkillExecutionLog
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface SkillExecutionLogRepository : JpaRepository<SkillExecutionLog, Long> {
    fun findBySessionId(sessionId: String): List<SkillExecutionLog>
    fun findBySkillName(skillName: String): List<SkillExecutionLog>
    fun findByUserId(userId: Long): List<SkillExecutionLog>
    fun findByStatus(status: String): List<SkillExecutionLog>

    @Query("SELECT s FROM SkillExecutionLog s WHERE s.skillName = :skillName ORDER BY s.createdAt DESC")
    fun findRecentBySkillName(skillName: String): List<SkillExecutionLog>

    @Query("SELECT AVG(s.executionTimeMs) FROM SkillExecutionLog s WHERE s.skillName = :skillName")
    fun avgExecutionTimeBySkillName(skillName: String): Double?

    @Query("SELECT COUNT(s) FROM SkillExecutionLog s WHERE s.skillName = :skillName AND s.status = 'SUCCESS'")
    fun successCountBySkillName(skillName: String): Long
}
