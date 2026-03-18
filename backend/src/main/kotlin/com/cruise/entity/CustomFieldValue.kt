package com.cruise.entity

import jakarta.persistence.*
import java.time.LocalDate
import java.time.LocalDateTime

@Entity
@Table(
    name = "custom_field_value",
    uniqueConstraints = [
        UniqueConstraint(columnNames = ["field_definition_id", "entity_type", "entity_id"])
    ]
)
class CustomFieldValue(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(name = "field_definition_id", nullable = false)
    var fieldDefinitionId: Long = 0,

    @Column(name = "entity_type", nullable = false, length = 30)
    var entityType: String = "ISSUE",

    @Column(name = "entity_id", nullable = false)
    var entityId: Long = 0,

    @Column(name = "value_text", length = 4000)
    var valueText: String? = null,

    @Column(name = "value_number")
    var valueNumber: Double? = null,

    @Column(name = "value_boolean")
    var valueBoolean: Boolean? = null,

    @Column(name = "value_date")
    var valueDate: LocalDate? = null,

    @Column(name = "value_datetime")
    var valueDateTime: LocalDateTime? = null,

    @Column(name = "value_json", length = 4000)
    var valueJson: String? = null,

    @Column(name = "created_at", nullable = false)
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
)
