package com.cruise.repository

import com.cruise.entity.UserFeedback
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface UserFeedbackRepository : JpaRepository<UserFeedback, Long> {
    fun findBySessionId(sessionId: String): List<UserFeedback>
    fun findBySkillName(skillName: String): List<UserFeedback>
    fun findByUserId(userId: Long): List<UserFeedback>
    fun findByExecutionLogId(executionLogId: Long): UserFeedback?

    @Query("SELECT AVG(u.rating) FROM UserFeedback u WHERE u.skillName = :skillName")
    fun avgRatingBySkillName(skillName: String): Double?

    @Query("SELECT COUNT(u) FROM UserFeedback u WHERE u.isPositive = true")
    fun positiveFeedbackCount(): Long

    @Query("SELECT COUNT(u) FROM UserFeedback u WHERE u.isPositive = false")
    fun negativeFeedbackCount(): Long
}
