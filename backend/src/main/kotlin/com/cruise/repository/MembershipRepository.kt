package com.cruise.repository

import com.cruise.entity.Membership
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface MembershipRepository : JpaRepository<Membership, Long> {
    fun findByTeamId(teamId: Long): List<Membership>
    fun findByUserId(userId: Long): List<Membership>
    fun findFirstByUserIdAndActiveTrue(userId: Long): Membership?
    fun findByUserIdAndActiveTrue(userId: Long): List<Membership>
    fun findByOrganizationIdAndActiveTrue(organizationId: Long): List<Membership>
    fun findFirstByUserIdAndOrganizationIdAndActiveTrue(userId: Long, organizationId: Long): Membership?
}
