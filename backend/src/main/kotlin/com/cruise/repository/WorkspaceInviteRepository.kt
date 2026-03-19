package com.cruise.repository

import com.cruise.entity.WorkspaceInvite
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface WorkspaceInviteRepository : JpaRepository<WorkspaceInvite, Long> {
    fun findByCode(code: String): WorkspaceInvite?
    fun findByOrganizationIdOrderByCreatedAtDesc(organizationId: Long): List<WorkspaceInvite>
    fun existsByCode(code: String): Boolean
}
