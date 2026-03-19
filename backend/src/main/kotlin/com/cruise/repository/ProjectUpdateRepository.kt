package com.cruise.repository

import com.cruise.entity.ProjectUpdate
import org.springframework.data.jpa.repository.JpaRepository

interface ProjectUpdateRepository : JpaRepository<ProjectUpdate, Long>
