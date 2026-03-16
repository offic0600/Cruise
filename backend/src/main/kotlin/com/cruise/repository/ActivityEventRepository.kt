package com.cruise.repository

import com.cruise.entity.ActivityEvent
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ActivityEventRepository : JpaRepository<ActivityEvent, Long> {
    fun findByEntityTypeAndEntityId(entityType: String, entityId: Long): List<ActivityEvent>
}
