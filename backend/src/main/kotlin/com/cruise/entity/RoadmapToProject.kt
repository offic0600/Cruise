package com.cruise.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "roadmap_to_project")
class RoadmapToProject(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(name = "roadmap_id", nullable = false)
    var roadmapId: Long = 0,

    @Column(name = "project_id", nullable = false)
    var projectId: Long = 0,

    @Column(name = "sort_order", nullable = false)
    var sortOrder: Int = 0,

    @Column(name = "created_at")
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at")
    var updatedAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "archived_at")
    var archivedAt: LocalDateTime? = null
)
