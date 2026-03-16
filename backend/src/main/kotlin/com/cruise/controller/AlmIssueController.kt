package com.cruise.controller

import com.cruise.adapter.AlmAdapter
import com.cruise.service.IssueService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/alm")
class AlmIssueController(
    private val almAdapter: AlmAdapter,
    private val issueService: IssueService
) {
    @PostMapping("/sync/issues")
    fun syncIssues(
        @RequestParam almProjectId: String,
        @RequestParam(required = false) sinceDate: String?
    ): Map<String, Any> = syncIssuePayload(almProjectId, sinceDate)

    @PostMapping("/sync/requirements")
    fun syncRequirements(
        @RequestParam almProjectId: String,
        @RequestParam(required = false) sinceDate: String?
    ): Map<String, Any> = syncIssuePayload(almProjectId, sinceDate)

    @PostMapping("/push/issue/{id}")
    fun pushIssue(@PathVariable id: Long): Map<String, Any> = pushIssuePayload(id)

    @PostMapping("/push/requirement/{id}")
    fun pushRequirement(@PathVariable id: Long): Map<String, Any> = pushIssuePayload(id)

    @GetMapping("/sync/status")
    fun getSyncStatus() = almAdapter.getSyncStatus()

    @GetMapping("/test-connection")
    fun testConnection(): Map<String, Any> =
        mapOf("status" to "connected", "message" to "ALM mock adapter is connected")

    private fun syncIssuePayload(almProjectId: String, sinceDate: String?): Map<String, Any> {
        val issues = almAdapter.syncIssues()
        return mapOf(
            "success" to true,
            "syncedCount" to issues.size,
            "almProjectId" to almProjectId,
            "sinceDate" to (sinceDate ?: "not specified")
        )
    }

    private fun pushIssuePayload(id: Long): Map<String, Any> {
        val issue = issueService.findById(id)
        val success = almAdapter.pushIssue(issue)
        return mapOf(
            "success" to success,
            "issueId" to id,
            "requirementId" to id,
            "externalId" to "JIRA-${1000 + id}",
            "message" to if (success) "Issue pushed successfully" else "Failed to push issue"
        )
    }
}
