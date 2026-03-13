package com.cruise.adapter

interface GitLabAdapter {
    fun getCommits(projectId: Long): List<GitCommit>
    fun linkIssue(issueId: Long, commitHash: String): Boolean
    fun getProjectStats(projectId: Long): ProjectStats
}

data class GitCommit(
    val hash: String,
    val shortHash: String,
    val message: String,
    val author: String,
    val date: String,
    val additions: Int,
    val deletions: Int
)

data class ProjectStats(
    val projectId: Long,
    val totalCommits: Int,
    val totalAdditions: Int,
    val totalDeletions: Int,
    val contributors: Int,
    val branchCount: Int
)
