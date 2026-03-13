package com.cruise.repository

import com.cruise.entity.AgentSession
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface AgentSessionRepository : JpaRepository<AgentSession, Long> {
    fun findBySessionId(sessionId: String): AgentSession?
    fun findByUserId(userId: Long): List<AgentSession>
    fun findByStatus(status: String): List<AgentSession>
}
