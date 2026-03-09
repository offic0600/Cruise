package com.cruise.adapter

import org.springframework.stereotype.Component
import java.time.LocalDateTime

/**
 * GitLab 模拟适配器（用于开发和测试）
 */
@Component
class MockGitLabAdapter : GitLabAdapter {

    private val commitLinks = mutableMapOf<Long, MutableList<String>>()

    override fun getCommits(projectId: Long): List<GitCommit> {
        // 模拟 GitLab 提交记录
        return listOf(
            GitCommit(
                hash = "a1b2c3d4e5f6g7h8i9j0",
                shortHash = "a1b2c3d4",
                message = "feat: 实现用户登录功能",
                author = "zhangsan",
                date = "2026-03-09T10:30:00",
                additions = 150,
                deletions = 20
            ),
            GitCommit(
                hash = "b2c3d4e5f6g7h8i9j0k1",
                shortHash = "b2c3d4e5",
                message = "feat: 添加 JWT 认证",
                author = "lisi",
                date = "2026-03-08T15:20:00",
                additions = 200,
                deletions = 50
            ),
            GitCommit(
                hash = "c3d4e5f6g7h8i9j0k1l2",
                shortHash = "c3d4e5f6",
                message = "fix: 修复登录页面样式问题",
                author = "wangwu",
                date = "2026-03-07T09:15:00",
                additions = 30,
                deletions = 10
            ),
            GitCommit(
                hash = "d4e5f6g7h8i9j0k1l2m3",
                shortHash = "d4e5f6g7",
                message = "docs: 更新 API 文档",
                author = "zhaoliu",
                date = "2026-03-06T14:00:00",
                additions = 100,
                deletions = 5
            ),
            GitCommit(
                hash = "e5f6g7h8i9j0k1l2m3n4",
                shortHash = "e5f6g7h8",
                message = "test: 添加单元测试",
                author = "qianqi",
                date = "2026-03-05T11:30:00",
                additions = 300,
                deletions = 0
            )
        )
    }

    override fun linkRequirement(requirementId: Long, commitHash: String): Boolean {
        commitLinks.getOrPut(requirementId) { mutableListOf() }.add(commitHash)
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
