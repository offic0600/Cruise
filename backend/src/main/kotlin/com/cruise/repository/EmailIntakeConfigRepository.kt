package com.cruise.repository

import com.cruise.entity.EmailIntakeConfig
import org.springframework.data.jpa.repository.JpaRepository

interface EmailIntakeConfigRepository : JpaRepository<EmailIntakeConfig, Long> {
    fun findByEmailAddress(emailAddress: String): EmailIntakeConfig?
}
