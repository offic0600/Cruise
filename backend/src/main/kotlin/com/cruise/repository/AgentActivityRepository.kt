package com.cruise.repository

import com.cruise.entity.AgentActivity
import org.springframework.data.jpa.repository.JpaRepository

interface AgentActivityRepository : JpaRepository<AgentActivity, Long>
