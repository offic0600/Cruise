package com.cruise.entity

import jakarta.persistence.*

@Entity
@Table(name = "requirement_tag")
class RequirementTag(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, length = 100)
    val name: String,

    @Column(length = 7)
    val color: String = "#3B82F6",

    @Column(name = "sort_order")
    val sortOrder: Int = 0,

    @Column(name = "created_at")
    val createdAt: java.time.LocalDateTime = java.time.LocalDateTime.now()
) {
    // Required by JPA
    constructor() : this(
        id = 0,
        name = "",
        color = "#3B82F6",
        sortOrder = 0,
        createdAt = java.time.LocalDateTime.now()
    )
}
