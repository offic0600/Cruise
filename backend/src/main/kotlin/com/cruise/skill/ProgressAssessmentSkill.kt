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

    override fun execute(input: String): String {
        return try {
            val requirements = requirementService.findAll()
            val tasks = taskService.findAll()

            // 计算需求进度
            val reqProgress = if (requirements.isNotEmpty()) {
                requirements.map { it.progress }.average()
            } else 0.0

            // 计算任务进度
            val taskProgress = if (tasks.isNotEmpty()) {
                tasks.map { task ->
                    when (task.status) {
                        "DONE" -> 100
                        "IN_PROGRESS" -> 50
                        "TODO" -> 0
                        else -> 25
                    }
                }.average()
            } else 0.0

            // 状态分布
            val taskStatusCount = tasks.groupBy { it.status }.mapValues { it.value.size }
            val reqStatusCount = requirements.groupBy { it.status }.mapValues { it.value.size }

            // 总体进度
            val overallProgress = (reqProgress * 0.6 + taskProgress * 0.4)

            buildString {
                appendLine("## 进度评估报告")
                appendLine()
                appendLine("### 整体进度: ${overallProgress.toInt()}%")
                appendLine()
                appendLine("### 需求进度")
                appendLine("- 平均进度: ${reqProgress.toInt()}%")
                appendLine("- 需求总数: ${requirements.size}")
                appendLine("#### 状态分布")
                reqStatusCount.forEach { (status, count) ->
                    val percentage = if (requirements.isNotEmpty()) {
                        (count * 100 / requirements.size)
                    } else 0
                    appendLine("  - $status: $count (${percentage}%)")
                }
                appendLine()
                appendLine("### 任务进度")
                appendLine("- 平均进度: ${taskProgress.toInt()}%")
                appendLine("- 任务总数: ${tasks.size}")
                appendLine("#### 状态分布")
                taskStatusCount.forEach { (status, count) ->
                    val percentage = if (tasks.isNotEmpty()) {
                        (count * 100 / tasks.size)
                    } else 0
                    appendLine("  - $status: $count (${percentage}%)")
                }
                appendLine()
                appendLine("### 趋势分析")
                when {
                    overallProgress >= 80 -> appendLine("项目接近完成，建议进入收尾阶段")
                    overallProgress >= 50 -> appendLine("项目进展良好，继续保持")
                    overallProgress >= 30 -> appendLine("项目进度适中，需关注后续资源投入")
                    else -> appendLine("项目起步阶段，建议加快进度")
                }
            }
        } catch (e: Exception) {
            "进度评估失败: ${e.message}"
        }
    }
}
