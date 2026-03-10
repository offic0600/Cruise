package com.cruise.skill

import com.cruise.service.RequirementService
import com.cruise.service.TaskService
import org.springframework.stereotype.Component

@Component
class ProgressAssessmentSkill(
    private val requirementService: RequirementService,
    private val taskService: TaskService
) : BaseSkill() {

    override fun getName(): String = "ProgressAssessmentSkill"

    override fun getDescription(): String = "进度评估技能，评估项目整体进度并提供趋势分析"

    override fun getCategory(): String = "ANALYSIS"

    override fun getIntentPatterns(): List<String> = listOf(
        "进度评估",
        "进度分析",
        "进度报告",
        "progress assessment",
        "progress report"
    )
}
