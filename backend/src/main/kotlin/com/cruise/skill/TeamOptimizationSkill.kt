package com.cruise.skill

import com.cruise.service.TaskService
import com.cruise.service.TeamMemberService
import org.springframework.stereotype.Component

@Component
class TeamOptimizationSkill(
    private val teamMemberService: TeamMemberService,
    private val taskService: TaskService
) : BaseSkill() {

    override fun getName(): String = "TeamOptimizationSkill"

    override fun getDescription(): String = "团队优化技能，分析团队负载并提供优化建议"

    override fun getCategory(): String = "TEAM_MANAGEMENT"

    override fun getIntentPatterns(): List<String> = listOf(
        "团队优化",
        "团队分析",
        "负载均衡",
        "team optimization",
        "team analysis"
    )

    override fun execute(input: String): String {
        return try {
            val teamMembers = teamMemberService.findAll()
            val tasks = taskService.findAll()

            // 计算每个成员的负载
            val memberStats = teamMembers.map { member ->
                val memberTasks = tasks.filter { it.assigneeId == member.id }
                val completedTasks = memberTasks.count { it.status == "DONE" }
                val inProgressTasks = memberTasks.count { it.status == "IN_PROGRESS" }

                MemberStat(
                    name = member.name ?: "未知",
                    role = member.role ?: "未知",
                    totalTasks = memberTasks.size,
                    completedTasks = completedTasks,
                    inProgressTasks = inProgressTasks,
                    completionRate = if (memberTasks.isNotEmpty()) {
                        completedTasks.toFloat() / memberTasks.size
                    } else 0f
                )
            }

            val avgCompletionRate = if (memberStats.isNotEmpty()) {
                memberStats.map { it.completionRate }.average()
            } else 0.0

            buildString {
                appendLine("## 团队优化分析报告")
                appendLine()
                appendLine("### 团队概况")
                appendLine("- 团队人数: ${teamMembers.size}")
                appendLine("- 任务总数: ${tasks.size}")
                appendLine("- 平均完成率: ${(avgCompletionRate * 100).toInt()}%")
                appendLine()
                appendLine("### 成员负载")
                memberStats.sortedByDescending { it.totalTasks }.forEach { stat ->
                    val status = when {
                        stat.completionRate >= 0.8f -> "【高效】"
                        stat.completionRate >= 0.5f -> "【正常】"
                        else -> "【待提升】"
                    }
                    appendLine("- ${stat.name} (${stat.role}): ${stat.totalTasks} 个任务, ${stat.completedTasks} 已完成 $status")
                }
                appendLine()
                appendLine("### 优化建议")
                val overloaded = memberStats.filter { it.totalTasks > 5 }
                val underloaded = memberStats.filter { it.totalTasks < 2 }

                if (overloaded.isNotEmpty()) {
                    appendLine("- 以下成员负载较重，建议分配任务给其他人:")
                    overloaded.forEach { appendLine("  - ${it.name}") }
                }

                if (underloaded.isNotEmpty()) {
                    appendLine("- 以下成员可承担更多任务:")
                    underloaded.forEach { appendLine("  - ${it.name}") }
                }

                if (overloaded.isEmpty() && underloaded.isEmpty()) {
                    appendLine("- 团队负载均衡，运行良好")
                }
            }
        } catch (e: Exception) {
            "团队优化分析失败: ${e.message}"
        }
    }
}

data class MemberStat(
    val name: String,
    val role: String,
    val totalTasks: Int,
    val completedTasks: Int,
    val inProgressTasks: Int,
    val completionRate: Float
)
