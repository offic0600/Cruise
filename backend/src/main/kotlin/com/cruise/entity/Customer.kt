package com.cruise.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "customer")
class Customer(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(name = "organization_id", nullable = false)
    var organizationId: Long = 1,

    @Column(nullable = false, length = 255)
    var name: String = "",

    @Column(length = 64)
    var slugId: String? = null,

    @Column(name = "owner_id")
    var ownerId: Long? = null,

    @Column(name = "status_id")
    var statusId: Long? = null,

    @Column(name = "tier_id")
    var tierId: Long? = null,

    @Column(name = "integration_id")
    var integrationId: Long? = null,

    @Column(length = 512)
    var domains: String? = null,

    @Column(name = "external_ids", length = 1000)
    var externalIds: String? = null,

    @Column(name = "logo_url", length = 1000)
    var logoUrl: String? = null,

    @Column(name = "created_at")
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at")
    var updatedAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "archived_at")
    var archivedAt: LocalDateTime? = null
)

