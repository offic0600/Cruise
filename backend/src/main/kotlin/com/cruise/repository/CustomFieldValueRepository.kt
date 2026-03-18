package com.cruise.repository

import com.cruise.entity.CustomFieldValue
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface CustomFieldValueRepository : JpaRepository<CustomFieldValue, Long> {
    fun findByEntityTypeAndEntityIdIn(entityType: String, entityIds: Collection<Long>): List<CustomFieldValue>
    fun findByEntityTypeAndEntityId(entityType: String, entityId: Long): List<CustomFieldValue>
    fun deleteByEntityTypeAndEntityId(entityType: String, entityId: Long)
}
