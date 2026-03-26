package com.cruise.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Lob
import jakarta.persistence.Table
import java.time.LocalDateTime

@Entity
@Table(name = "saved_view")
class View(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(name = "organization_id", nullable = false)
    var organizationId: Long = 0,

    @Column(name = "resource_type", nullable = false, length = 30)
    var resourceType: String = "ISSUE",

    @Column(name = "scope_type", nullable = false, length = 30)
    var scopeType: String = "WORKSPACE",

    @Column(name = "scope_id")
    var scopeId: Long? = null,

    @Column(name = "owner_user_id")
    var ownerUserId: Long? = null,

    @Column(nullable = false, length = 120)
    var name: String = "",

    @Column(name = "description", length = 500)
    var description: String? = null,

    @Column(name = "icon", length = 120)
    var icon: String? = null,

    @Column(name = "color", length = 32)
    var color: String? = null,

    @Column(name = "filter_json", columnDefinition = "TEXT")
    var filterJson: String? = null,

    @Column(name = "group_by", length = 64)
    var groupBy: String? = null,

    @Column(name = "sort_json", columnDefinition = "TEXT")
    var sortJson: String? = null,

    @Lob
    @Column(name = "query_state")
    var queryState: String? = null,

    @Column(nullable = false, length = 32)
    var visibility: String = "WORKSPACE",

    @Column(name = "is_system", nullable = false)
    var isSystem: Boolean = false,

    @Column(name = "system_key", length = 64)
    var systemKey: String? = null,

    @Column(name = "position", nullable = false)
    var position: Int = 0,

    @Column(name = "layout", nullable = false, length = 20)
    var layout: String = "LIST",

    @Column(name = "created_at", nullable = false)
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "archived_at")
    var archivedAt: LocalDateTime? = null
)
