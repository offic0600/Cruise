package com.cruise.skill

import com.cruise.service.TaskService
import com.cruise.service.TeamMemberService
import org.springframework.stereotype.Component

@Component
class TaskAssignmentSkill(
    private val taskService: TaskService,
    private val teamMemberService: TeamMemberService
) : BaseSkill() {

    override fun getName(): String = "TaskAssignmentSkill"

    override fun getDescription(): String = "任务分配技能，根据团队负载和技能匹配推荐最佳人选"

    override fun getCategory(): String = "TASK_MANAGEMENT"

    override fun getIntentPatterns(): List<String> = listOf(
        "分配任务",
        "任务指派",
        "assign task",
        "task assignment"
    )

    override fun execute(input: String): String {
        return try {
            val teamMembers = teamMemberService.findAll()
            val tasks = taskService.findAll()

            // 统计每个成员的负载
            val memberLoad = teamMembers.associate { member ->
                val memberTasks = tasks.filter { it.assigneeId == member.id }
                member.name to memberTasks.size
            }

            val availableMembers = memberLoad.filter { entry -> entry.value < 3 }

            buildString {
                appendLine("## 任务分配建议")
                appendLine()
                appendLine("### 团队负载情况")
                memberLoad.forEach { entry ->
                    val name = entry.key
                    val count = entry.value
                    val status = when {
                        count >= 5 -> "【忙碌】"
                        count >= 3 -> "【适中】"
                        else -> "【空闲】"
                    }
                    appendLine("- $name: $count 个任务 $status")
                }
                appendLine()
                if (availableMembers.isNotEmpty()) {
                    appendLine("### 推荐分配人员")
                    availableMembers.entries.take(3).forEach { entry ->
                        appendLine("- ${entry.key} (当前负载: ${entry.value})")
                    }
                } else {
                    appendLine("### 建议")
                    appendLine("- 所有成员负载较高，建议先完成现有任务或增加人手")
                }
            }
        } catch (e: Exception) {
            "任务分配分析失败: ${e.message}"
        }
    }
}
