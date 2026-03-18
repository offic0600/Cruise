package com.cruise.repository

import com.cruise.entity.AuthLoginEvent
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface AuthLoginEventRepository : JpaRepository<AuthLoginEvent, Long>
