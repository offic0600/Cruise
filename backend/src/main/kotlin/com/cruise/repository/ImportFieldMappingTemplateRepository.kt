package com.cruise.repository

import com.cruise.entity.ImportFieldMappingTemplate
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ImportFieldMappingTemplateRepository : JpaRepository<ImportFieldMappingTemplate, Long> {
    fun findByOrganizationIdAndEntityTypeOrderByIdAsc(organizationId: Long, entityType: String): List<ImportFieldMappingTemplate>
}
