package com.cruise.service

import com.cruise.repository.TeamMemberRepository
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.time.temporal.ChronoUnit

@Service
class AnalyticsService(
    private val issueService: IssueService,
    private val teamMemberRepository: TeamMemberRepository
) {
    private val objectMapper = jacksonObjectMapper()

    fun getProjectEfficiency(projectId: Long): Map<String, Any> {
        val features = issueService.findAll(IssueQuery(type = "FEATURE", projectId = projectId))
        val tasks = issueService.findAll(IssueQuery(type = "TASK", projectId = projectId))

        val completedFeatures = features.count { it.state == "DONE" }
        val completedTasks = tasks.count { it.state == "DONE" }
        val totalEstimatedHours = tasks.sumOf { it.estimatedHours.toDouble() }
        val totalActualHours = tasks.sumOf { it.actualHours.toDouble() }

        val avgDeliveryDays = features
            .filter { it.state == "DONE" && it.plannedStartDate != null && it.plannedEndDate != null }
            .map {
                ChronoUnit.DAYS.between(LocalDate.parse(it.plannedStartDate), LocalDate.parse(it.plannedEndDate))
            }
            .average()
            .takeUnless(Double::isNaN)
            ?: 0.0

        return mapOf(
            "projectId" to projectId,
            "totalRequirements" to features.size,
            "completedRequirements" to completedFeatures,
            "requirementCompletionRate" to percentage(completedFeatures, features.size),
            "totalTasks" to tasks.size,
            "completedTasks" to completedTasks,
            "taskCompletionRate" to percentage(completedTasks, tasks.size),
            "totalEstimatedHours" to totalEstimatedHours,
            "totalActualHours" to totalActualHours,
            "hourUtilization" to if (totalEstimatedHours > 0) (totalActualHours / totalEstimatedHours) * 100 else 0.0,
            "avgDeliveryDays" to avgDeliveryDays
        )
    }

    fun getTeamRanking(teamId: Long): List<Map<String, Any>> {
        val members = teamMemberRepository.findByTeamId(teamId)
        val tasks = issueService.findAll(IssueQuery(type = "TASK")).filter { it.teamId == teamId }

        return members.map { member ->
            val memberTasks = tasks.filter { it.assigneeId == member.id }
            val completedTasks = memberTasks.count { it.state == "DONE" }
            val totalEstimatedHours = memberTasks.sumOf { it.estimatedHours.toDouble() }
            val totalActualHours = memberTasks.sumOf { it.actualHours.toDouble() }

            mapOf(
                "memberId" to member.id,
                "memberName" to member.name,
                "memberRole" to member.role,
                "totalTasks" to memberTasks.size,
                "completedTasks" to completedTasks,
                "totalEstimatedHours" to totalEstimatedHours,
                "totalActualHours" to totalActualHours,
                "efficiencyScore" to if (totalEstimatedHours > 0) (totalActualHours / totalEstimatedHours) * 100 else 0.0
            )
        }.sortedByDescending { it["completedTasks"] as Int }
    }

    fun getMemberWorkload(memberId: Long): Map<String, Any> {
        val member = teamMemberRepository.findById(memberId)
            .orElseThrow { IllegalArgumentException("Member not found") }
        val tasks = issueService.findAll(IssueQuery(type = "TASK", assigneeId = memberId))

        val totalEstimatedHours = tasks.sumOf { it.estimatedHours.toDouble() }
        val totalActualHours = tasks.sumOf { it.actualHours.toDouble() }
        val workloadPercentage = (totalEstimatedHours / 40.0) * 100

        return mapOf(
            "memberId" to memberId,
            "memberName" to member.name,
            "totalTasks" to tasks.size,
            "completedTasks" to tasks.count { it.state == "DONE" },
            "inProgressTasks" to tasks.count { it.state == "IN_PROGRESS" },
            "pendingTasks" to tasks.count { it.state == "TODO" || it.state == "BACKLOG" },
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
        val features = issueService.findAll(IssueQuery(type = "FEATURE", projectId = projectId))
        val completed = features.filter { it.state == "DONE" }

        val monthlyThroughput = completed
            .groupBy { it.plannedEndDate?.let(LocalDate::parse)?.month?.toString() ?: "N/A" }
            .mapValues { it.value.size }

        val weeklyThroughput = completed
            .groupBy {
                it.plannedEndDate?.let(LocalDate::parse)?.let { date -> "${date.year}-${date.monthValue}" } ?: "N/A"
            }
            .mapValues { it.value.size }

        return mapOf(
            "projectId" to projectId,
            "totalCompleted" to completed.size,
            "monthlyThroughput" to monthlyThroughput,
            "weeklyThroughput" to weeklyThroughput,
            "avgWeeklyThroughput" to if (weeklyThroughput.isNotEmpty()) weeklyThroughput.values.average() else 0.0
        )
    }

    fun forecastRequirements(projectId: Long): Map<String, Any> {
        val features = issueService.findAll(IssueQuery(type = "FEATURE", projectId = projectId))
        val completedCount = features.count { it.state == "DONE" }
        val inProgressCount = features.count { it.state == "IN_PROGRESS" }
        val backlogCount = features.count { it.state == "BACKLOG" || it.state == "TODO" }
        val completionRate = if (features.isNotEmpty()) completedCount.toDouble() / features.size else 0.0
        val weeksToComplete = if (completionRate > 0) {
            ((features.size - completedCount).toDouble() / completedCount.coerceAtLeast(1)) * 2
        } else 0.0

        return mapOf(
            "projectId" to projectId,
            "total" to features.size,
            "completed" to completedCount,
            "inProgress" to inProgressCount,
            "new" to backlogCount,
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
        val tasks = issueService.findAll(IssueQuery(type = "TASK", projectId = projectId))
        val weeklyHours = tasks
            .filter { it.state == "DONE" && it.plannedEndDate != null }
            .groupBy {
                LocalDate.parse(it.plannedEndDate).let { date -> "${date.year}-${date.monthValue}" }
            }
            .mapValues { entry -> entry.value.sumOf { it.actualHours.toDouble() } }

        val estimatedTotal = tasks.sumOf { it.estimatedHours.toDouble() }
        val actualTotal = tasks.sumOf { it.actualHours.toDouble() }
        val variance = if (estimatedTotal > 0) ((actualTotal - estimatedTotal) / estimatedTotal) * 100 else 0.0

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
        val tasks = issueService.findAll(IssueQuery(type = "TASK")).filter { it.teamId == teamId }
        val completedTasks = tasks.filter { it.state == "DONE" }
        val inProgressTasks = tasks.filter { it.state == "IN_PROGRESS" }

        val completedStoryPoints = completedTasks.sumOf { it.estimatedHours.toDouble() }
        val inProgressStoryPoints = inProgressTasks.sumOf { it.estimatedHours.toDouble() }
        val velocity = completedStoryPoints + (inProgressStoryPoints * 0.5)

        return mapOf(
            "teamId" to teamId,
            "completedTasks" to completedTasks.size,
            "inProgressTasks" to inProgressTasks.size,
            "completedStoryPoints" to completedStoryPoints,
            "inProgressStoryPoints" to inProgressStoryPoints,
            "currentVelocity" to velocity,
            "avgWeeklyVelocity" to velocity / 4,
            "status" to when {
                velocity > 100 -> "HIGH"
                velocity > 50 -> "MEDIUM"
                else -> "LOW"
            }
        )
    }

    fun getProjectRisk(projectId: Long): Map<String, Any> {
        val features = issueService.findAll(IssueQuery(type = "FEATURE", projectId = projectId))
        val tasks = issueService.findAll(IssueQuery(type = "TASK", projectId = projectId))
        val defects = issueService.findAll(IssueQuery(type = "BUG", projectId = projectId))

        var riskScore = 0
        val riskItems = mutableListOf<Map<String, Any>>()

        val overdueFeatures = features.filter {
            it.plannedEndDate?.let(LocalDate::parse)?.isBefore(LocalDate.now()) == true && it.state != "DONE"
        }
        if (overdueFeatures.isNotEmpty()) {
            riskScore += 30
            riskItems.add(mapOf("type" to "DELAY", "severity" to "HIGH", "description" to "${overdueFeatures.size} features overdue"))
        }

        val openDefects = defects.count { it.state == "TODO" || it.state == "IN_PROGRESS" || it.state == "IN_REVIEW" }
        val highSeverityDefects = defects.count { it.severity == "HIGH" && it.state != "DONE" }
        if (highSeverityDefects > 2) {
            riskScore += 25
            riskItems.add(mapOf("type" to "DEFECT", "severity" to "HIGH", "description" to "$highSeverityDefects high severity defects open"))
        }

        val progressRate = if (features.isNotEmpty()) features.count { it.state == "DONE" }.toDouble() / features.size else 0.0
        if (progressRate < 0.3 && features.size > 3) {
            riskScore += 20
            riskItems.add(mapOf("type" to "PROGRESS", "severity" to "MEDIUM", "description" to "Progress rate below 30%"))
        }

        val blockedTasks = tasks.count {
            it.state == "IN_PROGRESS" && it.progress < 30 && remainingDays(it.legacyPayload)?.let { days -> days < 1 } == true
        }
        if (blockedTasks > 0) {
            riskScore += 15
            riskItems.add(mapOf("type" to "BLOCKER", "severity" to "MEDIUM", "description" to "$blockedTasks tasks blocked"))
        }

        return mapOf(
            "projectId" to projectId,
            "riskScore" to riskScore,
            "riskLevel" to when {
                riskScore >= 50 -> "HIGH"
                riskScore >= 25 -> "MEDIUM"
                else -> "LOW"
            },
            "riskItems" to riskItems,
            "totalRequirements" to features.size,
            "completedRequirements" to features.count { it.state == "DONE" },
            "openDefects" to openDefects
        )
    }

    fun getDelayRisk(projectId: Long): List<Map<String, Any>> {
        val features = issueService.findAll(IssueQuery(type = "FEATURE", projectId = projectId))
        val tasks = issueService.findAll(IssueQuery(type = "TASK", projectId = projectId))
        val risks = mutableListOf<Map<String, Any>>()

        features.filter { it.state != "DONE" }.forEach { feature ->
            val daysUntilDue = feature.plannedEndDate?.let { date ->
                ChronoUnit.DAYS.between(LocalDate.now(), LocalDate.parse(date))
            } ?: Long.MAX_VALUE
            if (daysUntilDue < 7 && feature.progress < 80) {
                risks.add(
                    mapOf(
                        "type" to "FEATURE",
                        "id" to feature.id,
                        "title" to feature.title,
                        "progress" to feature.progress,
                        "daysUntilDue" to daysUntilDue,
                        "riskLevel" to if (daysUntilDue < 3 && feature.progress < 50) "HIGH" else "MEDIUM"
                    )
                )
            }
        }

        tasks.filter { it.state != "DONE" }.forEach { task ->
            val daysUntilDue = task.plannedEndDate?.let { date ->
                ChronoUnit.DAYS.between(LocalDate.now(), LocalDate.parse(date))
            } ?: Long.MAX_VALUE
            if (daysUntilDue < 3 && task.progress < 70) {
                risks.add(
                    mapOf(
                        "type" to "TASK",
                        "id" to task.id,
                        "title" to task.title,
                        "progress" to task.progress,
                        "daysUntilDue" to daysUntilDue,
                        "riskLevel" to if (daysUntilDue < 1 && task.progress < 50) "HIGH" else "MEDIUM"
                    )
                )
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
        val members = teamMemberRepository.findByTeamId(teamId)
        val tasks = issueService.findAll(IssueQuery(type = "TASK")).filter { it.teamId == teamId }
        val bottlenecks = mutableListOf<Map<String, Any>>()

        members.forEach { member ->
            val memberTasks = tasks.filter { it.assigneeId == member.id }
            val overloadedTasks = memberTasks.count { it.state == "IN_PROGRESS" && it.estimatedHours > 20 }
            if (overloadedTasks > 2) {
                bottlenecks.add(
                    mapOf(
                        "memberId" to member.id,
                        "memberName" to member.name,
                        "memberRole" to member.role,
                        "issue" to "HIGH_WORKLOAD",
                        "overloadedTasks" to overloadedTasks,
                        "suggestion" to "Consider redistributing tasks"
                    )
                )
            }
        }

        val unassignedTasks = tasks.count { it.assigneeId == null && it.state != "DONE" }
        if (unassignedTasks > 3) {
            bottlenecks.add(
                mapOf(
                    "type" to "UNASSIGNED",
                    "count" to unassignedTasks,
                    "issue" to "TOO_MANY_UNASSIGNED_TASKS",
                    "suggestion" to "Assign tasks to team members"
                )
            )
        }

        val developerTasks = tasks.count {
            it.state == "IN_PROGRESS" && members.find { member -> member.id == it.assigneeId }?.role == "DEVELOPER"
        }
        val testerTasks = tasks.count {
            it.state == "IN_PROGRESS" && members.find { member -> member.id == it.assigneeId }?.role == "TESTER"
        }
        if (developerTasks > testerTasks * 3) {
            bottlenecks.add(
                mapOf(
                    "type" to "ROLE_IMBALANCE",
                    "issue" to "DEVELOPER_TESTER_IMBALANCE",
                    "developerTasks" to developerTasks,
                    "testerTasks" to testerTasks,
                    "suggestion" to "Consider adding more testers or balancing workload"
                )
            )
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

    private fun percentage(done: Int, total: Int): Double =
        if (total > 0) (done.toDouble() / total) * 100 else 0.0

    private fun remainingDays(legacyPayload: String?): Double? {
        if (legacyPayload.isNullOrBlank()) return null
        val payload = runCatching { objectMapper.readTree(legacyPayload) }.getOrNull() ?: return null
        return payload["remainingDays"]?.asDouble()
    }
}
