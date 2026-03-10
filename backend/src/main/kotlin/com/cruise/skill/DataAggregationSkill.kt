package com.cruise.skill

import com.cruise.service.DefectService
import com.cruise.service.RequirementService
import com.cruise.service.TaskService
import com.cruise.service.TeamMemberService
import org.springframework.stereotype.Component

@Component
class DataAggregationSkill(
    private val requirementService: RequirementService,
    private val taskService: TaskService,
    private val teamMemberService: TeamMemberService,
    private val defectService: DefectService
) : BaseSkill() {

    override fun getName(): String = "DataAggregationSkill"

    override fun getDescription(): String = "数据聚合技能，汇总多数据源信息提供全景视图"

    override fun getCategory(): String = "ANALYSIS"

    override fun getIntentPatterns(): List<String> = listOf(
        "数据汇总",
        "数据统计",
        "全景视图",
        "data aggregation",
        "data summary"
    )

    override fun execute(input: String): String {
        return try {
            val requirements = requirementService.findAll()
            val tasks = taskService.findAll()
            val teamMembers = teamMemberService.findAll()
            val defects = defectService.getAll()

            // 计算各项指标
            val reqCompleted = requirements.count { it.status == "COMPLETED" || it.status == "DONE" }
            val taskCompleted = tasks.count { it.status == "DONE" }
            val defectOpen = defects.count { it.status != "CLOSED" && it.status != "RESOLVED" }

            val reqProgress = if (requirements.isNotEmpty()) {
                requirements.map { it.progress }.average()
            } else 0.0

            buildString {
                appendLine("## 项目全景数据汇总")
                appendLine()
                appendLine("### 核心指标")
                appendLine("| 指标 | 数值 |")
                appendLine("|------|------|")
                appendLine("| 需求总数 | ${requirements.size} |")
                appendLine("| 需求完成数 | $reqCompleted |")
                appendLine("| 任务总数 | ${tasks.size} |")
                appendLine("| 任务完成数 | $taskCompleted |")
                appendLine("| 团队人数 | ${teamMembers.size} |")
                appendLine("| 待解决缺陷 | $defectOpen |")
                appendLine()
                appendLine("### 进度概览")
                appendLine("- 需求平均进度: ${reqProgress.toInt()}%")
                val completionRate = if (requirements.isNotEmpty()) {
                    (reqCompleted.toFloat() / requirements.size * 100).toInt()
                } else 0
                appendLine("- 需求完成率: $completionRate%")
                val taskCompletionRate = if (tasks.isNotEmpty()) {
                    (taskCompleted.toFloat() / tasks.size * 100).toInt()
                } else 0
                appendLine("- 任务完成率: $taskCompletionRate%")
                appendLine()
                appendLine("### 缺陷状态")
                val defectByStatus = defects.groupBy { it.status }.mapValues { entry -> entry.value.size }
                defectByStatus.forEach { entry ->
                    appendLine("- ${entry.key}: ${entry.value}")
                }
                appendLine()
                appendLine("### 数据来源")
                appendLine("- 需求系统: ${requirements.size} 条")
                appendLine("- 任务系统: ${tasks.size} 条")
                appendLine("- 团队系统: ${teamMembers.size} 条")
                appendLine("- 缺陷系统: ${defects.size} 条")
            }
        } catch (e: Exception) {
            "数据聚合失败: ${e.message}"
        }
    }
}
