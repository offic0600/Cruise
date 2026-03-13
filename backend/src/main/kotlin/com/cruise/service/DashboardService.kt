package com.cruise.service

import com.cruise.entity.Project
import com.cruise.entity.Requirement
import com.cruise.entity.Task
import com.cruise.entity.TeamMember
import com.cruise.repository.ProjectRepository
import com.cruise.repository.TeamMemberRepository
import org.springframework.stereotype.Service
import java.time.LocalDateTime

data class ProjectOverview(
    val projectId: Long,
    val projectName: String,
    val projectStatus: String,
    val totalRequirements: Int,
    val completedRequirements: Int,
    val totalTasks: Int,
    val completedTasks: Int,
    val totalEstimatedHours: Float,
    val totalActualHours: Float,
    val completionRate: Float
)

data class TeamLoad(
    val memberId: Long,
    val memberName: String,
    val memberRole: String,
    val assignedTasks: Int,
    val completedTasks: Int,
    val totalEstimatedHours: Float,
    val totalActualHours: Float,
    val loadPercentage: Float
)

@Service
class DashboardService(
    private val projectRepository: ProjectRepository,
    private val issueService: IssueService,
    private val teamMemberRepository: TeamMemberRepository
) {

    fun getProjectOverview(projectId: Long): ProjectOverview {
        val project = projectRepository.findById(projectId)
            .orElseThrow { IllegalArgumentException("Project not found") }

        val requirements = issueService.findAll(IssueQuery(type = "FEATURE", projectId = projectId))
        val completedRequirements = requirements.count { it.state == "DONE" }

        val allTasks = issueService.findAll(IssueQuery(type = "TASK", projectId = projectId))
        val completedTasks = allTasks.count { it.state == "DONE" }

        val totalEstimatedHours = allTasks.sumOf { it.estimatedHours.toDouble() }.toFloat()
        val totalActualHours = allTasks.sumOf { it.actualHours.toDouble() }.toFloat()

        val completionRate = if (allTasks.isNotEmpty()) {
            (completedTasks.toFloat() / allTasks.size) * 100
        } else {
            0f
        }

        return ProjectOverview(
            projectId = project.id,
            projectName = project.name,
            projectStatus = project.status,
            totalRequirements = requirements.size,
            completedRequirements = completedRequirements,
            totalTasks = allTasks.size,
            completedTasks = completedTasks,
            totalEstimatedHours = totalEstimatedHours,
            totalActualHours = totalActualHours,
            completionRate = completionRate
        )
    }

    fun getTeamLoad(teamId: Long): List<TeamLoad> {
        val teamMembers = teamMemberRepository.findByTeamId(teamId)

        return teamMembers.map { member ->
            val assignedTasks = issueService.findAll(IssueQuery(type = "TASK", assigneeId = member.id))
            val completedTasks = assignedTasks.count { it.state == "DONE" }

            val totalEstimatedHours = assignedTasks.sumOf { it.estimatedHours.toDouble() }.toFloat()
            val totalActualHours = assignedTasks.sumOf { it.actualHours.toDouble() }.toFloat()

            // Assume 40 hours per week as 100% load
            val loadPercentage = (totalEstimatedHours / 40f) * 100

            TeamLoad(
                memberId = member.id,
                memberName = member.name,
                memberRole = member.role,
                assignedTasks = assignedTasks.size,
                completedTasks = completedTasks,
                totalEstimatedHours = totalEstimatedHours,
                totalActualHours = totalActualHours,
                loadPercentage = loadPercentage
            )
        }
    }
}
