package com.cruise.repository

import com.cruise.entity.ProjectStatus
import org.springframework.data.jpa.repository.JpaRepository

interface ProjectStatusRepository : JpaRepository<ProjectStatus, Long>
