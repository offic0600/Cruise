package com.cruise.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.LocalDateTime

@Entity
@Table(name = "label_definition")
class LabelDefinition(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(name = "organization_id", nullable = false)
    var organizationId: Long = 1,

    @Column(name = "scope_type", nullable = false, length = 20)
    var scopeType: String = "WORKSPACE",

    @Column(name = "scope_id")
    var scopeId: Long? = null,

    @Column(nullable = false, length = 120)
    var name: String = "",

    @Column(name = "name_normalized", nullable = false, length = 120)
    var nameNormalized: String = "",

    @Column(nullable = false, length = 7)
    var color: String = "#3B82F6",

    @Column(length = 500)
    var description: String? = null,

    @Column(name = "sort_order", nullable = false)
    var sortOrder: Int = 0,

    @Column(nullable = false)
    var archived: Boolean = false,

    @Column(name = "created_by")
    var createdBy: Long? = null,

    @Column(name = "created_at", nullable = false)
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
)
