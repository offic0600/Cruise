package com.cruise.service

import com.cruise.entity.Requirement
import com.cruise.entity.Task
import com.cruise.entity.TeamMember
import com.cruise.repository.RequirementRepository
import com.cruise.repository.TaskRepository
import com.cruise.repository.TeamMemberRepository
import org.springframework.stereotype.Service

data class AiQueryRequest(
    val query: String
)

data class AiQueryResponse(
    val answer: String,
    val data: Map<String, Any>? = null
)

@Service
class AiQueryService(
    private val requirementRepository: RequirementRepository,
    private val taskRepository: TaskRepository,
    private val teamMemberRepository: TeamMemberRepository
) {
    fun processQuery(query: String): AiQueryResponse {
        val lowerQuery = query.lowercase()

        return when {
            // 需求统计
            lowerQuery.contains("需求") && lowerQuery.contains("多少") -> {
                val requirements = requirementRepository.findAll()
                val byStatus = requirements.groupBy { it.status }
                val answer = buildString {
                    appendLine("📊 当前共有 ${requirements.size} 个需求：")
                    byStatus.forEach { (status, reqs) ->
                        appendLine("  - $status: ${reqs.size} 个")
                    }
                }
                AiQueryResponse(answer, mapOf("requirements" to requirements.size, "byStatus" to byStatus.mapValues { it.value.size }))
            }

            // 任务统计
            lowerQuery.contains("任务") && lowerQuery.contains("多少") -> {
                val tasks = taskRepository.findAll()
                val byStatus = tasks.groupBy { it.status }
                val answer = buildString {
                    appendLine("📋 当前共有 ${tasks.size} 个任务：")
                    byStatus.forEach { (status, tks) ->
                        appendLine("  - $status: ${tks.size} 个")
                    }
                }
                AiQueryResponse(answer, mapOf("tasks" to tasks.size, "byStatus" to byStatus.mapValues { it.value.size }))
            }

            // 交付率 / 完成率
            lowerQuery.contains("交付") || lowerQuery.contains("完成率") -> {
                val requirements = requirementRepository.findAll()
                val tasks = taskRepository.findAll()
                val reqCompleted = requirements.count { it.status == "COMPLETED" || it.status == "DONE" }
                val taskCompleted = tasks.count { it.status == "COMPLETED" || it.status == "DONE" }
                val reqRate = if (requirements.isNotEmpty()) (reqCompleted.toFloat() / requirements.size * 100).toInt() else 0
                val taskRate = if (tasks.isNotEmpty()) (taskCompleted.toFloat() / tasks.size * 100).toInt() else 0
                val answer = buildString {
                    appendLine("📈 交付数据概览：")
                    appendLine("  - 需求完成率: $reqRate% ($reqCompleted/${requirements.size})")
                    appendLine("  - 任务完成率: $taskRate ($taskCompleted/${tasks.size})")
                }
                AiQueryResponse(answer, mapOf("requirementCompletionRate" to reqRate, "taskCompletionRate" to taskRate))
            }

            // 团队成员
            lowerQuery.contains("团队") || lowerQuery.contains("成员") -> {
                val members = teamMemberRepository.findAll()
                val answer = buildString {
                    appendLine("👥 团队共有 ${members.size} 名成员：")
                    members.forEach { member ->
                        appendLine("  - ${member.name} (${member.role})")
                    }
                }
                AiQueryResponse(answer, mapOf("members" to members.map { mapOf("name" to it.name, "role" to it.role) }))
            }

            // 进度 / 状态
            lowerQuery.contains("进度") || lowerQuery.contains("状态") -> {
                val requirements = requirementRepository.findAll()
                val tasks = taskRepository.findAll()
                val reqInProgress = requirements.count { it.status == "IN_PROGRESS" }
                val taskInProgress = tasks.count { it.status == "IN_PROGRESS" }
                val answer = buildString {
                    appendLine("⚡ 当前进度：")
                    appendLine("  - 进行中的需求: $reqInProgress 个")
                    appendLine("  - 进行中的任务: $taskInProgress 个")
                    appendLine("  - 需求总数: ${requirements.size}")
                    appendLine("  - 任务总数: ${tasks.size}")
                }
                AiQueryResponse(answer, mapOf("requirements" to requirements.size, "tasks" to tasks.size))
            }

            // 工时统计
            lowerQuery.contains("工时") || lowerQuery.contains("小时") -> {
                val tasks = taskRepository.findAll()
                val estimatedHours = tasks.sumOf { it.estimatedHours.toDouble() }
                val actualHours = tasks.sumOf { it.actualHours.toDouble() }
                val answer = buildString {
                    appendLine("⏱️ 工时统计：")
                    appendLine("  - 预计工时: ${estimatedHours.toInt()} 小时")
                    appendLine("  - 实际工时: ${actualHours.toInt()} 小时")
                    val diff = actualHours - estimatedHours
                    if (diff > 0) {
                        appendLine("  - 超时: ${diff.toInt()} 小时")
                    } else if (diff < 0) {
                        appendLine("  - 剩余: ${(-diff).toInt()} 小时")
                    }
                }
                AiQueryResponse(answer, mapOf("estimatedHours" to estimatedHours, "actualHours" to actualHours))
            }

            // 帮助
            lowerQuery.contains("帮助") || lowerQuery.contains("能查什么") -> {
                val answer = buildString {
                    appendLine("🤖 我可以帮你查询以下数据：")
                    appendLine("  - 需求数量及状态分布")
                    appendLine("  - 任务数量及状态分布")
                    appendLine("  - 交付率/完成率")
                    appendLine("  - 团队成员列表")
                    appendLine("  - 项目进度概览")
                    appendLine("  - 工时统计")
                }
                AiQueryResponse(answer)
            }

            else -> {
                AiQueryResponse("抱歉，我暂时无法理解你的问题。你可以尝试问：\n  - 当前有多少需求？\n  - 任务完成率是多少？\n  - 团队有多少人？\n  - 工时统计")
            }
        }
    }
}
