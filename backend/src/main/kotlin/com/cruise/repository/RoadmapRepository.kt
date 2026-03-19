package com.cruise.repository

import com.cruise.entity.Roadmap
import org.springframework.data.jpa.repository.JpaRepository

interface RoadmapRepository : JpaRepository<Roadmap, Long>
