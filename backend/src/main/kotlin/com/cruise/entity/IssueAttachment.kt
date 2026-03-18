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

    @Column(name = "attachment_type", nullable = false, length = 20)
    var attachmentType: String = "FILE",

    @Column(name = "content_type", length = 200)
    var contentType: String? = null,

    @Column(nullable = false)
    var size: Long = 0,

    @Column(name = "storage_path", length = 1000)
    var storagePath: String? = null,

    @Column(name = "external_url", length = 1000)
    var externalUrl: String? = null,

    @Column(name = "link_title", length = 255)
    var linkTitle: String? = null,

    @Column(name = "metadata_json", length = 4000)
    var metadataJson: String? = null,

    @Column(name = "uploaded_by")
    var uploadedBy: Long? = null,

    @Column(name = "created_at", nullable = false)
    var createdAt: LocalDateTime = LocalDateTime.now()
)
