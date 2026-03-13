package com.cruise.service

import com.cruise.entity.Requirement
import com.cruise.entity.Task
import com.cruise.repository.*
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.time.temporal.ChronoUnit

@Service
class AnalyticsService(
    private val projectRepository: ProjectRepository,
    private val requirementRepository: RequirementRepository,
    private val taskRepository: TaskRepository,
    private val teamMemberRepository: TeamMemberRepository,
    private val defectRepository: DefectRepository
) {
    // ========== 效率度量 ==========

    fun getProjectEfficiency(projectId: Long): Map<String, Any> {
        val requirements = requirementRepository.findByProjectId(projectId)
        val tasks = taskRepository.findAll().filter { it.teamId == projectId }

        val totalRequirements = requirements.size
        val completedRequirements = requirements.count { it.status == "COMPLETED" }
        val totalTasks = tasks.size
        val completedTasks = tasks.count { it.status == "COMPLETED" }

        val totalEstimatedHours = tasks.sumOf { it.estimatedHours.toDouble() }
        val totalActualHours = tasks.sumOf { it.actualHours.toDouble() }

        // 计算平均交付周期（天）
        val completedWithDates = requirements.filter {
            it.status == "COMPLETED" && it.expectedDeliveryDate != null && it.plannedStartDate != null
        }
        val avgDeliveryDays = if (completedWithDates.isNotEmpty()) {
            completedWithDates.map {
                ChronoUnit.DAYS.between(it.plannedStartDate, it.expectedDeliveryDate!!)
            }.average()
        } else 0.0

        val requirementCompletionRate = if (totalRequirements > 0) {
            (completedRequirements.toDouble() / totalRequirements) * 100
        } else 0.0

        val taskCompletionRate = if (totalTasks > 0) {
            (completedTasks.toDouble() / totalTasks) * 100
        } else 0.0

        val hourUtilization = if (totalEstimatedHours > 0) {
            (totalActualHours / totalEstimatedHours) * 100
        } else 0.0

        return mapOf(
            "projectId" to projectId,
            "totalRequirements" to totalRequirements,
            "completedRequirements" to completedRequirements,
            "requirementCompletionRate" to requirementCompletionRate,
            "totalTasks" to totalTasks,
            "completedTasks" to completedTasks,
            "taskCompletionRate" to taskCompletionRate,
            "totalEstimatedHours" to totalEstimatedHours,
            "totalActualHours" to totalActualHours,
            "hourUtilization" to hourUtilization,
            "avgDeliveryDays" to avgDeliveryDays
        )
    }

    fun getTeamRanking(teamId: Long): List<Map<String, Any>> {
        val members = teamMemberRepository.findAll().filter { it.teamId == teamId }
        val tasks = taskRepository.findAll().filter { it.teamId == teamId }

        return members.map { member ->
            val memberTasks = tasks.filter { it.assigneeId == member.id }
            val completedTasks = memberTasks.count { it.status == "COMPLETED" }
            val totalEstimatedHours = memberTasks.sumOf { it.estimatedHours.toDouble() }
            val totalActualHours = memberTasks.sumOf { it.actualHours.toDouble() }

            // 计算效率得分
            val efficiencyScore = if (totalEstimatedHours > 0) {
                (totalActualHours / totalEstimatedHours) * 100
            } else 0.0

            mapOf(
                "memberId" to member.id,
                "memberName" to member.name,
                "memberRole" to member.role,
                "totalTasks" to memberTasks.size,
                "completedTasks" to completedTasks,
                "totalEstimatedHours" to totalEstimatedHours,
                "totalActualHours" to totalActualHours,
                "efficiencyScore" to efficiencyScore
            )
        }.sortedByDescending { (it["completedTasks"] as Int) }
    }

    fun getMemberWorkload(memberId: Long): Map<String, Any> {
        val member = teamMemberRepository.findById(memberId)
            .orElseThrow { IllegalArgumentException("Member not found") }
        val tasks = taskRepository.findAll().filter { it.assigneeId == memberId }

        val totalTasks = tasks.size
        val completedTasks = tasks.count { it.status == "COMPLETED" }
        val inProgressTasks = tasks.count { it.status == "IN_PROGRESS" }
        val pendingTasks = tasks.count { it.status == "PENDING" }

        val totalEstimatedHours = tasks.sumOf { it.estimatedHours.toDouble() }
        val totalActualHours = tasks.sumOf { it.actualHours.toDouble() }

        // 计算工作负载百分比（假设每周标准工时 40 小时）
        val weeklyCapacity = 40.0
        val workloadPercentage = (totalEstimatedHours / weeklyCapacity) * 100

        return mapOf(
            "memberId" to memberId,
            "memberName" to member.name,
            "totalTasks" to totalTasks,
            "completedTasks" to completedTasks,
            "inProgressTasks" to inProgressTasks,
            "pendingTasks" to pendingTasks,
            "totalEstimatedHours" to totalEstimatedHours,
            "totalActualHours" to totalActualHours,
            "workloadPercentage" to workloadPercentage,
            "status" to when {
                workloadPercentage > 120 -> "OVERLOAD"
                workloadPercentage > 80 -> "HIGH"
                workloadPercentage > 50 -> "NORMAL"
                else -> "LOW"
            }
        )
    }

    fun getThroughput(projectId: Long): Map<String, Any> {
        val requirements = requirementRepository.findByProjectId(projectId)

        // 按月统计需求完成量
        val monthlyThroughput = requirements
            .filter { it.status == "COMPLETED" }
            .groupBy { it.expectedDeliveryDate?.month ?: it.plannedStartDate?.month }
            .mapValues { it.value.size }

        val weeklyThroughput = requirements
            .filter { it.status == "COMPLETED" }
            .groupBy { it.expectedDeliveryDate?.let { d -> "${d.year}-${d.monthValue}" } ?: "N/A" }
            .mapValues { it.value.size }

        return mapOf(
            "projectId" to projectId,
            "totalCompleted" to requirements.count { it.status == "COMPLETED" },
            "monthlyThroughput" to monthlyThroughput,
            "weeklyThroughput" to weeklyThroughput,
            "avgWeeklyThroughput" to if (weeklyThroughput.isNotEmpty()) {
                weeklyThroughput.values.average()
            } else 0.0
        )
    }

    // ========== 趋势分析 ==========

    fun forecastRequirements(projectId: Long): Map<String, Any> {
        val requirements = requirementRepository.findByProjectId(projectId)

        // 基于历史数据简单预测
        val completedCount = requirements.count { it.status == "COMPLETED" }
        val inProgressCount = requirements.count { it.status == "IN_PROGRESS" }
        val newCount = requirements.count { it.status == "NEW" }

        // 简单线性预测：基于当前完成速度
        val total = requirements.size
        val completionRate = if (total > 0) completedCount.toDouble() / total else 0.0

        // 预测剩余需求完成时间（周）
        val weeksToComplete = if (completionRate > 0) {
            ((total - completedCount) / (completedCount.coerceAtLeast(1))) * 2 // 假设每2周完成一批
        } else {
            0.0
        }

        return mapOf(
            "projectId" to projectId,
            "total" to total,
            "completed" to completedCount,
            "inProgress" to inProgressCount,
            "new" to newCount,
            "currentCompletionRate" to completionRate * 100,
            "estimatedWeeksToComplete" to weeksToComplete,
            "trend" to when {
                completionRate >= 0.8 -> "POSITIVE"
                completionRate >= 0.5 -> "STABLE"
                completionRate >= 0.3 -> "SLOW"
                else -> "AT_RISK"
            }
        )
    }

    fun getHoursTrend(projectId: Long): Map<String, Any> {
        val tasks = taskRepository.findAll().filter { it.teamId == projectId }

        // 按周统计工时
        val weeklyHours = tasks
            .filter { it.status == "COMPLETED" }
            .groupBy { "${it.plannedEndDate?.year ?: 2026}-${it.plannedEndDate?.monthValue ?: 1}" }
            .mapValues { it.value.sumOf { task -> task.actualHours.toDouble() } }

        val estimatedTotal = tasks.sumOf { it.estimatedHours.toDouble() }
        val actualTotal = tasks.sumOf { it.actualHours.toDouble() }

        val variance = if (estimatedTotal > 0) {
            ((actualTotal - estimatedTotal) / estimatedTotal) * 100
        } else 0.0

        return mapOf(
            "projectId" to projectId,
            "totalEstimatedHours" to estimatedTotal,
            "totalActualHours" to actualTotal,
            "variance" to variance,
            "weeklyHours" to weeklyHours,
            "trend" to when {
                variance < -10 -> "UNDER_ESTIMATED"
                variance > 20 -> "OVER_ESTIMATED"
                else -> "ON_TRACK"
            }
        )
    }

    fun getTeamVelocity(teamId: Long): Map<String, Any> {
        val tasks = taskRepository.findAll().filter { it.teamId == teamId }

        // 计算团队速率（每周完成的任务数/工时）
        val completedTasks = tasks.filter { it.status == "COMPLETED" }
        val inProgressTasks = tasks.filter { it.status == "IN_PROGRESS" }

        val completedStoryPoints = completedTasks.sumOf { it.estimatedHours.toDouble() }
        val inProgressStoryPoints = inProgressTasks.sumOf { it.estimatedHours.toDouble() }

        // 简单速度计算：已完成 + 进行中
        val velocity = completedStoryPoints + (inProgressStoryPoints * 0.5)

        return mapOf(
            "teamId" to teamId,
            "completedTasks" to completedTasks.size,
            "inProgressTasks" to inProgressTasks.size,
            "completedStoryPoints" to completedStoryPoints,
            "inProgressStoryPoints" to inProgressStoryPoints,
            "currentVelocity" to velocity,
            "avgWeeklyVelocity" to velocity / 4, // 假设4周
            "status" to when {
                velocity > 100 -> "HIGH"
                velocity > 50 -> "MEDIUM"
                else -> "LOW"
            }
        )
    }

    // ========== 风险预警 ==========

    fun getProjectRisk(projectId: Long): Map<String, Any> {
        val requirements = requirementRepository.findByProjectId(projectId)
        val tasks = taskRepository.findAll().filter { it.teamId == projectId }
        val defects = defectRepository.findAll().filter { it.projectId == projectId }

        var riskScore = 0
        val riskItems = mutableListOf<Map<String, Any>>()

        // 检查延期风险
        val overdueRequirements = requirements.filter {
            it.expectedDeliveryDate?.isBefore(LocalDate.now()) == true && it.status != "COMPLETED"
        }
        if (overdueRequirements.isNotEmpty()) {
            riskScore += 30
            riskItems.add(mapOf(
                "type" to "DELAY",
                "severity" to "HIGH",
                "description" to "${overdueRequirements.size} requirements overdue"
            ))
        }

        // 检查缺陷风险
        val openDefects = defects.count { it.status == "OPEN" || it.status == "IN_PROGRESS" }
        val highSeverityDefects = defects.count { it.severity == "HIGH" && it.status != "CLOSED" }
        if (highSeverityDefects > 2) {
            riskScore += 25
            riskItems.add(mapOf(
                "type" to "DEFECT",
                "severity" to "HIGH",
                "description" to "$highSeverityDefects high severity defects open"
            ))
        }

        // 检查进度风险
        val totalRequirements = requirements.size
        val completedRequirements = requirements.count { it.status == "COMPLETED" }
        val progressRate = if (totalRequirements > 0) {
            completedRequirements.toDouble() / totalRequirements
        } else 0.0

        if (progressRate < 0.3 && totalRequirements > 3) {
            riskScore += 20
            riskItems.add(mapOf(
                "type" to "PROGRESS",
                "severity" to "MEDIUM",
                "description" to "Progress rate below 30%"
            ))
        }

        // 检查资源风险
        val blockedTasks = tasks.count { it.status == "IN_PROGRESS" && it.progress < 30 && it.remainingDays?.let { r -> r < 1 } == true }
        if (blockedTasks > 0) {
            riskScore += 15
            riskItems.add(mapOf(
                "type" to "BLOCKER",
                "severity" to "MEDIUM",
                "description" to "$blockedTasks tasks blocked"
            ))
        }

        val riskLevel = when {
            riskScore >= 50 -> "HIGH"
            riskScore >= 25 -> "MEDIUM"
            else -> "LOW"
        }

        return mapOf(
            "projectId" to projectId,
            "riskScore" to riskScore,
            "riskLevel" to riskLevel,
            "riskItems" to riskItems,
            "totalRequirements" to totalRequirements,
            "completedRequirements" to completedRequirements,
            "openDefects" to openDefects
        )
    }

    fun getDelayRisk(projectId: Long): List<Map<String, Any>> {
        val requirements = requirementRepository.findByProjectId(projectId)
        val tasks = taskRepository.findAll().filter { it.teamId == projectId }

        val risks = mutableListOf<Map<String, Any>>()

        // 检查可能延期的需求
        requirements.filter { it.status != "COMPLETED" }.forEach { req ->
            val expectedDate = req.expectedDeliveryDate
            val daysUntilDue = expectedDate?.let { ChronoUnit.DAYS.between(LocalDate.now(), it) } ?: Long.MAX_VALUE
            val progress = req.progress

            if (daysUntilDue < 7 && progress < 80) {
                risks.add(mapOf(
                    "type" to "REQUIREMENT",
                    "id" to req.id,
                    "title" to req.title,
                    "progress" to progress,
                    "daysUntilDue" to daysUntilDue,
                    "riskLevel" to when {
                        daysUntilDue < 3 && progress < 50 -> "HIGH"
                        daysUntilDue < 7 && progress < 80 -> "MEDIUM"
                        else -> "LOW"
                    }
                ))
            }
        }

        // 检查可能延期的任务
        tasks.filter { it.status != "COMPLETED" }.forEach { task ->
            val plannedEndDate = task.plannedEndDate
            val daysUntilDue = plannedEndDate?.let { ChronoUnit.DAYS.between(LocalDate.now(), it) } ?: Long.MAX_VALUE

            if (daysUntilDue < 3 && task.progress < 70) {
                risks.add(mapOf(
                    "type" to "TASK",
                    "id" to task.id,
                    "title" to task.title,
                    "progress" to task.progress,
                    "daysUntilDue" to daysUntilDue,
                    "riskLevel" to when {
                        daysUntilDue < 1 && task.progress < 50 -> "HIGH"
                        daysUntilDue < 3 && task.progress < 70 -> "MEDIUM"
                        else -> "LOW"
                    }
                ))
            }
        }

        return risks.sortedByDescending {
            when (it["riskLevel"]) {
                "HIGH" -> 3
                "MEDIUM" -> 2
                else -> 1
            }
        }
    }

    fun getBottleneck(teamId: Long): Map<String, Any> {
        val members = teamMemberRepository.findAll().filter { it.teamId == teamId }
        val tasks = taskRepository.findAll().filter { it.teamId == teamId }

        val bottlenecks = mutableListOf<Map<String, Any>>()

        members.forEach { member ->
            val memberTasks = tasks.filter { it.assigneeId == member.id }
            val overloadedTasks = memberTasks.count {
                it.status == "IN_PROGRESS" && it.estimatedHours > 20
            }

            if (overloadedTasks > 2) {
                bottlenecks.add(mapOf(
                    "memberId" to member.id,
                    "memberName" to member.name,
                    "memberRole" to member.role,
                    "issue" to "HIGH_WORKLOAD",
                    "overloadedTasks" to overloadedTasks,
                    "suggestion" to "Consider redistributing tasks"
                ))
            }
        }

        // 检查未分配任务
        val unassignedTasks = tasks.count { it.assigneeId == null && it.status != "COMPLETED" }
        if (unassignedTasks > 3) {
            bottlenecks.add(mapOf(
                "type" to "UNASSIGNED",
                "count" to unassignedTasks,
                "issue" to "TOO_MANY_UNASSIGNED_TASKS",
                "suggestion" to "Assign tasks to team members"
            ))
        }

        // 检查特定角色瓶颈
        val developerTasks = tasks.count {
            it.status == "IN_PROGRESS" && it.assigneeId?.let { id ->
                members.find { m -> m.id == id }?.role == "DEVELOPER"
            } == true
        }
        val testerTasks = tasks.count {
            it.status == "IN_PROGRESS" && it.assigneeId?.let { id ->
                members.find { m -> m.id == id }?.role == "TESTER"
            } == true
        }

        if (developerTasks > testerTasks * 3) {
            bottlenecks.add(mapOf(
                "type" to "ROLE_IMBALANCE",
                "issue" to "DEVELOPER_TESTER_IMBALANCE",
                "developerTasks" to developerTasks,
                "testerTasks" to testerTasks,
                "suggestion" to "Consider adding more testers or balancing workload"
            ))
        }

        return mapOf(
            "teamId" to teamId,
            "bottleneckCount" to bottlenecks.size,
            "bottlenecks" to bottlenecks,
            "severity" to when {
                bottlenecks.size > 3 -> "HIGH"
                bottlenecks.size > 1 -> "MEDIUM"
                else -> "LOW"
            }
        )
    }
}
