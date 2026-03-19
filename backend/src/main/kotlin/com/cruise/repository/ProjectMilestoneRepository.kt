package com.cruise.repository

import com.cruise.entity.ProjectMilestone
import org.springframework.data.jpa.repository.JpaRepository

interface ProjectMilestoneRepository : JpaRepository<ProjectMilestone, Long>
