package com.cruise.repository

import com.cruise.entity.CustomerNeed
import org.springframework.data.jpa.repository.JpaRepository

interface CustomerNeedRepository : JpaRepository<CustomerNeed, Long>
