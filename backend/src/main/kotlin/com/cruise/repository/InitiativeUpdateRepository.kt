package com.cruise.repository

import com.cruise.entity.InitiativeUpdate
import org.springframework.data.jpa.repository.JpaRepository

interface InitiativeUpdateRepository : JpaRepository<InitiativeUpdate, Long>
