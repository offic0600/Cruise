package com.cruise.service

import com.cruise.entity.Defect
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException

@Service
class DefectService(
    private val issueService: IssueService
) {
    fun create(data: CreateDefectRequest): Defect {
        val issue = issueService.create(
            CreateIssueRequest(
                type = "BUG",
                title = data.title,
                description = data.description,
                state = "TODO",
                priority = when (data.severity) {
                    "CRITICAL" -> "URGENT"
                    "HIGH" -> "HIGH"
                    "LOW" -> "LOW"
                    else -> "MEDIUM"
                },
                projectId = data.projectId,
                parentIssueId = data.taskId,
                reporterId = data.reporterId,
                severity = data.severity ?: "MEDIUM"
            )
        )
        return issueService.toDefect(issueService.getIssue(issue.id))
    }

    fun getAll(): List<Defect> =
        issueService.findAll(IssueQuery(type = "BUG")).map { issueService.toDefect(issueService.getIssue(it.id)) }

    fun getById(id: Long): Defect {
        val issue = issueService.getIssue(id)
        if (issue.type != "BUG") {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Defect not found")
        }
        return issueService.toDefect(issue)
    }

    fun getByProjectId(projectId: Long): List<Defect> =
        issueService.findAll(IssueQuery(type = "BUG", projectId = projectId))
            .map { issueService.toDefect(issueService.getIssue(it.id)) }

    fun getByTaskId(taskId: Long): List<Defect> =
        issueService.findAll(IssueQuery(type = "BUG", parentIssueId = taskId))
            .map { issueService.toDefect(issueService.getIssue(it.id)) }

    fun update(id: Long, data: UpdateDefectRequest): Defect {
        val issue = issueService.getIssue(id)
        if (issue.type != "BUG") {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Defect not found")
        }
        issueService.update(
            id,
            UpdateIssueRequest(
                title = data.title,
                description = data.description,
                severity = data.severity ?: issue.severity,
                state = data.status?.let { mapDefectStatus(it) }
            )
        )
        return issueService.toDefect(issueService.getIssue(id))
    }

    fun updateStatus(id: Long, status: String): Defect {
        val issue = issueService.getIssue(id)
        if (issue.type != "BUG") {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Defect not found")
        }
        issueService.updateState(id, mapDefectStatus(status))
        return issueService.toDefect(issueService.getIssue(id))
    }

    fun delete(id: Long) {
        val issue = issueService.getIssue(id)
        if (issue.type != "BUG") {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Defect not found")
        }
        issueService.delete(id)
    }
}

data class CreateDefectRequest(
    val title: String,
    val description: String? = null,
    val severity: String? = null,
    val projectId: Long,
    val taskId: Long? = null,
    val reporterId: Long? = null
)

data class UpdateDefectRequest(
    val title: String? = null,
    val description: String? = null,
    val severity: String? = null,
    val status: String? = null
)

private fun mapDefectStatus(status: String): String = when (status) {
    "OPEN", "REOPENED" -> "TODO"
    "IN_PROGRESS" -> "IN_PROGRESS"
    "RESOLVED" -> "IN_REVIEW"
    "CLOSED" -> "DONE"
    else -> "TODO"
}
