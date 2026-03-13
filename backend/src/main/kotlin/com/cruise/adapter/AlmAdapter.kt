package com.cruise.adapter

import com.cruise.service.IssueDto

interface AlmAdapter {
    fun syncIssues(): List<AlmIssue>
    fun pushIssue(issue: IssueDto): Boolean
    fun getSyncStatus(): List<SyncStatus>
}

data class AlmIssue(
    val externalId: String,
    val title: String,
    val description: String,
    val state: String,
    val priority: String,
    val projectKey: String
)

data class SyncStatus(
    val entityType: String,
    val entityId: Long,
    val externalId: String?,
    val lastSyncTime: String,
    val status: String
)
