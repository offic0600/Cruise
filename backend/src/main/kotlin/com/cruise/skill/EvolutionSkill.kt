package com.cruise.skill

import com.cruise.service.EvolutionService
import org.springframework.stereotype.Component

@Component
class EvolutionSkill(
    private val evolutionService: EvolutionService
) : BaseSkill() {

    override fun getName(): String = "EvolutionSkill"

    override fun getDescription(): String = "持续进化技能，分析系统性能并提供优化建议"

    override fun getCategory(): String = "EVOLUTION"

    override fun getIntentPatterns(): List<String> = listOf(
        "进化",
        "优化建议",
        "系统优化",
        "evolution",
        "optimization"
    )

    override fun execute(input: String): String {
        return try {
            val analysis = evolutionService.analyzePerformance()

            buildString {
                appendLine("## 持续进化分析报告")
                appendLine()
                appendLine("### 整体指标")
                appendLine("- 注册 Skill 数: ${analysis.totalSkills}")
                appendLine("- 总执行次数: ${analysis.totalExecutions}")
                appendLine("- 平均成功率: ${(analysis.avgSuccessRate * 100).toInt()}%")
                appendLine("- 用户满意度: ${analysis.overallFeedbackScore.toInt()}%")
                appendLine()
                appendLine("### Skill 性能")
                if (analysis.skillPerformance.isEmpty()) {
                    appendLine("暂无执行数据")
                } else {
                    analysis.skillPerformance.forEach { perf ->
                        appendLine("- ${perf.name}:")
                        appendLine("  - 执行次数: ${perf.executionCount}")
                        appendLine("  - 成功率: ${(perf.successRate * 100).toInt()}%")
                        appendLine("  - 平均耗时: ${perf.avgExecutionTimeMs}ms")
                    }
                }
                appendLine()
                appendLine("### 优化建议")
                if (analysis.suggestions.isEmpty()) {
                    appendLine("系统运行良好，暂无优化建议")
                } else {
                    analysis.suggestions.forEach { suggestion ->
                        val priorityIcon = when (suggestion.priority) {
                            "HIGH" -> "🔴"
                            "MEDIUM" -> "🟡"
                            else -> "🟢"
                        }
                        appendLine("$priorityIcon ${suggestion.description}")
                    }
                }
            }
        } catch (e: Exception) {
            "进化分析失败: ${e.message}"
        }
    }
}
