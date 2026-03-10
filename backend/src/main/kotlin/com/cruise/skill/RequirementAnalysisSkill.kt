package com.cruise.skill

import com.cruise.service.RequirementService
import org.springframework.stereotype.Component

@Component
class RequirementAnalysisSkill(
    private val requirementService: RequirementService
) : BaseSkill() {

    override fun getName(): String = "RequirementAnalysisSkill"

    override fun getDescription(): String = "需求分析技能，分析需求完整性、优先级、依赖关系"

    override fun getCategory(): String = "ANALYSIS"

    override fun getIntentPatterns(): List<String> = listOf(
        "分析需求",
        "需求完整性",
        "需求优先级",
        "需求依赖",
        "analyze requirement",
        "requirement analysis"
    )

    override fun execute(input: String): String {
        return try {
            val requirements = requirementService.findAll()
            if (requirements.isEmpty()) {
                return "当前系统暂无需求数据，请先添加需求后再进行分析。"
            }

            val statusCount = requirements.groupBy { it.status }.mapValues { it.value.size }
            val priorityCount = requirements.groupBy { it.priority }.mapValues { it.value.size }

            val analysis = buildString {
                appendLine("## 需求分析报告")
                appendLine()
                appendLine("### 需求概览")
                appendLine("- 总需求数: ${requirements.size}")
                appendLine()
                appendLine("### 状态分布")
                statusCount.forEach { (status, count) ->
                    appendLine("- $status: $count")
                }
                appendLine()
                appendLine("### 优先级分布")
                priorityCount.forEach { (priority, count) ->
                    appendLine("- $priority: $count")
                }
                appendLine()
                appendLine("### 建议")
                if (statusCount["NEW"] ?: 0 > requirements.size / 2) {
                    appendLine("- 有较多新需求待处理，建议优先安排评审")
                }
                if (priorityCount["HIGH"] ?: 0 > 5) {
                    appendLine("- 高优先级需求较多，建议重新评估优先级")
                }
            }
            analysis
        } catch (e: Exception) {
            "需求分析失败: ${e.message}"
        }
    }
}
