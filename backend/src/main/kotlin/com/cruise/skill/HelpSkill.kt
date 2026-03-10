package com.cruise.skill

import org.springframework.stereotype.Component

@Component
class HelpSkill : BaseSkill() {

    override fun getName(): String = "HelpSkill"

    override fun getDescription(): String = "帮助技能，提供系统功能说明和操作指引"

    override fun getCategory(): String = "HELPER"

    override fun getIntentPatterns(): List<String> = listOf(
        "帮助",
        "help",
        "说明",
        "指引",
        "?"
    )

    override fun execute(input: String): String {
        return buildString {
            appendLine("## Cruise 智能助手帮助")
            appendLine()
            appendLine("您好！我是 Cruise 智能助手，可以帮助您完成以下任务：")
            appendLine()
            appendLine("### 可用技能")
            appendLine("- **RequirementAnalysisSkill**: 需求分析技能，分析需求完整性、优先级、依赖关系")
            appendLine("- **TaskAssignmentSkill**: 任务分配技能，根据团队负载和技能匹配推荐最佳人选")
            appendLine("- **RiskAlertSkill**: 风险预警技能，识别项目中的潜在风险并提供预警")
            appendLine("- **ProgressAssessmentSkill**: 进度评估技能，评估项目整体进度并提供趋势分析")
            appendLine("- **TeamOptimizationSkill**: 团队优化技能，分析团队负载并提供优化建议")
            appendLine("- **DataAggregationSkill**: 数据聚合技能，汇总多数据源信息提供全景视图")
            appendLine("- **EvolutionSkill**: 持续进化技能，分析系统性能并提供优化建议")
            appendLine("- **HelpSkill**: 帮助技能，提供系统功能说明和操作指引")
            appendLine()
            appendLine("### 示例问题")
            appendLine("- 分析当前项目需求")
            appendLine("- 查看团队成员负载")
            appendLine("- 评估项目进度")
            appendLine("- 有什么风险需要关注？")
            appendLine("- 汇总项目数据")
            appendLine("- 查看系统优化建议")
            appendLine()
            appendLine("### 如何使用")
            appendLine("直接输入您的问题，我会自动识别意图并提供相应的帮助。")
        }
    }
}
