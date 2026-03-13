package com.cruise.service

import com.cruise.entity.SkillDefinition
import com.cruise.entity.UserFeedback
import com.cruise.repository.SkillDefinitionRepository
import com.cruise.repository.SkillExecutionLogRepository
import com.cruise.repository.UserFeedbackRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class EvolutionService(
    private val skillDefinitionRepository: SkillDefinitionRepository,
    private val skillExecutionLogRepository: SkillExecutionLogRepository,
    private val userFeedbackRepository: UserFeedbackRepository
) {
    private val logger = LoggerFactory.getLogger(EvolutionService::class.java)

    fun analyzePerformance(): EvolutionAnalysis {
        val allSkills = skillDefinitionRepository.findAll()

        val skillPerformance = allSkills.map { skill ->
            SkillPerformance(
                name = skill.name,
                executionCount = skill.executionCount,
                successRate = skill.successRate,
                avgExecutionTimeMs = skill.avgExecutionTimeMs
            )
        }

        val totalExecutions = skillPerformance.sumOf { it.executionCount }
        val avgSuccessRate = if (skillPerformance.isNotEmpty()) {
            skillPerformance.map { it.successRate }.average().toFloat()
        } else 1.0f

        val positiveCount = userFeedbackRepository.positiveFeedbackCount()
        val negativeCount = userFeedbackRepository.negativeFeedbackCount()
        val totalFeedback = positiveCount + negativeCount

        val overallFeedbackScore = if (totalFeedback > 0) {
            (positiveCount.toFloat() / totalFeedback * 100)
        } else 100.0f

        // 生成优化建议
        val suggestions = mutableListOf<OptimizationSuggestion>()

        // 分析低成功率 Skill
        allSkills.filter { it.successRate < 0.8f }.forEach { skill ->
            suggestions.add(
                OptimizationSuggestion(
                    type = "IMPROVE_SUCCESS_RATE",
                    skillName = skill.name,
                    description = "Skill ${skill.name} 成功率为 ${(skill.successRate * 100).toInt()}%，建议优化",
                    priority = "HIGH"
                )
            )
        }

        // 分析执行时间过长
        allSkills.filter { it.avgExecutionTimeMs > 5000 }.forEach { skill ->
            suggestions.add(
                OptimizationSuggestion(
                    type = "OPTIMIZE_PERFORMANCE",
                    skillName = skill.name,
                    description = "Skill ${skill.name} 平均执行时间 ${skill.avgExecutionTimeMs}ms，建议优化性能",
                    priority = "MEDIUM"
                )
            )
        }

        // 分析未使用的 Skill
        allSkills.filter { it.executionCount == 0 }.forEach { skill ->
            suggestions.add(
                OptimizationSuggestion(
                    type = "DEPRECATE_OR_PROMOTE",
                    skillName = skill.name,
                    description = "Skill ${skill.name} 从未被使用，考虑推广或废弃",
                    priority = "LOW"
                )
            )
        }

        return EvolutionAnalysis(
            totalSkills = allSkills.size,
            totalExecutions = totalExecutions,
            avgSuccessRate = avgSuccessRate,
            overallFeedbackScore = overallFeedbackScore,
            skillPerformance = skillPerformance,
            suggestions = suggestions
        )
    }

    fun getOptimizationRecommendations(): List<String> {
        val analysis = analyzePerformance()
        return analysis.suggestions.map { it.description }
    }

    fun submitFeedback(
        sessionId: String?,
        executionLogId: Long?,
        skillName: String?,
        userId: Long?,
        rating: Int,
        comment: String?,
        isPositive: Boolean
    ): UserFeedback {
        val feedback = UserFeedback(
            sessionId = sessionId,
            executionLogId = executionLogId,
            skillName = skillName,
            userId = userId,
            rating = rating,
            comment = comment,
            feedbackType = "GENERAL",
            isPositive = isPositive
        )

        val savedFeedback = userFeedbackRepository.save(feedback)

        // 更新 Skill 的成功率
        if (skillName != null) {
            updateSkillSuccessRate(skillName)
        }

        return savedFeedback
    }

    private fun updateSkillSuccessRate(skillName: String) {
        val skill = skillDefinitionRepository.findByName(skillName) ?: return

        val logs = skillExecutionLogRepository.findBySkillName(skillName)
        if (logs.isEmpty()) return

        val successCount = logs.count { it.status == "SUCCESS" }
        val successRate = successCount.toFloat() / logs.size

        val updatedSkill = SkillDefinition(
            id = skill.id,
            name = skill.name,
            description = skill.description,
            category = skill.category,
            intentPatterns = skill.intentPatterns,
            parameters = skill.parameters,
            outputSchema = skill.outputSchema,
            status = skill.status,
            executionCount = skill.executionCount,
            successRate = successRate,
            avgExecutionTimeMs = skill.avgExecutionTimeMs,
            version = skill.version,
            createdAt = skill.createdAt,
            updatedAt = skill.updatedAt
        )
        skillDefinitionRepository.save(updatedSkill)

        logger.info("Updated $skillName success rate to ${(successRate * 100).toInt()}%")
    }
}

data class EvolutionAnalysis(
    val totalSkills: Int,
    val totalExecutions: Int,
    val avgSuccessRate: Float,
    val overallFeedbackScore: Float,
    val skillPerformance: List<SkillPerformance>,
    val suggestions: List<OptimizationSuggestion>
)

data class SkillPerformance(
    val name: String,
    val executionCount: Int,
    val successRate: Float,
    val avgExecutionTimeMs: Long
)

data class OptimizationSuggestion(
    val type: String,
    val skillName: String,
    val description: String,
    val priority: String
)
