package com.cruise.repository

import com.cruise.entity.Initiative
import org.springframework.data.jpa.repository.JpaRepository

interface InitiativeRepository : JpaRepository<Initiative, Long>

