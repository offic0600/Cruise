package com.cruise.repository

import com.cruise.entity.RoadmapToProject
import org.springframework.data.jpa.repository.JpaRepository

interface RoadmapToProjectRepository : JpaRepository<RoadmapToProject, Long>
