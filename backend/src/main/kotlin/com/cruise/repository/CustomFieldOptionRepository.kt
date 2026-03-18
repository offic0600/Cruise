package com.cruise.repository

import com.cruise.entity.CustomFieldOption
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface CustomFieldOptionRepository : JpaRepository<CustomFieldOption, Long> {
    fun findByFieldDefinitionIdInOrderBySortOrderAscIdAsc(fieldDefinitionIds: Collection<Long>): List<CustomFieldOption>
    fun deleteByFieldDefinitionId(fieldDefinitionId: Long)
}
