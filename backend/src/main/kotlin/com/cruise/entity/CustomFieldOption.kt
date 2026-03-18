package com.cruise.entity

import jakarta.persistence.*

@Entity
@Table(name = "custom_field_option")
class CustomFieldOption(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(name = "field_definition_id", nullable = false)
    var fieldDefinitionId: Long = 0,

    @Column(name = "option_value", nullable = false, length = 120)
    var value: String = "",

    @Column(nullable = false, length = 120)
    var label: String = "",

    @Column(length = 20)
    var color: String? = null,

    @Column(name = "sort_order", nullable = false)
    var sortOrder: Int = 0,

    @Column(name = "is_active", nullable = false)
    var isActive: Boolean = true
)
