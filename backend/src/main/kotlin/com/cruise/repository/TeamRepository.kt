package com.cruise.repository

import com.cruise.entity.Team
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface TeamRepository : JpaRepository<Team, Long> {
    fun findByOrganizationId(organizationId: Long): List<Team>
}
