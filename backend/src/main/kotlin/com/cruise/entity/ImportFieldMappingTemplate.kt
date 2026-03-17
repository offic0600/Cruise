package com.cruise.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "import_field_mapping_template")
class ImportFieldMappingTemplate(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(name = "organization_id", nullable = false)
    var organizationId: Long = 0,

    @Column(name = "entity_type", nullable = false, length = 30)
    var entityType: String = "ISSUE",

    @Column(nullable = false, length = 120)
    var name: String = "",

    @Column(name = "source_type", nullable = false, length = 20)
    var sourceType: String = "EXCEL",

    @Column(name = "mapping_json", nullable = false, length = 4000)
    var mappingJson: String = "{}",

    @Column(name = "is_default", nullable = false)
    var isDefault: Boolean = false,

    @Column(name = "created_at", nullable = false)
    var createdAt: LocalDateTime = LocalDateTime.now()
)
