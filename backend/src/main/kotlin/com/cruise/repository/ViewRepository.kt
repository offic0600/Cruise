package com.cruise.repository

import com.cruise.entity.View
import org.springframework.data.jpa.repository.JpaRepository

interface ViewRepository : JpaRepository<View, Long> {
    fun findByOrganizationId(organizationId: Long): List<View>
}
