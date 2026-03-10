package com.cruise.repository

import com.cruise.entity.SkillDefinition
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface SkillDefinitionRepository : JpaRepository<SkillDefinition, Long> {
    fun findByName(name: String): SkillDefinition?
    fun findByCategory(category: String): List<SkillDefinition>
    fun findByStatus(status: String): List<SkillDefinition>

    @Query("SELECT s FROM SkillDefinition s ORDER BY s.executionCount DESC")
    fun findTopByExecutionCount(): List<SkillDefinition>

    @Query("SELECT s FROM SkillDefinition s ORDER BY s.successRate ASC")
    fun findLowestSuccessRate(): List<SkillDefinition>
}
