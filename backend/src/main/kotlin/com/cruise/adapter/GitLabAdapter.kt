package com.cruise.adapter

/**
 * GitLab 适配器接口
 */
interface GitLabAdapter {
    /**
     * 获取项目提交记录
     * @param projectId 项目 ID
     * @return 提交记录列表
     */
    fun getCommits(projectId: Long): List<GitCommit>

    /**
     * 关联需求与代码提交
     * @param requirementId 需求 ID
     * @param commitHash 提交哈希
     * @return 是否关联成功
     */
    fun linkRequirement(requirementId: Long, commitHash: String): Boolean

    /**
     * 获取项目代码统计
     * @param projectId 项目 ID
     * @return 代码统计
     */
    fun getProjectStats(projectId: Long): ProjectStats
}

/**
 * Git 提交记录
 */
data class GitCommit(
    val hash: String,
    val shortHash: String,
    val message: String,
    val author: String,
    val date: String,
    val additions: Int,
    val deletions: Int
)

/**
 * 项目代码统计
 */
data class ProjectStats(
    val projectId: Long,
    val totalCommits: Int,
    val totalAdditions: Int,
    val totalDeletions: Int,
    val contributors: Int,
    val branchCount: Int
)
