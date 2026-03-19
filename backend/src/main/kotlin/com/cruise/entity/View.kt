package com.cruise.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.LocalDateTime

@Entity
@Table(name = "saved_view")
class View(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(name = "organization_id", nullable = false)
    var organizationId: Long,

    @Column(name = "team_id")
    var teamId: Long? = null,

    @Column(name = "project_id")
    var projectId: Long? = null,

    @Column(nullable = false, length = 120)
    var name: String,

    @Column(name = "description", length = 500)
    var description: String? = null,

    @Column(name = "filter_json", columnDefinition = "TEXT")
    var filterJson: String? = null,

    @Column(name = "group_by", length = 64)
    var groupBy: String? = null,

    @Column(name = "sort_json", columnDefinition = "TEXT")
    var sortJson: String? = null,

    @Column(nullable = false, length = 32)
    var visibility: String = "WORKSPACE",

    @Column(name = "is_system", nullable = false)
    var isSystem: Boolean = false,

    @Column(name = "created_at", nullable = false)
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
)
