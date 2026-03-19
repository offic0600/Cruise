package com.cruise.repository

import com.cruise.entity.Reaction
import org.springframework.data.jpa.repository.JpaRepository

interface ReactionRepository : JpaRepository<Reaction, Long>
