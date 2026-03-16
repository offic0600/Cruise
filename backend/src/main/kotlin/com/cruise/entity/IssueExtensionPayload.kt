package com.cruise.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.LocalDateTime

@Entity
@Table(name = "issue_extension_payload")
class IssueExtensionPayload(
    @Id
    @Column(name = "issue_id")
    var issueId: Long = 0,

    @Column(name = "schema_version", nullable = false)
    var schemaVersion: Int = 1,

    @Column(name = "payload_json", length = 4000)
    var payloadJson: String? = null,

    @Column(name = "updated_at")
    var updatedAt: LocalDateTime = LocalDateTime.now()
)
