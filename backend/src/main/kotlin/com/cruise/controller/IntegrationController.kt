package com.cruise.controller

import com.cruise.adapter.*
import com.cruise.repository.RequirementRepository
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api")
class IntegrationController(
    private val gitLabAdapter: GitLabAdapter,
    private val workHoursAdapter: WorkHoursAdapter,
    private val requirementRepository: RequirementRepository
) {
    // ========== GitLab 集成 ==========

    @GetMapping("/gitlab/projects/{projectId}/commits")
    fun getProjectCommits(@PathVariable projectId: Long): List<GitCommit> =
        gitLabAdapter.getCommits(projectId)

    @PostMapping("/gitlab/requirement/{requirementId}/link")
    fun linkRequirementToCommit(
        @PathVariable requirementId: Long,
        @RequestBody request: LinkCommitRequest
    ): Map<String, Any> {
        val success = gitLabAdapter.linkRequirement(requirementId, request.commitHash)

        return mapOf(
            "success" to success,
            "requirementId" to requirementId,
            "commitHash" to request.commitHash,
            "message" to if (success) "关联成功" else "关联失败"
        )
    }

    @GetMapping("/gitlab/projects/{projectId}/stats")
    fun getProjectStats(@PathVariable projectId: Long): ProjectStats =
        gitLabAdapter.getProjectStats(projectId)

    // ========== 工时系统 ==========

    @PostMapping("/workhours/sync")
    fun syncWorkHours(@RequestParam projectId: Long = 1): Map<String, Any> {
        val result = workHoursAdapter.syncWorkHours(projectId)

        return mapOf(
            "success" to result.success,
            "syncedCount" to result.syncedCount,
            "failedCount" to result.failedCount,
            "message" to result.message
        )
    }

    @GetMapping("/workhours/summary")
    fun getWorkHoursSummary(@RequestParam projectId: Long): WorkHoursSummary =
        workHoursAdapter.getWorkHoursSummary(projectId)

    // ========== 数据聚合视图 ==========

    @GetMapping("/integration/project/{projectId}/overview")
    fun getProjectOverview(@PathVariable projectId: Long): Map<String, Any> {
        val stats = gitLabAdapter.getProjectStats(projectId)
        val workHours = workHoursAdapter.getWorkHoursSummary(projectId)
        val requirements = requirementRepository.findByProjectId(projectId)

        return mapOf(
            "projectId" to projectId,
            "requirements" to mapOf(
                "total" to requirements.size,
                "completed" to requirements.count { it.status == "COMPLETED" },
                "inProgress" to requirements.count { it.status == "IN_PROGRESS" }
            ),
            "code" to mapOf(
                "totalCommits" to stats.totalCommits,
                "totalAdditions" to stats.totalAdditions,
                "totalDeletions" to stats.totalDeletions,
                "contributors" to stats.contributors
            ),
            "workHours" to mapOf(
                "totalHours" to workHours.totalHours,
                "dailyAverage" to workHours.totalHours / 5
            )
        )
    }

    @GetMapping("/integration/team/{teamId}/dashboard")
    fun getTeamDashboard(@PathVariable teamId: Long): Map<String, Any> {
        val commits = gitLabAdapter.getCommits(teamId)
        val workHours = workHoursAdapter.getWorkHoursSummary(teamId)
        val stats = gitLabAdapter.getProjectStats(teamId)

        return mapOf(
            "teamId" to teamId,
            "codeActivity" to mapOf(
                "recentCommits" to commits.size,
                "contributors" to stats.contributors,
                "linesChanged" to stats.totalAdditions + stats.totalDeletions
            ),
            "workHours" to mapOf(
                "totalHours" to workHours.totalHours,
                "memberDistribution" to workHours.memberHours
            ),
            "status" to "HEALTHY"
        )
    }
}

data class LinkCommitRequest(
    val commitHash: String
)
