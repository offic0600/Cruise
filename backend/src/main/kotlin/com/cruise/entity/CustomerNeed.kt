package com.cruise.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "customer_need")
class CustomerNeed(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(name = "customer_id", nullable = false)
    var customerId: Long = 0,

    @Column(name = "project_id")
    var projectId: Long? = null,

    @Column(nullable = false, length = 255)
    var title: String = "",

    @Column(length = 4000)
    var description: String? = null,

    @Column(length = 30, nullable = false)
    var priority: String = "medium",

    @Column(length = 30, nullable = false)
    var status: String = "open",

    @Column(name = "created_at")
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at")
    var updatedAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "archived_at")
    var archivedAt: LocalDateTime? = null
)

