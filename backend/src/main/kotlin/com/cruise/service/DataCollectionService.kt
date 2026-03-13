package com.cruise.service

import com.cruise.entity.TeamMember
import com.cruise.repository.ProjectRepository
import com.cruise.repository.TeamMemberRepository
import org.springframework.stereotype.Service

@Service
class DataCollectionService(
    private val projectRepository: ProjectRepository,
    private val issueService: IssueService,
    private val teamMemberRepository: TeamMemberRepository
) {

    fun getProjectSummary(): String {
        val projects = projectRepository.findAll()
        val features = issueService.findAll(IssueQuery(type = "FEATURE"))
        val tasks = issueService.findAll(IssueQuery(type = "TASK"))
        val defects = issueService.findAll(IssueQuery(type = "BUG"))
        val members = teamMemberRepository.findAll()

        return buildString {
            appendLine("## 项目数据摘要")
            appendLine()

            appendLine("### 项目")
            if (projects.isEmpty()) {
                appendLine("- 暂无项目数据")
            } else {
                projects.forEach { project ->
                    appendLine("- ${project.name} (${project.status})")
                }
            }
            appendLine()

            appendLine("### FEATURE (${features.size} 项)")
            features.groupBy { it.state }.forEach { (state, items) ->
                appendLine("- $state: ${items.size}")
            }
            appendLine()

            appendLine("### TASK (${tasks.size} 项)")
            tasks.groupBy { it.state }.forEach { (state, items) ->
                appendLine("- $state: ${items.size}")
            }
            appendLine()

            appendLine("### BUG (${defects.size} 项)")
            defects.groupBy { it.state }.forEach { (state, items) ->
                appendLine("- $state: ${items.size}")
            }
            appendLine()

            appendLine("### 团队成员 (${members.size} 人)")
            members.forEach { member ->
                val memberTasks = tasks.filter { it.assigneeId == member.id }
                val completed = memberTasks.count { it.state == "DONE" }
                appendLine("- ${member.name} (${member.role}): ${memberTasks.size} 项任务，${completed} 项已完成")
            }
        }
    }

    fun getRequirements(): List<IssueDto> =
        issueService.findAll(IssueQuery(type = "FEATURE"))

    fun getTasks(): List<IssueDto> =
        issueService.findAll(IssueQuery(type = "TASK"))

    fun getTeamMembers(): List<TeamMember> =
        teamMemberRepository.findAll()

    fun getDefects(): List<IssueDto> =
        issueService.findAll(IssueQuery(type = "BUG"))
}
