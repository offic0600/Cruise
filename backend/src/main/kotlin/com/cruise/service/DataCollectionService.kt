package com.cruise.service

import com.cruise.entity.Requirement
import com.cruise.entity.Task
import com.cruise.entity.TeamMember
import com.cruise.entity.Defect
import com.cruise.repository.ProjectRepository
import com.cruise.repository.RequirementRepository
import com.cruise.repository.TaskRepository
import com.cruise.repository.TeamMemberRepository
import com.cruise.repository.DefectRepository
import org.springframework.stereotype.Service

/**
 * 数据收集服务 - 为 LLM 提供项目数据
 */
@Service
class DataCollectionService(
    private val projectRepository: ProjectRepository,
    private val requirementRepository: RequirementRepository,
    private val taskRepository: TaskRepository,
    private val teamMemberRepository: TeamMemberRepository,
    private val defectRepository: DefectRepository
) {

    /**
     * 获取完整的项目数据摘要
     */
    fun getProjectSummary(): String {
        return buildString {
            appendLine("## 项目数据摘要")
            appendLine()

            // 项目信息
            val projects = projectRepository.findAll()
            appendLine("### 项目")
            if (projects.isEmpty()) {
                appendLine("- 暂无项目数据")
            } else {
                projects.forEach { project ->
                    appendLine("- ${project.name} (${project.status})")
                }
            }
            appendLine()

            // 需求统计
            val requirements = requirementRepository.findAll()
            appendLine("### 需求 (${requirements.size}个)")
            if (requirements.isNotEmpty()) {
                val statusCount = requirements.groupBy { it.status }.mapValues { it.value.size }
                statusCount.forEach { (status, count) ->
                    appendLine("  - $status: $count")
                }
            }
            appendLine()

            // 任务统计
            val tasks = taskRepository.findAll()
            appendLine("### 任务 (${tasks.size}个)")
            if (tasks.isNotEmpty()) {
                val statusCount = tasks.groupBy { it.status }.mapValues { it.value.size }
                statusCount.forEach { (status, count) ->
                    appendLine("  - $status: $count")
                }
            }
            appendLine()

            // 团队成员
            val members = teamMemberRepository.findAll()
            appendLine("### 团队成员 (${members.size}人)")
            if (members.isNotEmpty()) {
                members.forEach { member ->
                    val memberTasks = tasks.filter { it.assigneeId == member.id }
                    val completed = memberTasks.count { it.status == "DONE" }
                    appendLine("  - ${member.name} (${member.role}): ${memberTasks.size} 任务, $completed 已完成")
                }
            }
            appendLine()

            // 缺陷统计
            val defects = defectRepository.findAll()
            appendLine("### 缺陷 (${defects.size}个)")
            if (defects.isNotEmpty()) {
                val statusCount = defects.groupBy { it.status }.mapValues { it.value.size }
                statusCount.forEach { (status, count) ->
                    appendLine("  - $status: $count")
                }
            }
        }
    }

    /**
     * 获取需求详情
     */
    fun getRequirements(): List<Requirement> = requirementRepository.findAll()

    /**
     * 获取任务详情
     */
    fun getTasks(): List<Task> = taskRepository.findAll()

    /**
     * 获取团队成员
     */
    fun getTeamMembers(): List<TeamMember> = teamMemberRepository.findAll()

    /**
     * 获取缺陷列表
     */
    fun getDefects(): List<Defect> = defectRepository.findAll()
}
