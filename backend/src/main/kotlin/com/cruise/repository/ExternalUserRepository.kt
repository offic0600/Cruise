package com.cruise.repository

import com.cruise.entity.ExternalUser
import org.springframework.data.jpa.repository.JpaRepository

interface ExternalUserRepository : JpaRepository<ExternalUser, Long>
