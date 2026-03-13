package com.cruise.repository

import com.cruise.entity.TeamMember
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface TeamMemberRepository : JpaRepository<TeamMember, Long> {
    fun findByTeamId(teamId: Long): List<TeamMember>
    fun findByRole(role: String): List<TeamMember>
}