package com.cruise.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "issue_attachment")
class IssueAttachment(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(name = "issue_id", nullable = false)
    var issueId: Long = 0,

    @Column(nullable = false, length = 255)
    var filename: String = "",

    @Column(name = "content_type", length = 200)
    var contentType: String? = null,

    @Column(nullable = false)
    var size: Long = 0,

    @Column(name = "storage_path", nullable = false, length = 1000)
    var storagePath: String = "",

    @Column(name = "uploaded_by")
    var uploadedBy: Long? = null,

    @Column(name = "created_at", nullable = false)
    var createdAt: LocalDateTime = LocalDateTime.now()
)
