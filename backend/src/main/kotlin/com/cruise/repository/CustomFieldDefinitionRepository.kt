package com.cruise.repository

import com.cruise.entity.CustomFieldDefinition
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface CustomFieldDefinitionRepository : JpaRepository<CustomFieldDefinition, Long> {
    fun findByOrganizationIdAndEntityTypeOrderBySortOrderAscNameAsc(
        organizationId: Long,
        entityType: String
    ): List<CustomFieldDefinition>

    fun existsByOrganizationIdAndEntityTypeAndKey(
        organizationId: Long,
        entityType: String,
        key: String
    ): Boolean
}
