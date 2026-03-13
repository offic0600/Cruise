package com.cruise.repository

import com.cruise.entity.LegacyIssueMapping
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface LegacyIssueMappingRepository : JpaRepository<LegacyIssueMapping, Long> {
    fun findBySourceTypeAndSourceId(sourceType: String, sourceId: Long): LegacyIssueMapping?
    fun existsBySourceTypeAndSourceId(sourceType: String, sourceId: Long): Boolean
}
