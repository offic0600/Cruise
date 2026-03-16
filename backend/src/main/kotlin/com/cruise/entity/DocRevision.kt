package com.cruise.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.LocalDateTime

@Entity
@Table(name = "doc_revision")
class DocRevision(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(name = "doc_id", nullable = false)
    var docId: Long = 0,

    @Column(name = "version_number", nullable = false)
    var versionNumber: Int = 1,

    @Column(nullable = false, length = 10000)
    var content: String = "",

    @Column(name = "author_id", nullable = false)
    var authorId: Long = 0,

    @Column(name = "created_at")
    var createdAt: LocalDateTime = LocalDateTime.now()
)
