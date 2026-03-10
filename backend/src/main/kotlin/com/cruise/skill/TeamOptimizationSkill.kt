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
}

data class MemberStat(
    val name: String,
    val role: String,
    val totalTasks: Int,
    val completedTasks: Int,
    val inProgressTasks: Int,
    val completionRate: Float
)
