package com.cruise.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "email_intake_config")
class EmailIntakeConfig(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(name = "organization_id", nullable = false)
    var organizationId: Long = 1,

    @Column(name = "team_id")
    var teamId: Long? = null,

    @Column(name = "project_id")
    var projectId: Long? = null,

    @Column(name = "template_id")
    var templateId: Long? = null,

    @Column(nullable = false, length = 255)
    var name: String = "",

    @Column(name = "email_address", nullable = false, unique = true, length = 255)
    var emailAddress: String = "",

    @Column(nullable = false)
    var active: Boolean = true,

    @Column(name = "created_at", nullable = false)
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
)
