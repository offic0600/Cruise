package com.cruise.controller

import com.cruise.adapter.GitCommit
import com.cruise.adapter.GitLabAdapter
import com.cruise.adapter.ProjectStats
import com.cruise.adapter.WorkHoursAdapter
import com.cruise.adapter.WorkHoursSummary
import com.cruise.service.IssueQuery
import com.cruise.service.IssueService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api")
class IntegrationController(
    private val gitLabAdapter: GitLabAdapter,
    private val workHoursAdapter: WorkHoursAdapter,
    private val issueService: IssueService
) {
    @GetMapping("/gitlab/projects/{projectId}/commits")
    fun getProjectCommits(@PathVariable projectId: Long): List<GitCommit> =
        gitLabAdapter.getCommits(projectId)

    @PostMapping("/gitlab/issues/{issueId}/link")
    fun linkIssueToCommit(
        @PathVariable issueId: Long,
        @RequestBody request: LinkCommitRequest
    ): Map<String, Any> = linkCommit(issueId, request)

    @PostMapping("/gitlab/requirement/{requirementId}/link")
    fun linkRequirementToCommit(
        @PathVariable requirementId: Long,
        @RequestBody request: LinkCommitRequest
    ): Map<String, Any> = linkCommit(requirementId, request)

    @GetMapping("/gitlab/projects/{projectId}/stats")
    fun getProjectStats(@PathVariable projectId: Long): ProjectStats =
        gitLabAdapter.getProjectStats(projectId)

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

    @GetMapping("/integration/project/{projectId}/overview")
    fun getProjectOverview(@PathVariable projectId: Long): Map<String, Any> {
        val stats = gitLabAdapter.getProjectStats(projectId)
        val workHours = workHoursAdapter.getWorkHoursSummary(projectId)
        val features = issueService.findAll(IssueQuery(type = "FEATURE", projectId = projectId))

        return mapOf(
            "projectId" to projectId,
            "issues" to mapOf(
                "totalFeatures" to features.size,
                "completedFeatures" to features.count { it.state == "DONE" },
                "inProgressFeatures" to features.count { it.state == "IN_PROGRESS" }
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

    private fun linkCommit(issueId: Long, request: LinkCommitRequest): Map<String, Any> {
        val success = gitLabAdapter.linkIssue(issueId, request.commitHash)
        return mapOf(
            "success" to success,
            "issueId" to issueId,
            "requirementId" to issueId,
            "commitHash" to request.commitHash,
            "message" to if (success) "Link created successfully" else "Failed to create link"
        )
    }
}

data class LinkCommitRequest(
    val commitHash: String
)
