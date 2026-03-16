package com.cruise.repository

import com.cruise.entity.MagicLinkToken
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface MagicLinkTokenRepository : JpaRepository<MagicLinkToken, Long> {
    fun findByTokenHash(tokenHash: String): MagicLinkToken?
}
