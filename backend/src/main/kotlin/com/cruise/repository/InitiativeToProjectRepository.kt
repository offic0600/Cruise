package com.cruise.repository

import com.cruise.entity.InitiativeToProject
import org.springframework.data.jpa.repository.JpaRepository

interface InitiativeToProjectRepository : JpaRepository<InitiativeToProject, Long>
