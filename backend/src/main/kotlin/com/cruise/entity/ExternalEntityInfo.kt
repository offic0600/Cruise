package com.cruise.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "external_entity_info")
class ExternalEntityInfo(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(nullable = false, length = 50)
    var service: String = "",

    @Column(name = "entity_type", nullable = false, length = 50)
    var entityType: String = "",

    @Column(name = "entity_id", nullable = false)
    var entityId: Long = 0,

    @Column(name = "external_id", nullable = false, length = 255)
    var externalId: String = "",

    @Column(name = "external_url", length = 1000)
    var externalUrl: String? = null,

    @Column(name = "metadata_json", length = 4000)
    var metadataJson: String? = null,

    @Column(name = "created_at")
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at")
    var updatedAt: LocalDateTime = LocalDateTime.now()
)

