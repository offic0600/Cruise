package com.cruise.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "document_content")
class DocumentContent(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(name = "document_id", nullable = false)
    var documentId: Long = 0,

    @Column(nullable = false, length = 4000)
    var content: String = "",

    @Column(name = "version_number", nullable = false)
    var versionNumber: Int = 1,

    @Column(name = "author_id")
    var authorId: Long? = null,

    @Column(name = "created_at")
    var createdAt: LocalDateTime = LocalDateTime.now()
)
