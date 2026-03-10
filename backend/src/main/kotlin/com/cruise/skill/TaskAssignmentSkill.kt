package com.cruise.skill

import com.cruise.service.TaskService
import org.springframework.stereotype.Component

@Component
class TaskAssignmentSkill(
    private val taskService: TaskService
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
}
