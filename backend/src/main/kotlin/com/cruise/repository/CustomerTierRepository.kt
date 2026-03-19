package com.cruise.repository

import com.cruise.entity.CustomerTier
import org.springframework.data.jpa.repository.JpaRepository

interface CustomerTierRepository : JpaRepository<CustomerTier, Long>
