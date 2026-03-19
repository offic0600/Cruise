package com.cruise.repository

import com.cruise.entity.ExternalEntityInfo
import org.springframework.data.jpa.repository.JpaRepository

interface ExternalEntityInfoRepository : JpaRepository<ExternalEntityInfo, Long>
