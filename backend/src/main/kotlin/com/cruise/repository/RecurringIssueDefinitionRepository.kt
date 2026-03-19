package com.cruise.repository

import com.cruise.entity.RecurringIssueDefinition
import org.springframework.data.jpa.repository.JpaRepository
import java.time.LocalDateTime

interface RecurringIssueDefinitionRepository : JpaRepository<RecurringIssueDefinition, Long> {
    fun findByActiveTrueAndNextRunAtLessThanEqual(nextRunAt: LocalDateTime): List<RecurringIssueDefinition>
}
