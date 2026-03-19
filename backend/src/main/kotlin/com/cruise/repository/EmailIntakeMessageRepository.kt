package com.cruise.repository

import com.cruise.entity.EmailIntakeMessage
import org.springframework.data.jpa.repository.JpaRepository

interface EmailIntakeMessageRepository : JpaRepository<EmailIntakeMessage, Long> {
    fun findByConfigIdAndSourceMessageId(configId: Long, sourceMessageId: String): EmailIntakeMessage?
}
