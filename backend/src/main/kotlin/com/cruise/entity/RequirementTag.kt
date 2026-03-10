package com.cruise.entity

import jakarta.persistence.*

@Entity
@Table(name = "requirement_tag")
class RequirementTag(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(nullable = false, length = 100)
    var name: String = "",

    @Column(length = 7)
    var color: String = "#3B82F6",

    @Column(name = "sort_order")
    var sortOrder: Int = 0,

    @Column(name = "created_at")
    var createdAt: java.time.LocalDateTime = java.time.LocalDateTime.now()
)
