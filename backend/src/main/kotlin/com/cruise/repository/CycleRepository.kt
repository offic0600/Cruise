package com.cruise.repository

import com.cruise.entity.Cycle
import org.springframework.data.jpa.repository.JpaRepository

interface CycleRepository : JpaRepository<Cycle, Long>
