package com.cruise.repository

import com.cruise.entity.InitiativeRelation
import org.springframework.data.jpa.repository.JpaRepository

interface InitiativeRelationRepository : JpaRepository<InitiativeRelation, Long>
