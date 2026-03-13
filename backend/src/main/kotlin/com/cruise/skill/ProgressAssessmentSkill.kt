package com.cruise.skill

import org.springframework.stereotype.Component

@Component
class ProgressAssessmentSkill : BaseSkill() {
    override fun getName(): String = "ProgressAssessmentSkill"
    override fun getDescription(): String = "进度评估技能，分析统一工作项的执行进度和趋势。"
    override fun getCategory(): String = "ANALYSIS"
    override fun getIntentPatterns(): List<String> = listOf(
        "进度评估",
        "进度分析",
        "进度报告",
        "progress assessment",
        "progress report"
    )
}
