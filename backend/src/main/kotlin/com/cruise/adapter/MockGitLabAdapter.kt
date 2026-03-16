package com.cruise.adapter

import org.springframework.stereotype.Component

@Component
class MockGitLabAdapter : GitLabAdapter {
    private val commitLinks = mutableMapOf<Long, MutableList<String>>()

    override fun getCommits(projectId: Long): List<GitCommit> = listOf(
        GitCommit("a1b2c3d4e5f6", "a1b2c3d4", "feat: 完成 Issue 统一真源", "zhangsan", "2026-03-12T10:30:00", 150, 20),
        GitCommit("b2c3d4e5f6g7", "b2c3d4e5", "feat: 新增统一工作项 API", "lisi", "2026-03-11T15:20:00", 200, 50),
        GitCommit("c3d4e5f6g7h8", "c3d4e5f6", "fix: 修复缺陷视图状态切换", "wangwu", "2026-03-10T09:15:00", 30, 10),
        GitCommit("d4e5f6g7h8i9", "d4e5f6g7", "docs: 更新统一模型设计文档", "zhaoliu", "2026-03-09T14:00:00", 100, 5),
        GitCommit("e5f6g7h8i9j0", "e5f6g7h8", "test: 补充统一工作项构建验证", "qianqi", "2026-03-08T11:30:00", 300, 0)
    )

    override fun linkIssue(issueId: Long, commitHash: String): Boolean {
        commitLinks.getOrPut(issueId) { mutableListOf() }.add(commitHash)
        return true
    }

    override fun getProjectStats(projectId: Long): ProjectStats {
        val commits = getCommits(projectId)
        return ProjectStats(
            projectId = projectId,
            totalCommits = commits.size,
            totalAdditions = commits.sumOf { it.additions },
            totalDeletions = commits.sumOf { it.deletions },
            contributors = commits.map { it.author }.distinct().size,
            branchCount = 5
        )
    }
}
