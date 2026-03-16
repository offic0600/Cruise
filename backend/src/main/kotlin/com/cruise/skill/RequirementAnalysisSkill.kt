package com.cruise.skill

import org.springframework.stereotype.Component

@Component
class RequirementAnalysisSkill : BaseSkill() {
    override fun getName(): String = "RequirementAnalysisSkill"
    override fun getDescription(): String = "需求分析技能，分析 FEATURE 类型工作项的完整性、优先级和依赖关系。"
    override fun getCategory(): String = "ANALYSIS"
    override fun getIntentPatterns(): List<String> = listOf(
        "分析需求",
        "需求完整性",
        "需求优先级",
        "需求依赖",
        "analyze feature",
        "feature analysis"
    )
}
