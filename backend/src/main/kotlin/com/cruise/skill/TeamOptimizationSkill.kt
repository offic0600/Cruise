package com.cruise.skill

import org.springframework.stereotype.Component

@Component
class TeamOptimizationSkill : BaseSkill() {
    override fun getName(): String = "TeamOptimizationSkill"
    override fun getDescription(): String = "团队优化技能，分析成员负载并给出组织优化建议。"
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
