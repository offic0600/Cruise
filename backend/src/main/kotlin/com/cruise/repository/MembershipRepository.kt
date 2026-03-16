package com.cruise.repository

import com.cruise.entity.Membership
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface MembershipRepository : JpaRepository<Membership, Long> {
    fun findByTeamId(teamId: Long): List<Membership>
    fun findByUserId(userId: Long): List<Membership>
}
