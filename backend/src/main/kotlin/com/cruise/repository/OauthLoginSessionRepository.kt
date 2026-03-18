package com.cruise.repository

import com.cruise.entity.OauthLoginSession
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface OauthLoginSessionRepository : JpaRepository<OauthLoginSession, Long> {
    fun findByState(state: String): OauthLoginSession?
}
