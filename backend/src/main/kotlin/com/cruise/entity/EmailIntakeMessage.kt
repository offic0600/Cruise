package com.cruise.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(
    name = "email_intake_message",
    uniqueConstraints = [UniqueConstraint(name = "uk_email_intake_message", columnNames = ["config_id", "source_message_id"])]
)
class EmailIntakeMessage(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(name = "config_id", nullable = false)
    var configId: Long = 0,

    @Column(name = "source_message_id", nullable = false, length = 255)
    var sourceMessageId: String = "",

    @Column(name = "sender_email", length = 255)
    var senderEmail: String? = null,

    @Column(length = 255)
    var subject: String? = null,

    @Column(length = 4000)
    var body: String? = null,

    @Column(name = "attachments_json", length = 4000)
    var attachmentsJson: String? = null,

    @Column(name = "processed_issue_id")
    var processedIssueId: Long? = null,

    @Column(name = "processed_at")
    var processedAt: LocalDateTime? = null,

    @Column(name = "created_at", nullable = false)
    var createdAt: LocalDateTime = LocalDateTime.now()
)
