package com.cruise.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(
    name = "custom_field_definition",
    uniqueConstraints = [
        UniqueConstraint(columnNames = ["organization_id", "entity_type", "field_key"])
    ]
)
class CustomFieldDefinition(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(name = "organization_id", nullable = false)
    var organizationId: Long = 0,

    @Column(name = "entity_type", nullable = false, length = 30)
    var entityType: String = "ISSUE",

    @Column(name = "scope_type", nullable = false, length = 20)
    var scopeType: String = "GLOBAL",

    @Column(name = "scope_id")
    var scopeId: Long? = null,

    @Column(name = "field_key", nullable = false, length = 80)
    var key: String = "",

    @Column(nullable = false, length = 120)
    var name: String = "",

    @Column(length = 1000)
    var description: String? = null,

    @Column(name = "data_type", nullable = false, length = 30)
    var dataType: String = "TEXT",

    @Column(nullable = false)
    var required: Boolean = false,

    @Column(nullable = false)
    var multiple: Boolean = false,

    @Column(name = "is_active", nullable = false)
    var isActive: Boolean = true,

    @Column(name = "is_visible", nullable = false)
    var isVisible: Boolean = true,

    @Column(name = "is_filterable", nullable = false)
    var isFilterable: Boolean = false,

    @Column(name = "is_sortable", nullable = false)
    var isSortable: Boolean = false,

    @Column(name = "show_on_create", nullable = false)
    var showOnCreate: Boolean = true,

    @Column(name = "show_on_detail", nullable = false)
    var showOnDetail: Boolean = true,

    @Column(name = "show_on_list", nullable = false)
    var showOnList: Boolean = false,

    @Column(name = "sort_order", nullable = false)
    var sortOrder: Int = 0,

    @Column(name = "config_json", length = 4000)
    var configJson: String? = null,

    @Column(name = "created_at", nullable = false)
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
)
