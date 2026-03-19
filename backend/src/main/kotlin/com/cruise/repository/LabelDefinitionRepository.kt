package com.cruise.repository

import com.cruise.entity.LabelDefinition
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface LabelDefinitionRepository : JpaRepository<LabelDefinition, Long> {
    fun findByArchivedFalseOrderBySortOrderAscIdAsc(): List<LabelDefinition>
    fun findByIdIn(ids: Collection<Long>): List<LabelDefinition>
    fun findByOrganizationIdAndScopeTypeAndScopeIdAndArchivedFalseOrderBySortOrderAscIdAsc(
        organizationId: Long,
        scopeType: String,
        scopeId: Long?
    ): List<LabelDefinition>
    fun findByOrganizationIdAndScopeTypeAndScopeIdAndNameNormalizedAndArchivedFalse(
        organizationId: Long,
        scopeType: String,
        scopeId: Long?,
        nameNormalized: String
    ): LabelDefinition?
}
