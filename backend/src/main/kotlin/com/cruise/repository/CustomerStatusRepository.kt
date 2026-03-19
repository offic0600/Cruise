package com.cruise.repository

import com.cruise.entity.CustomerStatus
import org.springframework.data.jpa.repository.JpaRepository

interface CustomerStatusRepository : JpaRepository<CustomerStatus, Long>
